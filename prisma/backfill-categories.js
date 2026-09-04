// One-time migration: creates the Category rows and links existing services
// to them.
//
// The legacy Service.category string column was dumped to JSON *before* the
// schema push that dropped it (see DUMP_PATH). This script reads that dump
// rather than the live column, so it stays runnable after the column is gone.
// Idempotent — categories are upserted and services are only relinked when
// their categoryId is still null.
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const fs = require("fs");
require("dotenv").config();

const { CATEGORIES } = require("./categories");

const DUMP_PATH = process.env.CATEGORY_DUMP_PATH || "/tmp/service-categories-dump.json";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function main() {
  if (!fs.existsSync(DUMP_PATH)) {
    throw new Error(`Category dump not found at ${DUMP_PATH}. Cannot map services to categories.`);
  }
  const dump = JSON.parse(fs.readFileSync(DUMP_PATH, "utf8"));
  console.log(`Read ${dump.length} services from dump.`);

  // 1. Upsert the known categories. update:{} so a re-run never clobbers
  //    edits an admin has since made in the dashboard.
  const slugByName = new Map();
  for (const cat of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: {},
    });
    slugByName.set(cat.name, row.id);
    console.log(`  category: ${row.name} (${row.slug})`);
  }

  // 2. Any legacy string not covered by CATEGORIES gets an auto-created row
  //    rather than being silently dropped.
  const unknown = [...new Set(dump.map((s) => s.category).filter((c) => c && !slugByName.has(c)))];
  for (const name of unknown) {
    const row = await prisma.category.upsert({
      where: { slug: slugify(name) },
      create: { slug: slugify(name), name, icon: "ph:tag", sortOrder: 99 },
      update: {},
    });
    slugByName.set(name, row.id);
    console.log(`  category (auto): ${row.name} (${row.slug})`);
  }

  // 3. Link services, grouped per category.
  let linked = 0;
  for (const [name, categoryId] of slugByName) {
    const ids = dump.filter((s) => s.category === name).map((s) => s.id);
    if (ids.length === 0) continue;
    const res = await prisma.service.updateMany({
      where: { id: { in: ids }, categoryId: null },
      data: { categoryId },
    });
    linked += res.count;
    console.log(`  linked ${res.count} service(s) -> ${name}`);
  }

  // 4. Assert nothing was left behind.
  const orphans = await prisma.service.count({ where: { categoryId: null } });
  console.log(`\nLinked ${linked} service(s). Services still uncategorised: ${orphans}`);
  if (orphans > 0) {
    console.warn("WARNING: some services have no category. Assign them from /admin/services.");
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
