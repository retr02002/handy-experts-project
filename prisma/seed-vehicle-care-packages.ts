/**
 * One-off: adds 3 packages each to the 4 Vehicle Care services (Car
 * Service & Repair, Car Denting & Painting, Bike Repair & Service, Car
 * Wash & Spa). The services themselves already exist (created by hand in
 * the admin panel, with their own branded hero images) — this script only
 * writes ServicePackage rows, it never touches the Service record itself.
 *
 * Pricing matches real doorstep car/bike-service marketplace pricing in
 * India (GoMechanic/Pitstop-style for car service, much cheaper for
 * two-wheelers, dent/paint priced by job scope). Every package has its own
 * distinct, verified-live Unsplash image, except Car Denting & Painting's
 * third package — no distinct third dent/paint-shop photo was found beyond
 * the two already used, so it falls back to the service's own hero image
 * per instruction rather than reusing another package's photo.
 *
 * Idempotent via deleteMany + createMany on each run — safe to re-run.
 * Run with: npx tsx prisma/seed-vehicle-care-packages.ts
 */
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface PackageSeed {
  name: string;
  price: number;
  originalPrice: number;
  time: string;
  category: string;
  tag: string;
  rating: string;
  image: string;
  features: string[];
  details: string[];
}

const img = (id: string) => `https://images.unsplash.com/${id}?q=80&w=600&auto=format&fit=crop`;

const CAR_SERVICE_PACKAGES: PackageSeed[] = [
  {
    name: "General Service & Oil Change",
    price: 1499,
    originalPrice: 2199,
    time: "90 mins",
    category: "Bestsellers",
    tag: "Bestseller",
    rating: "4.8 (2,140)",
    image: img("photo-1615906655593-ad0386982a0f"), // mechanic working on car engine
    features: ["Engine oil & filter change", "Multi-point inspection", "Fluid top-up", "Doorstep service"],
    details: [
      "Engine oil and filter replacement with a full multi-point inspection",
      "Coolant, brake and washer fluid top-up included",
    ],
  },
  {
    name: "Brake Inspection & Repair",
    price: 999,
    originalPrice: 1499,
    time: "60 mins",
    category: "Repairs",
    tag: "Popular",
    rating: "4.7 (1,320)",
    image: img("photo-1619642751034-765dfdf7c58e"), // hands with wrench on engine
    features: ["Brake pad/disc check", "Fluid top-up", "Safety test drive", "30-day warranty"],
    details: [
      "Inspection of brake pads, discs and fluid levels, with replacement if worn",
      "Safety test drive after repair to confirm smooth braking",
    ],
  },
  {
    name: "Full Diagnostic Checkup",
    price: 2999,
    originalPrice: 4299,
    time: "120 mins",
    category: "Premium",
    tag: "Premium",
    rating: "4.7 (640)",
    image: img("photo-1625047509248-ec889cbff17f"), // mechanic inspecting engine
    features: ["Full computer diagnostics", "Engine & suspension check", "Detailed report", "No-obligation quote"],
    details: [
      "Complete computer diagnostics covering engine, electricals and suspension",
      "Detailed report with a clear, itemised quote for any issues found",
    ],
  },
];

const CAR_DENTING_PAINTING_PACKAGES: PackageSeed[] = [
  {
    name: "Minor Dent Removal (1 panel)",
    price: 1999,
    originalPrice: 2999,
    time: "90 mins",
    category: "Bestsellers",
    tag: "Bestseller",
    rating: "4.6 (680)",
    image: img("photo-1632605185825-fd583793fa73"), // technician working on vehicle in garage
    features: ["Paintless dent removal", "Panel-by-panel pricing", "Colour-match check", "60-day warranty"],
    details: [
      "Paintless dent removal for a single panel, restoring the original shape",
      "Colour-match check to ensure no visible difference after the fix",
    ],
  },
  {
    name: "Full Body Denting & Painting",
    price: 14999,
    originalPrice: 19999,
    time: "480 mins",
    category: "Premium",
    tag: "Premium",
    rating: "4.6 (240)",
    image: img("photo-1632605192331-085fa2082575"), // spray-painting vehicle
    features: ["Full-body denting", "Oven-baked paint job", "Factory-finish colour match", "1-year warranty"],
    details: [
      "Complete body denting followed by an oven-baked paint job across every panel",
      "Factory-finish colour matching for a showroom-fresh look",
    ],
  },
  {
    name: "Scratch Removal & Touch-up",
    price: 1499,
    originalPrice: 2299,
    time: "60 mins",
    category: "Repairs",
    tag: "Popular",
    rating: "4.5 (410)",
    image: "", // resolved to the service's own hero image at seed time — see main()
    features: ["Scratch buffing", "Touch-up paint", "Clear coat finish", "30-day warranty"],
    details: [
      "Buffing out surface scratches and applying matched touch-up paint where needed",
      "Finished with a protective clear coat",
    ],
  },
];

