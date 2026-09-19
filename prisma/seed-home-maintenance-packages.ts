/**
 * One-off: adds 3 packages each to the Electrician, Plumber and Carpenter
 * services (slugs: electrician, plumber, carpenter — under the
 * home-services-maintainence category). The services themselves already
 * exist (created by hand in the admin panel, with their own branded hero
 * images) — this script only writes ServicePackage rows, it never touches
 * the Service record itself.
 *
 * Pricing follows the same Urban-Company-style tiering as the rest of the
 * catalog (see seed-appliance-services.ts / seed-home-services.ts):
 * a cheap inspection/diagnosis tier, a mid-price repair tier, and a
 * higher-price installation/premium tier. Every package has its own
 * distinct, verified-live Unsplash image — never reused across packages.
 *
 * Idempotent via deleteMany + createMany on each run — safe to re-run.
 * Run with: npx tsx prisma/seed-home-maintenance-packages.ts
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

const ELECTRICIAN_PACKAGES: PackageSeed[] = [
  {
    name: "Electrical Safety Inspection",
    price: 199,
    originalPrice: 349,
    time: "30 mins",
    category: "Bestsellers",
    tag: "Bestseller",
    rating: "4.8 (2,240)",
    image: img("photo-1621905251189-08b45d6a269e"), // electrician installing wiring
    features: ["Full circuit inspection", "Fuse/MCB check", "No-obligation quote", "All issues covered"],
    details: [
      "Complete inspection of your main switchboard, MCBs and wall outlets to spot fire/shock risks",
      "Clear, itemised quote for any repair work before we start",
    ],
  },
  {
    name: "Switchboard & Wiring Repair",
    price: 499,
    originalPrice: 799,
    time: "60 mins",
    category: "Repairs",
    tag: "Popular",
    rating: "4.7 (1,610)",
    image: img("photo-1758101755915-462eddc23f57"), // electrician testing panel with multimeter
    features: ["ISI-marked wiring/switches", "Short-circuit fix", "Load testing", "30-day warranty"],
    details: [
      "Replacement of burnt wiring or faulty switchboards with ISI-marked cables and switches",
      "Full load test after repair to confirm stable, safe power flow",
    ],
  },
  {
    name: "Fan / Light Fixture Installation",
    price: 349,
    originalPrice: 549,
    time: "45 mins",
    category: "Installation",
    tag: "Quick Fix",
    rating: "4.7 (1,180)",
    image: img("photo-1615774925655-a0e97fc85c14"), // electrician hard hat testing panel
    features: ["Ceiling fan mounting", "Light fixture wiring", "Secure hook/bracket", "30-day warranty"],
    details: [
      "Secure mounting and wiring for a new ceiling fan or light fixture",
      "Balance and safety check after installation",
    ],
  },
];

const PLUMBER_PACKAGES: PackageSeed[] = [
  {
    name: "Leak Detection & Inspection",
    price: 199,
    originalPrice: 349,
    time: "30 mins",
    category: "Bestsellers",
    tag: "Bestseller",
    rating: "4.8 (2,760)",
    image: img("photo-1676210134188-4c05dd172f89"), // tradesperson on wall-mounted piping
    features: ["Full pipe & joint check", "Drainage inspection", "No-obligation quote", "All brands covered"],
    details: [
      "Inspection of visible and hidden water lines, joints and drainage for the source of a leak",
      "Clear, itemised quote before any repair work begins",
    ],
  },
  {
    name: "Tap / Pipe Repair & Replacement",
    price: 399,
    originalPrice: 649,
    time: "45 mins",
    category: "Repairs",
    tag: "Popular",
    rating: "4.7 (1,920)",
    image: img("photo-1676210134050-6f12c6898395"), // worker fixing toilet plumbing
    features: ["Tap/valve replacement", "Pipe joint resealing", "Drain unclogging", "30-day warranty"],
    details: [
      "Replacement of leaking taps, angle valves or damaged pipe sections",
      "Unclogging of choked drains and resealing of loose joints",
    ],
  },
  {
    name: "Bathroom Fixture Installation",
    price: 599,
    originalPrice: 899,
    time: "60 mins",
    category: "Installation",
    tag: "Genuine Parts",
    rating: "4.6 (940)",
    image: img("photo-1676210134190-3f2c0d5cf58d"), // professional servicing water heater/fixture
    features: ["Washbasin/toilet install", "Showerhead fitting", "Leak-free sealing", "60-day warranty"],
    details: [
      "Installation of a new washbasin, toilet or high-pressure showerhead",
      "Leak-free sealing and a full water-pressure test after fitting",
    ],
  },
];

const CARPENTER_PACKAGES: PackageSeed[] = [
  {
    name: "Furniture Inspection & Consultation",
    price: 249,
    originalPrice: 399,
    time: "30 mins",
    category: "Bestsellers",
    tag: "Bestseller",
    rating: "4.8 (1,540)",
    image: img("photo-1659930087003-2d64e33181f7"), // marking measurements on wood board
    features: ["On-site assessment", "Wood/hinge inspection", "No-obligation quote", "Custom design advice"],
    details: [
      "On-site inspection of damaged furniture, doors or cabinets to assess the repair needed",
      "Clear, itemised quote before any work begins",
    ],
  },
  {
    name: "Door / Window / Cabinet Repair",
    price: 449,
    originalPrice: 699,
    time: "60 mins",
    category: "Repairs",
    tag: "Popular",
    rating: "4.7 (1,280)",
    image: img("photo-1631396326646-c06a935ff3a6"), // craftsperson chair assembly workshop
    features: ["Hinge/lock alignment", "Jammed door/drawer fix", "Termite-resistant wood", "30-day warranty"],
    details: [
      "Realignment and repair of jammed doors, cabinet hinges and sticking drawers",
      "Replacement parts sourced from termite-resistant, treated timber",
    ],
  },
  {
    name: "Custom Furniture & Woodwork",
    price: 1499,
    originalPrice: 2199,
    time: "120 mins",
    category: "Installation",
    tag: "Premium",
    rating: "4.6 (620)",
    image: img("photo-1547609434-b732edfee020"), // person using saw to cut wood
    features: ["Custom-built to size", "Premium treated wood", "Wardrobe/shelf/kitchen units", "60-day warranty"],
    details: [
      "Bespoke wardrobes, shelving or modular kitchen units built to your exact room dimensions",
      "Finished with premium, chemically treated timber for long-term durability",
    ],
  },
];

const TARGETS: { slug: string; packages: PackageSeed[] }[] = [
  { slug: "electrician", packages: ELECTRICIAN_PACKAGES },
  { slug: "plumber", packages: PLUMBER_PACKAGES },
  { slug: "carpenter", packages: CARPENTER_PACKAGES },
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
