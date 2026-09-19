/**
 * One-off: adds 3 packages each to the 5 Cleaning & Pest Control services
 * (Premium Car Wash, Water Tank Sanitation, Sofa & Carpet Cleaning, Pest
 * Control, Full Home Cleaning). The services themselves already exist
 * (created by hand in the admin panel, with their own branded hero images)
 * — this script only writes ServicePackage rows, it never touches the
 * Service record itself.
 *
 * Pricing follows the same Urban-Company-style tiering as the rest of the
 * catalog — Full Home Cleaning is priced by BHK size specifically, matching
 * how that category is actually sold in the real market. Every package has
 * its own distinct, verified-live Unsplash image; where a genuinely
 * relevant photo couldn't be found (water tank sanitation), the closest
 * on-topic shots are used rather than reusing the service's hero image.
 *
 * Idempotent via deleteMany + createMany on each run — safe to re-run.
 * Run with: npx tsx prisma/seed-cleaning-pest-packages.ts
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

const CAR_WASH_PACKAGES: PackageSeed[] = [
  {
    name: "Exterior Foam Wash",
    price: 299,
    originalPrice: 449,
    time: "30 mins",
    category: "Bestsellers",
    tag: "Bestseller",
    rating: "4.8 (2,410)",
    image: img("photo-1633014041037-f5446fb4ce99"), // vehicle covered in soap suds
    features: ["Foam wash & rinse", "Tyre & wheel clean", "Doorstep service", "Water-efficient process"],
    details: [
      "Full exterior foam wash with a gentle, scratch-free rinse",
      "Tyre and wheel arch cleaning included",
    ],
  },
  {
    name: "Interior Vacuum & Dashboard Polish",
    price: 499,
    originalPrice: 749,
    time: "45 mins",
    category: "Interior",
    tag: "Popular",
    rating: "4.7 (1,680)",
    image: img("photo-1608506375591-b90e1f955e4b"), // spraying foam on car
    features: ["Full interior vacuum", "Dashboard & console polish", "Seat cleaning", "Odour freshening"],
    details: [
      "Deep vacuuming of seats, mats and boot space",
      "Dashboard and console polishing with a streak-free finish",
    ],
  },
  {
    name: "Premium Full Detailing (In + Out)",
    price: 899,
    originalPrice: 1299,
    time: "75 mins",
    category: "Premium",
    tag: "Premium",
    rating: "4.8 (960)",
    image: img("photo-1611239179213-d972da54091a"), // car with water droplets after wash
    features: ["Exterior foam wash", "Full interior detailing", "Tyre shine", "Glass & mirror polish"],
    details: [
      "Combined exterior foam wash and complete interior detailing in one visit",
      "Finished with tyre shine and streak-free glass polish",
    ],
  },
];

const WATER_TANK_PACKAGES: PackageSeed[] = [
  {
    name: "Overhead Tank Cleaning (up to 1000L)",
    price: 499,
    originalPrice: 749,
    time: "60 mins",
    category: "Bestsellers",
    tag: "Bestseller",
    rating: "4.8 (1,340)",
    image: img("photo-1778178933409-705e5a5c6a48"), // rooftop water tanks
    features: ["6-step mechanized cleaning", "Sludge & sediment removal", "Safe for drinking water", "Free water quality check"],
    details: [
      "Mechanized 6-step cleaning of your rooftop/overhead tank up to 1000L",
      "Removal of sludge, algae and sediment buildup",
    ],
  },
  {
    name: "Underground Sump Cleaning",
    price: 899,
    originalPrice: 1299,
    time: "90 mins",
    category: "Deep Clean",
    tag: "Popular",
    rating: "4.7 (860)",
    image: img("photo-1787672358293-7d58b1fc2d6c"), // green plastic tanks on platform
    features: ["Full sump draining & scrub", "Sediment removal", "Anti-bacterial treatment", "Free water quality check"],
    details: [
      "Complete draining, scrubbing and sediment removal from your underground sump",
      "Anti-bacterial treatment to ensure safe water storage",
    ],
  },
  {
    name: "Complete Sanitation (Overhead + Sump)",
    price: 1299,
    originalPrice: 1899,
    time: "120 mins",
    category: "Premium",
    tag: "Premium",
    rating: "4.7 (520)",
    image: img("photo-1626159073610-d8a964df87b0"), // white water tank on wall
    features: ["Both tanks covered", "6-step mechanized process", "Anti-bacterial treatment", "Free water quality check"],
    details: [
      "Full 6-step mechanized cleaning for both your overhead tank and underground sump",
      "Free before/after water quality check for total peace of mind",
    ],
  },
];

const SOFA_CARPET_PACKAGES: PackageSeed[] = [
  {
    name: "Sofa Deep Cleaning (per seat)",
    price: 199,
    originalPrice: 299,
    time: "30 mins",
    category: "Bestsellers",
    tag: "Bestseller",
    rating: "4.8 (2,010)",
    image: img("photo-1686178827149-6d55c72d81df"), // vacuuming upholstery
    features: ["Deep vacuum & shampoo", "Stain treatment", "Dust mite removal", "Odour-free finish"],
    details: [
      "Deep vacuuming and wet shampooing of fabric or leather sofa seats",
      "Targeted stain treatment and dust-mite removal",
    ],
  },
  {
    name: "Carpet / Rug Shampoo Cleaning",
    price: 349,
    originalPrice: 549,
    time: "45 mins",
    category: "Deep Clean",
    tag: "Popular",
    rating: "4.7 (1,420)",
    image: img("photo-1527515637462-cff94eecc1ac"), // vacuuming carpet
    features: ["Machine shampooing", "Stain & spot removal", "Quick-dry process", "Per sq. ft. pricing"],
    details: [
      "Machine shampooing of carpets and rugs to lift embedded dirt",
      "Quick-dry process so your carpet is usable the same day",
    ],
  },
  {
    name: "Full Home Sofa + Carpet Combo",
    price: 999,
    originalPrice: 1499,
    time: "90 mins",
    category: "Premium",
    tag: "Premium",
    rating: "4.7 (640)",
    image: img("photo-1675255057189-d2bc51eaa4bf"), // chair cleaning
    features: ["All sofas + carpets", "Deep shampoo wash", "Stain & odour treatment", "One visit, full home"],
    details: [
      "Combined deep-cleaning of every sofa and carpet in your home in one visit",
      "Full stain and odour treatment across all upholstery",
    ],
  },
];

const PEST_CONTROL_PACKAGES: PackageSeed[] = [
  {
    name: "General Pest Control (Cockroach & Ants)",
    price: 599,
    originalPrice: 899,
    time: "45 mins",
    category: "Bestsellers",
    tag: "Bestseller",
    rating: "4.8 (2,760)",
    image: img("photo-1593999094742-4f5280054b23"), // protective gear pest control
    features: ["WHO-approved chemicals", "Odourless treatment", "Kitchen & bathroom focus", "30-day guarantee"],
    details: [
      "Odourless, WHO-approved spray treatment targeting cockroaches and ants",
      "Focused coverage of kitchen, bathroom and common entry points",
    ],
  },
  {
    name: "Termite Treatment",
    price: 1499,
    originalPrice: 2199,
    time: "90 mins",
    category: "Specialised",
    tag: "Genuine Parts",
    rating: "4.7 (940)",
    image: img("photo-1749030415358-f533ad412767"), // worker with sprayer
    features: ["Anti-termite chemical barrier", "Wood & foundation treatment", "Post-treatment inspection", "1-year guarantee"],
    details: [
      "Chemical barrier treatment around foundations, wood fittings and furniture",
      "Follow-up inspection included to confirm the infestation is cleared",
    ],
  },
  {
    name: "Bed Bug Treatment",
    price: 999,
    originalPrice: 1499,
    time: "60 mins",
    category: "Specialised",
    tag: "Quick Fix",
    rating: "4.6 (610)",
    image: img("photo-1628267138997-2bd92e89aaf7"), // worker protective attire application
    features: ["Mattress & furniture treatment", "Odourless spray", "Bedroom-focused", "30-day guarantee"],
    details: [
      "Targeted odourless spray treatment for mattresses, bed frames and nearby furniture",
      "30-day guarantee with a free follow-up visit if bed bugs return",
    ],
  },
];

const HOME_CLEANING_PACKAGES: PackageSeed[] = [
  {
    name: "1BHK Deep Cleaning",
    price: 999,
    originalPrice: 1499,
    time: "120 mins",
    category: "Bestsellers",
    tag: "Bestseller",
    rating: "4.8 (2,180)",
    image: img("photo-1740657254989-42fe9c3b8cce"), // cleaning floor with gloves
    features: ["Kitchen & bathroom deep clean", "Floor mopping & vacuuming", "Dusting & cobweb removal", "Doorstep service"],
    details: [
      "Top-to-bottom deep cleaning for a 1BHK, including kitchen and bathroom",
      "Full floor vacuuming, mopping and cobweb removal",
    ],
  },
  {
    name: "2BHK Deep Cleaning",
    price: 1499,
    originalPrice: 2199,
    time: "180 mins",
    category: "Bestsellers",
    tag: "Popular",
    rating: "4.8 (1,860)",
    image: img("photo-1758273705627-937374bfa978"), // vacuuming living room
    features: ["Kitchen & 2 bathroom clean", "Floor mopping & vacuuming", "Balcony & window cleaning", "Doorstep service"],
    details: [
      "Complete deep cleaning for a 2BHK across bedrooms, kitchen and 2 bathrooms",
      "Balcony and window cleaning included",
    ],
  },
  {
    name: "3BHK+ Deep Cleaning",
    price: 1999,
    originalPrice: 2899,
    time: "240 mins",
    category: "Premium",
    tag: "Premium",
    rating: "4.7 (940)",
    image: img("photo-1758273238415-01ec03d9ef27"), // mopping floor modern space
    features: ["Whole-home deep clean", "All kitchens & bathrooms", "Balcony & window cleaning", "Doorstep service"],
    details: [
      "Whole-home deep cleaning for 3BHK and larger homes, room by room",
      "Covers every kitchen, bathroom, balcony and window in the home",
    ],
  },
];

const TARGETS: { slug: string; packages: PackageSeed[] }[] = [
  { slug: "premium-car-wash", packages: CAR_WASH_PACKAGES },
  { slug: "water-tank-sanitation", packages: WATER_TANK_PACKAGES },
  { slug: "sofa-carpet-cleaning-cleaning-pest-control", packages: SOFA_CARPET_PACKAGES },
  { slug: "pest-control-cleaning-pest-control", packages: PEST_CONTROL_PACKAGES },
  { slug: "full-home-cleaning-cleaning-pest-control", packages: HOME_CLEANING_PACKAGES },
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
