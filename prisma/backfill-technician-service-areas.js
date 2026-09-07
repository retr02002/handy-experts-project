// One-time migration: gives every pre-existing technician one
// TechnicianServiceArea row (geocoded from their servicePincode, radiusKm 15)
// so the vendor/admin live-calls maps have a coverage circle to show for
// technicians who predate the "Serviceable Areas" feature. Idempotent —
// skips any technician who already has at least one area row.
//
// Same geocode logic as src/lib/geocode.ts, duplicated in plain JS here
// since this script is CommonJS (mirrors backfill-vendor-service-areas.js).
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
  const technicians = await prisma.technicianProfile.findMany({
    select: {
      id: true,
      servicePincode: true,
      user: { select: { name: true } },
      _count: { select: { serviceAreas: true } },
    },
  });
  console.log(`Found ${technicians.length} technician(s).`);

  let seeded = 0;
  let skipped = 0;
  const failed = [];

  for (const tech of technicians) {
    if (tech._count.serviceAreas > 0) {
      skipped++;
      continue;
    }

    const coords = await forwardGeocodePincode(tech.servicePincode);
    if (!coords) {
      failed.push({ id: tech.id, name: tech.user.name, pincode: tech.servicePincode });
      continue;
    }

    await prisma.technicianServiceArea.create({
      data: {
        technicianId: tech.id,
        pincode: tech.servicePincode,
        latitude: coords.latitude,
        longitude: coords.longitude,
        radiusKm: BACKFILL_RADIUS_KM,
      },
    });
    seeded++;
    console.log(`  seeded: ${tech.user.name ?? tech.id} (${tech.servicePincode})`);
  }

  console.log(`\nSeeded ${seeded} area(s). Already had areas: ${skipped}. Failed to geocode: ${failed.length}.`);
  if (failed.length > 0) {
    console.warn("WARNING: these technicians have zero serviceable areas and won't show a coverage circle until one is added manually:");
    for (const f of failed) console.warn(`  - ${f.name} (technicianId ${f.id}, pincode ${f.pincode})`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
