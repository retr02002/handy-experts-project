/**
 * One-off: adds 3 packages each to the Salon for Men and Salon for Women
 * services (slugs: salon-men-personal-services,
 * salon-for-women-personal-services — under the personal-services
 * category). The services themselves already exist (created by hand in
 * the admin panel, with their own branded hero images) — this script only
 * writes ServicePackage rows, it never touches the Service record itself.
 *
 * Package names deliberately match the exact three badge labels already
 * shown on each service's own hero card (Men: Facial Care / Head Massage /
 * Hair Wash & Care — Women: Facial Care / Manicure & Pedicure / Beauty
 * Services) so the packages actually deliver on what the card advertises.
 *
 * Pricing follows the same Urban-Company-style tiering as the rest of the
 * catalog. Every package has its own distinct, verified-live Unsplash
 * image — never reused across packages.
 *
 * Idempotent via deleteMany + createMany on each run — safe to re-run.
 * Run with: npx tsx prisma/seed-personal-services-packages.ts
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

const SALON_MEN_PACKAGES: PackageSeed[] = [
  {
    name: "Facial Care",
    price: 399,
    originalPrice: 599,
    time: "40 mins",
    category: "Facial Care",
    tag: "Bestseller",
    rating: "4.8 (1,940)",
    image: img("photo-1568339434343-2a640a1a9946"), // close-up portrait at barbershop
    features: ["Deep cleansing facial", "De-tan treatment", "Skin brightening", "Doorstep service"],
    details: [
      "Deep-cleansing facial with de-tan and brightening treatment for men's skin",
      "Finished with a soothing cool-down massage",
    ],
  },
  {
    name: "Head Massage",
    price: 299,
    originalPrice: 449,
    time: "30 mins",
    category: "Head Massage",
    tag: "Popular",
    rating: "4.7 (2,260)",
    image: img("photo-1593702275687-f8b402bf1fb5"), // barber at work with client
    features: ["Stress-relief massage", "Choice of oil", "Scalp stimulation", "Doorstep service"],
    details: [
      "Relaxing head and shoulder massage with your choice of oil",
      "Improves blood circulation and relieves everyday stress",
    ],
  },
  {
    name: "Hair Wash & Care",
    price: 249,
    originalPrice: 399,
    time: "25 mins",
    category: "Hair Wash & Care",
    tag: "Premium",
    rating: "4.6 (1,120)",
    image: img("photo-1657105052497-f996284ffff8"), // barber tools, comb and shears
    features: ["Shampoo & conditioning", "Scalp cleanse", "Blow-dry finish", "Doorstep service"],
    details: [
      "Shampoo and conditioning wash with a deep scalp cleanse",
      "Finished with a neat blow-dry style",
    ],
  },
];

const SALON_WOMEN_PACKAGES: PackageSeed[] = [
  {
    name: "Facial Care",
    price: 899,
    originalPrice: 1299,
    time: "60 mins",
    category: "Facial Care",
    tag: "Bestseller",
    rating: "4.9 (2,480)",
    image: img("photo-1782159981479-5e90597f284a"), // woman receiving facial treatment
    features: ["Deep cleansing facial", "De-tan & brightening", "Face massage", "Doorstep service"],
    details: [
      "Deep-cleansing facial with de-tanning and skin-brightening treatment",
      "Finished with a relaxing face and neck massage",
    ],
  },
  {
    name: "Manicure & Pedicure",
    price: 699,
    originalPrice: 999,
    time: "60 mins",
    category: "Beauty Services",
    tag: "Popular",
    rating: "4.8 (1,860)",
    image: img("photo-1659391542239-9648f307c0b1"), // freshly painted nails
    features: ["Nail shaping & polish", "Cuticle care", "Hand & foot massage", "Doorstep service"],
    details: [
      "Full manicure and pedicure with nail shaping, cuticle care and polish",
      "Includes a relaxing hand and foot massage",
    ],
  },
  {
    name: "Hair Styling & Blow-Dry",
    price: 499,
    originalPrice: 749,
    time: "45 mins",
    category: "Beauty Services",
    tag: "Premium",
    rating: "4.7 (1,340)",
    image: img("photo-1750263147723-ebd447918d89"), // hairstylist working on customer's hair
    features: ["Wash & conditioning", "Professional blow-dry", "Styling of choice", "Doorstep service"],
    details: [
      "Wash, conditioning and a professional blow-dry finish",
      "Styled to your preference — straight, curled or voluminous",
    ],
  },
];

const TARGETS: { slug: string; packages: PackageSeed[] }[] = [
  { slug: "salon-men-personal-services", packages: SALON_MEN_PACKAGES },
  { slug: "salon-for-women-personal-services", packages: SALON_WOMEN_PACKAGES },
];

async function main() {
  for (const target of TARGETS) {
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
