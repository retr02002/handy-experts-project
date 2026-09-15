/**
 * One-time backfill for the modular category/service skill system.
 *
 * 1. Best-effort matches each technician's legacy free-text `skillCategory`
 *    against a real `Category.name` (exact, then loose substring either
 *    direction) and creates the corresponding `TechnicianCategory` row.
 *    Anything that doesn't match is reported and left uncategorized — never
 *    guessed at.
 * 2. Seeds each vendor's starting `VendorCategory` set from the union of
 *    categories just backfilled onto their own technicians — the mitigation
 *    for the category gate being immediate (a vendor with zero categories
 *    sees zero live calls the moment this ships).
 *
 * Idempotent: uses createMany with skipDuplicates, safe to re-run.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function main() {
  const categories = await prisma.category.findMany({ select: { id: true, name: true } });
  const technicians = await prisma.technicianProfile.findMany({
    select: { id: true, skillCategory: true, vendorId: true, user: { select: { name: true } } },
  });

  const matched: { technicianId: string; technicianName: string; categoryId: string; categoryName: string }[] = [];
  const unmatched: { technicianId: string; technicianName: string; skillCategory: string }[] = [];

  for (const t of technicians) {
    const normSkill = normalize(t.skillCategory);
    let match = categories.find((c) => normalize(c.name) === normSkill);
    if (!match) {
      match = categories.find((c) => normalize(c.name).includes(normSkill) || normSkill.includes(normalize(c.name)));
    }
    if (match) {
      matched.push({ technicianId: t.id, technicianName: t.user.name ?? "", categoryId: match.id, categoryName: match.name });
    } else {
      unmatched.push({ technicianId: t.id, technicianName: t.user.name ?? "", skillCategory: t.skillCategory });
    }
  }

  if (matched.length > 0) {
    await prisma.technicianCategory.createMany({
      data: matched.map((m) => ({ technicianId: m.technicianId, categoryId: m.categoryId })),
      skipDuplicates: true,
    });
  }

  console.log(`\n=== Technician backfill ===`);
  console.log(`Matched (${matched.length}):`);
  for (const m of matched) console.log(`  ${m.technicianName.padEnd(20)} "${m.categoryName}"`);
  console.log(`Unmatched — need manual assignment (${unmatched.length}):`);
  for (const u of unmatched) console.log(`  ${u.technicianName.padEnd(20)} skillCategory="${u.skillCategory}" (no match)`);

  // Vendor auto-seed: union of each vendor's own technicians' just-backfilled categories.
  const matchedByTechnician = new Map(matched.map((m) => [m.technicianId, m]));
  const vendorCategoryIds = new Map<string, Set<string>>();
  for (const t of technicians) {
    if (!t.vendorId) continue;
    const m = matchedByTechnician.get(t.id);
    if (!m) continue;
    if (!vendorCategoryIds.has(t.vendorId)) vendorCategoryIds.set(t.vendorId, new Set());
    vendorCategoryIds.get(t.vendorId)!.add(m.categoryId);
  }

  const vendorCategoryRows = [...vendorCategoryIds.entries()].flatMap(([vendorId, categoryIds]) =>
    [...categoryIds].map((categoryId) => ({ vendorId, categoryId }))
  );
  if (vendorCategoryRows.length > 0) {
    await prisma.vendorCategory.createMany({ data: vendorCategoryRows, skipDuplicates: true });
  }

  console.log(`\n=== Vendor category auto-seed ===`);
  const allVendors = await prisma.vendorProfile.findMany({ select: { id: true, companyName: true } });
  for (const v of allVendors) {
    const seeded = vendorCategoryIds.get(v.id);
    if (seeded && seeded.size > 0) {
      const names = categories.filter((c) => seeded.has(c.id)).map((c) => c.name);
      console.log(`  ${v.companyName.padEnd(30)} seeded: ${names.join(", ")}`);
    } else {
      console.log(`  ${v.companyName.padEnd(30)} ⚠️  ZERO categories — will see NO live calls until admin assigns some`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