const BIKE_REPAIR_PACKAGES: PackageSeed[] = [
  {
    name: "General Bike Service",
    price: 399,
    originalPrice: 599,
    time: "45 mins",
    category: "Bestsellers",
    tag: "Bestseller",
    rating: "4.7 (2,610)",
    image: img("photo-1636761358757-0a616eb9e17e"), // mechanic working on motorcycle
    features: ["Full inspection", "Chain lubrication", "Basic tuning", "Doorstep service"],
    details: [
      "Full inspection covering chain, brakes, tyres and electricals",
      "Chain lubrication and basic carburettor/injection tuning",
    ],
  },
  {
    name: "Engine Oil Change & Tuning",
    price: 599,
    originalPrice: 899,
    time: "60 mins",
    category: "Repairs",
    tag: "Popular",
    rating: "4.7 (1,860)",
    image: img("photo-1623220988124-bcd1bad9a408"), // mechanic working on motorcycle engine
    features: ["Engine oil change", "Filter replacement", "Idle & throttle tuning", "30-day warranty"],
    details: [
      "Engine oil and filter replacement with genuine or customer-preferred grade oil",
      "Idle speed and throttle response tuning after the change",
    ],
  },
  {
    name: "Brake & Tyre Check",
    price: 299,
    originalPrice: 449,
    time: "30 mins",
    category: "Installation",
    tag: "Quick Fix",
    rating: "4.6 (930)",
    image: img("photo-1534637950656-9e6753b6da6b"), // mechanic repairing motorcycle
    features: ["Brake pad check", "Tyre pressure & wear check", "Chain slack adjustment", "Doorstep service"],
    details: [
      "Brake pad wear check and tyre pressure/tread inspection",
      "Chain slack adjustment for smoother, safer rides",
    ],
  },
];

const CAR_WASH_SPA_PACKAGES: PackageSeed[] = [
  {
    name: "Exterior Wash & Shine",
    price: 299,
    originalPrice: 449,
    time: "30 mins",
    category: "Bestsellers",
    tag: "Bestseller",
    rating: "4.8 (2,890)",
    image: img("photo-1652898072202-5084dc85b850"), // sponge wash on vehicle
    features: ["Foam wash & rinse", "Tyre & wheel clean", "Quick-dry finish", "Doorstep service"],
    details: [
      "Full exterior foam wash with a scratch-free rinse and quick-dry finish",
      "Tyre and wheel arch cleaning included",
    ],
  },
  {
    name: "Wax & Polish",
    price: 799,
    originalPrice: 1199,
    time: "60 mins",
    category: "Premium",
    tag: "Popular",
    rating: "4.7 (1,240)",
    image: img("photo-1708805282706-f44730b7e527"), // technician applying wax
    features: ["Hand-applied wax coat", "Machine polish", "Gloss finish", "60-day protection"],
    details: [
      "Hand-applied wax coating followed by machine polishing for a deep gloss",
      "Protective finish that lasts up to 60 days",
    ],
  },
  {
    name: "Scratch & Swirl Removal",
    price: 1299,
    originalPrice: 1899,
    time: "90 mins",
    category: "Premium",
    tag: "Premium",
    rating: "4.6 (520)",
    image: img("photo-1632823469901-5d2cfff5ba50"), // sander on vehicle surface
    features: ["Machine buffing", "Swirl mark removal", "Paint correction", "Gloss restoration"],
    details: [
      "Machine buffing to remove light scratches and swirl marks from the paint",
      "Finished with a gloss-restoring polish pass",
    ],
  },
];

async function main() {
  // Resolve the Car Denting & Painting hero image for its one fallback package.
  const dentPaintService = await prisma.service.findUnique({
    where: { slug: "car-denting-painting-vehicle-care" },
    select: { id: true, title: true, image: true },
  });
  if (dentPaintService) {
    CAR_DENTING_PAINTING_PACKAGES[2].image =
      dentPaintService.image ?? img("photo-1632605185825-fd583793fa73");
  }

  const targets: { slug: string; packages: PackageSeed[] }[] = [
    { slug: "car-service-repair", packages: CAR_SERVICE_PACKAGES },
    { slug: "car-denting-painting-vehicle-care", packages: CAR_DENTING_PAINTING_PACKAGES },
    { slug: "bike-repair-service-vehicle-care", packages: BIKE_REPAIR_PACKAGES },
    { slug: "car-wash-spa-vehicle-care", packages: CAR_WASH_SPA_PACKAGES },
  ];

  for (const target of targets) {
    const service = await prisma.service.findUnique({ where: { slug: target.slug }, select: { id: true, title: true } });
    if (!service) {
      console.warn(`⚠ Service "${target.slug}" not found — skipping.`);
      continue;
    }

    await prisma.servicePackage.deleteMany({ where: { serviceId: service.id } });
    await prisma.servicePackage.createMany({
      data: target.packages.map((p) => ({
        serviceId: service.id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        time: p.time,
        category: p.category,
        tag: p.tag,
        rating: p.rating,
        image: p.image,
        features: p.features as unknown as Prisma.InputJsonValue,
        details: p.details as unknown as Prisma.InputJsonValue,
      })),
    });

    console.log(`✓ ${service.title} (/services/${target.slug}) — ${target.packages.length} packages`);
  }

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
