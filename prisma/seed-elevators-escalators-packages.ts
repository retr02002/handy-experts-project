/**
 * One-off: adds 3 packages each to the Escalator Service & Repair and
 * Elevator Maintenance & Repair services (slugs: escalator-service-repair,
 * elevator-maintenance-repair-elevators-escalators — under the
 * elevators-escalators category). The services themselves already exist
 * (created by hand in the admin panel, with their own branded hero images)
 * — this script only writes ServicePackage rows, it never touches the
 * Service record itself.
 *
 * No authentic free-licence Unsplash photo of a technician actually
 * repairing an elevator/escalator was found (this is a niche B2B category —
 * available stock is mostly people riding escalators or elevator car
 * exteriors). The two lower-tier packages per service use the closest
 * genuinely on-topic machinery/panel shots found; the top-tier "full
 * service" package falls back to the service's own hero image instead,
 * which already shows a real HANDYZO technician at work — a better fit
 * than a generic stock photo, per instruction.
 *
 * Pricing is scaled for commercial AMC-style service work (much higher than
 * home-repair pricing elsewhere in the catalog), matching how elevator/
 * escalator maintenance contracts are actually priced in the real market.
 *
 * Idempotent via deleteMany + createMany on each run — safe to re-run.
 * Run with: npx tsx prisma/seed-elevators-escalators-packages.ts
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

async function buildTargets(): Promise<{ slug: string; packages: PackageSeed[] }[]> {
  const services = await prisma.service.findMany({
    where: { slug: { in: ["escalator-service-repair", "elevator-maintenance-repair-elevators-escalators"] } },
    select: { slug: true, image: true },
  });
  const heroImage = new Map(services.map((s) => [s.slug, s.image]));
  const escalatorFallback = heroImage.get("escalator-service-repair") ?? img("photo-1524225155299-2e29400fb396");
  const elevatorFallback =
    heroImage.get("elevator-maintenance-repair-elevators-escalators") ?? img("photo-1592256410394-51c948ec13d5");

  return [
    {
      slug: "escalator-service-repair",
      packages: [
        {
          name: "Preventive Maintenance Checkup",
          price: 1999,
          originalPrice: 2999,
          time: "90 mins",
          category: "Bestsellers",
          tag: "Bestseller",
          rating: "4.7 (320)",
          image: img("photo-1524225155299-2e29400fb396"), // escalator with visible metallic mechanism
          features: ["Step chain lubrication", "Safety sensor check", "Handrail inspection", "Compliance report"],
          details: [
            "Full inspection and lubrication of the step chain and drive mechanism",
            "Safety sensor and emergency-stop testing with a compliance report",
          ],
        },
        {
          name: "Step Chain & Handrail Repair",
          price: 4999,
          originalPrice: 6999,
          time: "180 mins",
          category: "Repairs",
          tag: "Popular",
          rating: "4.6 (180)",
          image: img("photo-1502127958155-113755d9bdad"), // escalator between tiled walls
          features: ["Step chain alignment", "Handrail replacement", "Motor check", "90-day warranty"],
          details: [
            "Realignment or replacement of worn step chains and handrail belts",
            "Drive motor inspection to rule out related wear",
          ],
        },
        {
          name: "Full Service & Motor Overhaul",
          price: 9999,
          originalPrice: 13999,
          time: "300 mins",
          category: "Premium",
          tag: "Premium",
          rating: "4.7 (95)",
          image: escalatorFallback,
          features: ["Complete motor overhaul", "Full mechanical service", "Safety recertification", "6-month warranty"],
          details: [
            "Complete overhaul of the drive motor and mechanical assembly",
            "Full safety recertification on completion",
          ],
        },
      ],
    },
    {
      slug: "elevator-maintenance-repair-elevators-escalators",
      packages: [
        {
          name: "Preventive Maintenance Checkup",
          price: 1999,
          originalPrice: 2999,
          time: "90 mins",
          category: "Bestsellers",
          tag: "Bestseller",
          rating: "4.8 (410)",
          image: img("photo-1592256410394-51c948ec13d5"), // elevator door with button panel
          features: ["Door & sensor check", "Cable tension check", "Panel diagnostics", "Compliance report"],
          details: [
            "Inspection of door sensors, cable tension and control panel diagnostics",
            "Detailed compliance report after every visit",
          ],
        },
        {
          name: "Door Sensor & Control Panel Repair",
          price: 3999,
          originalPrice: 5999,
          time: "150 mins",
          category: "Repairs",
          tag: "Popular",
          rating: "4.6 (240)",
          image: img("photo-1719463814218-52e17f720e8a"), // open elevator door interior
          features: ["Sensor replacement", "Panel/button repair", "Jerk-free calibration", "90-day warranty"],
          details: [
            "Replacement of faulty door sensors and unresponsive control panel buttons",
            "Recalibration for a smooth, jerk-free stop and start",
          ],
        },
        {
          name: "Full Service & Cable Inspection",
          price: 7999,
          originalPrice: 10999,
          time: "240 mins",
          category: "Premium",
          tag: "Premium",
          rating: "4.7 (130)",
          image: elevatorFallback,
          features: ["Full cable & pulley inspection", "Complete mechanical service", "Safety recertification", "6-month warranty"],
          details: [
            "Full inspection of hoist cables, pulleys and the machine room assembly",
            "Complete mechanical service with safety recertification",
          ],
        },
      ],
    },
  ];
}

async function main() {
  const targets = await buildTargets();

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
