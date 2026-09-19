/**
 * One-off: adds 3 packages each to the Solar Panel Installation, Solar
 * Inverter Repair and Solar Panel Cleaning & Maintenance services (under
 * the solar-installation-services category). The services themselves
 * already exist (created by hand in the admin panel, with their own
 * branded hero images) — this script only writes ServicePackage rows, it
 * never touches the Service record itself.
 *
 * Pricing reflects real-world solar economics rather than the smaller
 * per-visit fees used elsewhere in the catalog: installation is priced as
 * a genuine capex item (a real 3kW rooftop install runs ₹1.5-2L in India),
 * inverter replacement is priced near real hardware cost, and cleaning is
 * priced as a light, repeatable service — matching how this category
 * actually gets sold rather than treating it like a small home repair.
 *
 * Every package has its own distinct, verified-live Unsplash image.
 *
 * Idempotent via deleteMany + createMany on each run — safe to re-run.
 * Run with: npx tsx prisma/seed-solar-packages.ts
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

const SOLAR_INSTALLATION_PACKAGES: PackageSeed[] = [
  {
    name: "Site Survey & System Design",
    price: 999,
    originalPrice: 1499,
    time: "60 mins",
    category: "Bestsellers",
    tag: "Bestseller",
    rating: "4.8 (410)",
    image: img("photo-1624397640148-949b1732bb0a"), // installer mounting panel on roof
    features: ["Roof suitability survey", "Load capacity plan", "Custom system design", "Detailed cost estimate"],
    details: [
      "On-site survey of roof space, sunlight exposure and structural suitability",
      "Custom system sizing and a detailed, itemised cost estimate",
    ],
  },
  {
    name: "Rooftop Panel Installation (up to 3kW)",
    price: 149999,
    originalPrice: 179999,
    time: "480 mins",
    category: "Installation",
    tag: "Popular",
    rating: "4.7 (260)",
    image: img("photo-1694327671725-e2a81cda3436"), // rows of solar panels on roof
    features: ["Panels + mounting structure", "Full wiring & earthing", "5-year installation warranty", "Includes site survey"],
    details: [
      "Complete rooftop installation of a up-to-3kW solar panel system with mounting structure",
      "Full electrical wiring, earthing and safety compliance included",
    ],
  },
  {
    name: "Grid-Tie & Net Metering Setup",
    price: 14999,
    originalPrice: 19999,
    time: "180 mins",
    category: "Installation",
    tag: "Premium",
    rating: "4.6 (140)",
    image: img("photo-1694248407533-d74c41fb5b68"), // group of solar panels on roof
    features: ["Grid-tie inverter setup", "Net meter installation", "Utility approval assistance", "System commissioning"],
    details: [
      "Grid-tie inverter configuration and net metering setup for utility export",
      "Assistance with utility approvals and final system commissioning",
    ],
  },
];

const SOLAR_INVERTER_REPAIR_PACKAGES: PackageSeed[] = [
  {
    name: "Inverter Diagnosis & Inspection",
    price: 499,
    originalPrice: 799,
    time: "45 mins",
    category: "Bestsellers",
    tag: "Bestseller",
    rating: "4.7 (620)",
    image: img("photo-1780444745115-a58369e913ee"), // electrical circuit breakers
    features: ["Full fault diagnosis", "Efficiency check", "No-obligation quote", "On-grid/off-grid/hybrid covered"],
    details: [
      "Complete diagnostic check of your on-grid, off-grid or hybrid inverter",
      "Clear, itemised quote before any repair work begins",
    ],
  },
  {
    name: "Inverter Repair & Component Replacement",
    price: 2999,
    originalPrice: 4499,
    time: "90 mins",
    category: "Repairs",
    tag: "Popular",
    rating: "4.6 (380)",
    image: img("photo-1780445392484-38a4852a1fd8"), // wall-mounted power inverters
    features: ["Genuine component parts", "Circuit board repair", "Output efficiency test", "60-day warranty"],
    details: [
      "Repair or replacement of faulty inverter components with genuine parts",
      "Output efficiency test to confirm your system is generating at full capacity",
    ],
  },
  {
    name: "Full Inverter Replacement & Setup",
    price: 24999,
    originalPrice: 29999,
    time: "180 mins",
    category: "Installation",
    tag: "Premium",
    rating: "4.7 (95)",
    image: img("photo-1780445392417-68b9dccc45f2"), // wall-mounted solar power/energy storage
    features: ["New inverter unit included", "Full installation & wiring", "System recommissioning", "1-year warranty"],
    details: [
      "Supply and installation of a new inverter unit matched to your system size",
      "Full recommissioning and performance test after installation",
    ],
  },
];

const SOLAR_CLEANING_PACKAGES: PackageSeed[] = [
  {
    name: "Standard Panel Cleaning (up to 10 panels)",
    price: 499,
    originalPrice: 799,
    time: "45 mins",
    category: "Bestsellers",
    tag: "Bestseller",
    rating: "4.8 (1,120)",
    image: img("photo-1754619880959-2b0528375883"), // cleaning solar panels with long-handled brush
    features: ["Dust & grime removal", "Soft-brush cleaning", "No harsh chemicals", "Doorstep service"],
    details: [
      "Soft-brush cleaning to remove dust, grime and bird droppings from up to 10 panels",
      "Uses only water and non-abrasive tools — no harsh chemicals",
    ],
  },
  {
    name: "Deep Cleaning + Efficiency Check",
    price: 899,
    originalPrice: 1299,
    time: "75 mins",
    category: "Servicing",
    tag: "Popular",
    rating: "4.7 (740)",
    image: img("photo-1658298775754-5839ffd434cc"), // solar panels on roof
    features: ["Deep clean all panels", "Output efficiency test", "Connection check", "Free performance report"],
    details: [
      "Deep cleaning of every panel followed by an output efficiency test",
      "Free performance report comparing before/after generation",
    ],
  },
  {
    name: "Annual AMC (4 visits/year)",
    price: 2999,
    originalPrice: 3999,
    time: "45 mins/visit",
    category: "Premium",
    tag: "Premium",
    rating: "4.7 (310)",
    image: img("photo-1719848576338-9516ba7ccd8b"), // technician working on solar panel
    features: ["4 cleanings/year", "Seasonal efficiency checks", "Priority scheduling", "Discounted repairs"],
    details: [
      "Quarterly cleaning visits scheduled across the year, no rebooking needed",
      "Priority scheduling and discounted rates on any repair work",
    ],
  },
];

const TARGETS: { slug: string; packages: PackageSeed[] }[] = [
  { slug: "solar-panel-installation", packages: SOLAR_INSTALLATION_PACKAGES },
  { slug: "solar-inverter-repair-solar-installation-services", packages: SOLAR_INVERTER_REPAIR_PACKAGES },
  { slug: "solar-panel-cleaning-maintenance-solar-installation-services", packages: SOLAR_CLEANING_PACKAGES },
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
