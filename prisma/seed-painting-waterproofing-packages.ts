/**
 * One-off: adds 3 packages each to the Waterproofing and Interior Painting
 * services (slugs: waterproofing-painting-water-proofing,
 * interior-painting-painting-water-proofing — under the
 * painting-water-proofing category). The services themselves already exist
 * (created by hand in the admin panel, with their own branded hero images)
 * — this script only writes ServicePackage rows, it never touches the
 * Service record itself.
 *
 * Package names for Waterproofing match the "Roof & Terrace Waterproofing"
 * / "Wall Waterproofing" badges already shown on its own hero card. No
 * authentic free-licence Unsplash photo of literal bathroom/wet-area
 * waterproofing work was found, so that one package falls back to the
 * service's own hero image, per instruction.
 *
 * Pricing follows real-world painting/waterproofing pricing (scoped by
 * room/area size, matching how Urban Company actually prices this
 * category) rather than the smaller per-visit fees used elsewhere in the
 * catalog. Every other package has its own distinct, verified-live
 * Unsplash image.
 *
 * Idempotent via deleteMany + createMany on each run — safe to re-run.
 * Run with: npx tsx prisma/seed-painting-waterproofing-packages.ts
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

async function buildWaterproofingPackages(): Promise<PackageSeed[]> {
  // Fallback to the service's own hero image for the one package with no
  // authentic matching stock photo available.
  const service = await prisma.service.findUnique({
    where: { slug: "waterproofing-painting-water-proofing" },
    select: { image: true },
  });
  const fallbackImage = service?.image ?? img("photo-1533738630286-f1f4a61705f8");

  return [
    {
      name: "Roof & Terrace Waterproofing",
      price: 2999,
      originalPrice: 4499,
      time: "240 mins",
      category: "Bestsellers",
      tag: "Bestseller",
      rating: "4.7 (860)",
      image: img("photo-1563174499-c1a4e1aa55ee"), // rain water pooling on roof
      features: ["Membrane coating", "Crack sealing", "5-year warranty", "Per sq. ft. pricing"],
      details: [
        "Application of a waterproof membrane coating across the full roof/terrace area",
        "Crack sealing and surface levelling before coating",
      ],
    },
    {
      name: "Wall Waterproofing & Dampness Treatment",
      price: 1499,
      originalPrice: 2299,
      time: "150 mins",
      category: "Repairs",
      tag: "Popular",
      rating: "4.6 (720)",
      image: img("photo-1533738630286-f1f4a61705f8"), // weathered brick wall with damp plaster
      features: ["Seepage treatment", "Anti-fungal coating", "Peeling paint fix", "2-year warranty"],
      details: [
        "Treatment of seepage and damp patches causing peeling paint or fungal growth",
        "Finished with a protective anti-fungal waterproof coating",
      ],
    },
    {
      name: "Bathroom & Wet Area Waterproofing",
      price: 999,
      originalPrice: 1499,
      time: "90 mins",
      category: "Installation",
      tag: "Genuine Parts",
      rating: "4.6 (410)",
      image: fallbackImage,
      features: ["Floor & wall sealing", "Grout & tile joint treatment", "Leak-proof finish", "2-year warranty"],
      details: [
        "Sealing of bathroom floor, wall joints and grout lines against leaks",
        "Leak-proof finish tested before handover",
      ],
    },
  ];
}

const INTERIOR_PAINTING_PACKAGES: PackageSeed[] = [
  {
    name: "Single Room Painting",
    price: 2499,
    originalPrice: 3499,
    time: "240 mins",
    category: "Bestsellers",
    tag: "Bestseller",
    rating: "4.7 (1,340)",
    image: img("photo-1562259949-e8e7689d7828"), // roller applying blue paint to wall
    features: ["Premium emulsion paint", "Dust-free sanding", "Furniture protection", "1-year warranty"],
    details: [
      "Two-coat premium emulsion painting for one room, including ceiling touch-up",
      "Dust-free sanding and full furniture covering before work begins",
    ],
  },
  {
    name: "Full Home Interior Painting (2BHK)",
    price: 7999,
    originalPrice: 10999,
    time: "480 mins",
    category: "Full Home",
    tag: "Popular",
    rating: "4.7 (860)",
    image: img("photo-1693985120993-e9b203ce7631"), // painter rolling interior wall
    features: ["Whole-home coverage", "Premium emulsion paint", "Wall putty included", "1-year warranty"],
    details: [
      "Complete interior painting for a 2BHK, room by room, with premium emulsion paint",
      "Wall putty application included for a smooth, even finish",
    ],
  },
  {
    name: "Wall Putty & Primer Treatment",
    price: 1499,
    originalPrice: 2199,
    time: "180 mins",
    category: "Prep Work",
    tag: "Quick Fix",
    rating: "4.6 (520)",
    image: img("photo-1715021927612-63269dacb5ea"), // painter with roller by window
    features: ["Crack & hole filling", "Wall putty coat", "Primer application", "Smooth finish guaranteed"],
    details: [
      "Filling of cracks and holes followed by a full wall putty coat",
      "Primer application to prep the surface for a fresh coat of paint",
    ],
  },
];

async function main() {
  const waterproofingPackages = await buildWaterproofingPackages();
  const targets: { slug: string; packages: PackageSeed[] }[] = [
    { slug: "waterproofing-painting-water-proofing", packages: waterproofingPackages },
    { slug: "interior-painting-painting-water-proofing", packages: INTERIOR_PAINTING_PACKAGES },
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
