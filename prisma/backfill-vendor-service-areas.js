// One-time migration: gives every pre-existing vendor one VendorServiceArea
// row (geocoded from their business pincode, radiusKm 15 to mirror the old
// flat DEFAULT_RADIUS_KM broadcast radius) so the new area-based live-call
// matching doesn't silently cut off vendors who never touched the new
// "Serviceable Areas" page. Idempotent — skips any vendor who already has
// at least one area row, so it's safe to re-run.
//
// Same geocode logic as src/lib/geocode.ts, duplicated in plain JS here
// since this script is CommonJS and the project has no ts-node/tsx set up
// (mirrors how backfill-categories.js duplicates slugify()).
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BACKFILL_RADIUS_KM = 15;

async function forwardGeocodePincode(pincode) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&postalcode=${encodeURIComponent(pincode)}&country=India&limit=1`,
      { headers: { "User-Agent": "Handyzo/1.0 (hello@Handyzo.in)" } }
    );
    if (!res.ok) return null;
    const results = await res.json();
    const top = results?.[0];
    if (!top) return null;
    const latitude = parseFloat(top.lat);
    const longitude = parseFloat(top.lon);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
    return { latitude, longitude };
  } catch (error) {
    console.error(`  geocode failed for pincode:`, error.message);
    return null;
  }
}

async function main() {
  const vendors = await prisma.vendorProfile.findMany({
    select: { id: true, companyName: true, pincode: true, _count: { select: { serviceAreas: true } } },
  });
  console.log(`Found ${vendors.length} vendor(s).`);

  let seeded = 0;
  let skipped = 0;
  const failed = [];

  for (const vendor of vendors) {
    if (vendor._count.serviceAreas > 0) {
      skipped++;
      continue;
    }

    const coords = await forwardGeocodePincode(vendor.pincode);
    if (!coords) {
      failed.push({ id: vendor.id, companyName: vendor.companyName, pincode: vendor.pincode });
      continue;
    }

    await prisma.vendorServiceArea.create({
      data: {
        vendorId: vendor.id,
        pincode: vendor.pincode,
        latitude: coords.latitude,
        longitude: coords.longitude,
        radiusKm: BACKFILL_RADIUS_KM,
      },
    });
    seeded++;
    console.log(`  seeded: ${vendor.companyName} (${vendor.pincode})`);
  }

  console.log(`\nSeeded ${seeded} area(s). Already had areas: ${skipped}. Failed to geocode: ${failed.length}.`);
  if (failed.length > 0) {
    console.warn("WARNING: these vendors have zero serviceable areas and will receive zero live calls until one is added manually:");
    for (const f of failed) console.warn(`  - ${f.companyName} (vendorId ${f.id}, pincode ${f.pincode})`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
