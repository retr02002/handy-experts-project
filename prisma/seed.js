// One-time seed: transcribes the site's original static catalog
// (formerly src/data/mockServices.ts) into the real Service/ServicePackage
// tables now that the storefront reads from the database. Safe to re-run —
// it skips any slug that already exists.
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const defaultBenefits = [
  { icon: "ph:leaf-duotone", title: "Eco-friendly & Safe", description: "We use 100% safe, non-toxic products that are completely safe for pets and children." },
  { icon: "ph:shield-check-duotone", title: "Verified & Background Checked", description: "All professionals undergo stringent background verification and 3-week skill bootcamps." },
  { icon: "ph:clock-countdown-duotone", title: "On-Time Arrival Guarantee", description: "If our professional arrives more than 30 mins late, you receive an instant ₹100 credit." },
  { icon: "ph:currency-inr-duotone", title: "Fixed & Transparent Pricing", description: "No price bargaining or hidden surprises. You pay exactly the rate advertised upfront." },
];

const defaultSteps = [
  { step: 1, title: "Select Packages & Slot", description: "Pick your required cleaning or repair packages and select an instant or scheduled arrival time." },
  { step: 2, title: "Verified Pro Assigned", description: "Our AI matches your booking with the top-rated professional in your neighborhood." },
  { step: 3, title: "Flawless Service Delivery", description: "The professional arrives equipped with specialized tools and executes a 42-point quality check." },
  { step: 4, title: "Hassle-Free Warranty", description: "Enjoy automatic post-service coverage and digital billing with 24/7 dedicated support." },
];

const defaultFaqs = [
  { question: "Are the cleaning agents safe for children and pets?", answer: "Yes! We exclusively use hospital-grade, bio-degradable cleaning formulations that emit zero fumes and leave surfaces safe for kids and pets within minutes." },
  { question: "Do I need to provide buckets, ladders, or cleaning supplies?", answer: "Not at all. Our team arrives fully self-sufficient with high-pressure machines, microfiber cloth sets, ladders, and premium cleaning agents." },
  { question: "What if I am not completely satisfied with the service?", answer: "Under our Handy Experts Quality Guarantee, we offer a 'No Questions Asked' complimentary free rework within 48 hours of your job completion." },
  { question: "Can I reschedule or cancel my booking if my plans change?", answer: "Absolutely. You can modify your preferred slot or cancel completely free of charge up to 2 hours before the appointment time directly from your dashboard." },
];

const SERVICES = [
  {
    slug: "ac-deep-service",
    category: "AC & Appliance",
    badge: "TRENDING",
    badgeColor: "bg-[#00B4FF] text-white",
    rating: "4.9 (12,480 reviews)",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1600&auto=format&fit=crop",
    time: "45 mins - 2 hrs",
    warranty: "30-day AC warranty",
    title: "AC Deep Service & Repair",
    description: "High-pressure foam jet cleaning of condenser coils, cooling fins & drain pipelines — cooler airflow, 25% lower power bills, and zero leakage guarantee.",
    packages: [
      {
        name: "Split AC Deep Foam Clean", price: 599, originalPrice: 899, time: "45 mins",
        category: "Bestsellers", tag: "Bestseller", rating: "4.9 (4,210)",
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop",
        features: ["High-pressure foam jet wash", "Indoor filter & coil deep clean", "Outdoor cooling unit vacuum", "Free refrigerant gas check"],
        details: [
          "Pre-service inspection of cooling efficiency, thermostat & noise level",
          "High-pressure biodegradable foam wash of indoor cooling fins and blower wheel",
          "Complete flush of condensate water drainage pipeline to prevent indoor leaking",
          "Dry compressed airflow & vacuuming of outdoor compressor unit",
          "Work area cleanup leaving zero water splatters or floor messes",
        ],
      },
      {
        name: "Window AC Deep Clean", price: 499, originalPrice: 699, time: "40 mins",
        category: "Bestsellers", tag: "Popular", rating: "4.8 (1,840)",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop",
        features: ["Complete unmounting & wash", "Deep evaporator coil scrubbing", "Drainage block clearance", "Re-installation & testing"],
        details: [
          "Careful unmounting of Window AC unit from window chassis",
          "High-pressure detergent water jet cleaning of condenser and evaporator coils",
          "Removal of accumulated debris and rust protection treatment",
          "Safe remounting, electrical connection testing, and performance verification",
        ],
      },
      {
        name: "AC Master Combo (2 ACs Wash)", price: 1099, originalPrice: 1798, time: "90 mins",
        category: "Combos & Add-ons", tag: "Super Saver", rating: "4.9 (2,100)",
        image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=600&auto=format&fit=crop",
        features: ["Any 2 Split or Window ACs", "Complete foam jet wash", "Double check & diagnostics", "Save ₹700 instantly"],
        details: [
          "Comprehensive deep cleaning package for any combination of 2 residential AC units",
          "High-pressure foam application removing pet hair, bacteria, and allergens",
          "Complimentary condenser coil health diagnosis and gas pressure check",
        ],
      },
      {
        name: "AC Gas Top-up & Recharge", price: 1499, originalPrice: 2200, time: "45 mins",
        category: "Repairs & Gas", tag: "Genuine Gas", rating: "4.8 (980)",
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",
        features: ["Electronic leak diagnosis", "Genuine R32 / R410A / R22 recharge", "Post-recharge cooling test", "30-day pressure guarantee"],
        details: [
          "Full system electronic and soap bubble leak detection across joints",
          "Precision vacuum pump purging and genuine eco-friendly cooling refrigerant filling",
          "Thermal laser temperature differential test verifying rapid room cooling",
        ],
      },
    ],
  },
  {
    slug: "full-home-deep-cleaning",
    category: "Cleaning",
    badge: "MOST BOOKED",
    badgeColor: "bg-white text-slate-900",
    rating: "4.8 (9,410 reviews)",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1600&auto=format&fit=crop",
    time: "4 - 6 hrs",
    warranty: "7-day redo guarantee",
    title: "Full Home Deep Cleaning",
    description: "Professional 4-member cleaning squad equipped with industrial floor machines, steam vacuums and hospital-grade eco-disinfectants.",
    packages: [
      {
        name: "Complete Home (Furnished)", price: 4299, originalPrice: 5599, time: "6 hrs",
        category: "Bestsellers", tag: "Most Booked", rating: "4.9 (5,320)",
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop",
        features: ["Industrial floor machine scrub", "Intense bathroom descaling", "Sofa & cushion dry vacuum", "Balcony & window track wash"],
        details: [
          "Deep scrubbing of marble/vitrified floors using single-disc industrial polish machines",
          "Acid-free hard water stain removal and complete disinfection of all bathrooms",
          "Dry vacuuming of fabric sofas, mattresses, cushions, and curtains",
          "Thorough degreasing of kitchen cabinets, countertops, and appliance exteriors",
          "Window pane polishing and intricate slider channel dust suction",
        ],
      },
      {
        name: "Kitchen & Bathroom Combo", price: 1899, originalPrice: 2499, time: "3 hrs",
        category: "Bestsellers", tag: "Value Deal", rating: "4.8 (3,140)",
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",
        features: ["Kitchen chimney degreasing", "Bathroom tap & shower descaling", "Floor grout restoration", "Mirror & partition shine"],
        details: [
          "Heavy grease extraction from kitchen chimney filters and stove burner zones",
          "Descaling and polishing of chrome faucets, showerheads, and glass partitions",
          "High-pressure grout scrub restoring white seams between floor tiles",
          "Sanitization of kitchen sink, garbage disposal zone, and toilet bowls",
        ],
      },
      {
        name: "Intense Kitchen Degrease", price: 1299, originalPrice: 1799, time: "2 hrs",
        category: "Individual Rooms", tag: "Deep Polish", rating: "4.8 (1,520)",
        image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop",
        features: ["Chimney & exhaust deep cleaning", "Stovetop & backer tile wash", "Cabinet inside & out dusting", "Stainless steel sink buff"],
        details: [
          "Targeted extraction of stubborn oil vapor residue from chimney filter sieves",
          "Wiping and stain lifting from laminates and wooden storage cabinets",
          "Anti-cockroach surface hygiene sanitization spray",
        ],
      },
    ],
  },
  {
    slug: "bathroom-deep-cleaning",
    category: "Cleaning",
    badge: "VALUE",
    badgeColor: "bg-slate-900 text-white dark:bg-black dark:text-white",
    rating: "4.8 (22,110 reviews)",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1600&auto=format&fit=crop",
    time: "60 - 120 mins",
    warranty: "48-hr spot warranty",
    title: "Bathroom Deep Cleaning",
    description: "Intense hard-water stain removal on glass partitions and chrome taps. Deep tile grout whitening using eco-safe acids that leave zero streaks or fumes.",
    packages: [
      {
        name: "Deep Clean (1 Bathroom)", price: 399, originalPrice: 599, time: "60 mins",
        category: "Bestsellers", tag: "Bestseller", rating: "4.9 (14,200)",
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",
        features: ["Hard water lime descaling", "Floor & wall tile grout scrub", "Glass cubicle mirror polishing", "WC complete sanitization"],
        details: [
          "Application of premium organic limescale dissolvers on clouded shower enclosures",
          "Manual and motorized brush scrubbing of floor tile grout and corner mold",
          "Thorough disinfection and anti-scaling treatment of WC seat and cistern",
          "Buffing of faucets and showerheads to restored mirror brilliance",
        ],
      },
      {
        name: "Deep Clean (2 Bathrooms)", price: 699, originalPrice: 999, time: "2 hrs",
        category: "Bestsellers", tag: "Super Saver", rating: "4.9 (8,410)",
        image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=600&auto=format&fit=crop",
        features: ["Combo ₹300 discount", "Full grout restoration", "Chrome tap descaling", "Fragrant steam sanitization"],
        details: [
          "Complete deep cleaning protocol applied systematically across 2 home bathrooms",
          "Advanced stain lifting on floor drainage corners and shower floor stones",
          "Long-lasting pleasant floral herbal freshness treatment",
        ],
      },
      {
        name: "Express Toilet & Sink Shine", price: 249, originalPrice: 399, time: "30 mins",
        category: "Add-ons", tag: "Express Clean", rating: "4.7 (1,100)",
        image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=600&auto=format&fit=crop",
        features: ["WC lime bowl descaling", "Washbasin mirror polish", "Jet spray calc removal", "Antibacterial fogging"],
        details: [
          "Quick, intense hygiene refresh targeting the primary touchpoints of your bathroom",
          "Lime deposit cleaning on jet spray tips and basin water faucets",
        ],
      },
    ],
  },
  {
    slug: "sofa-spa-cleaning",
    category: "Cleaning",
    badge: "NEW",
    badgeColor: "bg-[#00B4FF] text-white",
    rating: "4.7 (5,210 reviews)",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1600&auto=format&fit=crop",
    time: "45 min / seat",
    warranty: "No shrinkage guarantee",
    title: "Sofa Spa & Carpet Shampooing",
    description: "Multi-stage hot-water extraction and German fabric shampooing for pet stain lifting, dust mite removal, and deep allergen neutralization.",
    packages: [
      {
        name: "Sofa Spa Clean (3 Seats)", price: 749, originalPrice: 999, time: "1.5 hrs",
        category: "Bestsellers", tag: "Trending", rating: "4.8 (3,900)",
        image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=600&auto=format&fit=crop",
        features: ["High-power dust mite suction", "German fabric shampoo treatment", "Hot water vacuum extraction", "Quick 3-4 hr drying time"],
        details: [
          "Industrial dry vacuuming drawing out deep-seated dust mites and skin dander",
          "Gentle foam agitation using fabric-safe imported conditioning cleaning agents",
          "High-power wet vacuum suction extracting suspended dirt and moisture simultaneously",
          "Restores fabric plushness and eliminates damp or pet odors completely",
        ],
      },
      {
        name: "Deep Carpet Shampooing", price: 599, originalPrice: 799, time: "1 hr",
        category: "Add-ons", tag: "Deep Extract", rating: "4.7 (1,240)",
        image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=600&auto=format&fit=crop",
        features: ["Pile relaxing rotary scrub", "Stubborn stain pre-treatment", "Allergen extraction", "Deodorization misting"],
        details: [
          "Pre-treatment of traffic corridors and spilled coffee/food stain zones",
          "Deep pile brushing lifting compacted carpet threads and restoring softness",
          "Complete hygienic extraction process leaving carpets revitalized",
        ],
      },
      {
        name: "Mattress Deep Shampoo (Double)", price: 649, originalPrice: 899, time: "1 hr",
        category: "Combos & Add-ons", tag: "Allergen Free", rating: "4.9 (950)",
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=600&auto=format&fit=crop",
        features: ["UV germ killing treatment", "Perspiration stain lightening", "Dust mite vacuum suction", "Hygienic sanitization"],
        details: [
          "Essential health treatment lifting dead skin cells and microbiological dust mites",
          "Gentle steam shampooing restoring a clean, healthy sleeping environment",
        ],
      },
    ],
  },
  {
    slug: "leak-fix-pipe-repair",
    category: "Plumbing",
    badge: "ESSENTIAL",
    badgeColor: "bg-emerald-500 text-white",
    rating: "4.9 (15,300 reviews)",
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=1600&auto=format&fit=crop",
    time: "30 - 45 mins",
    warranty: "15-day leak warranty",
    title: "Leak Fix & Plumbing Repair",
    description: "Rapid expert diagnosis and guaranteed fixing of dripping faucets, blocked kitchen drainage systems, or burst concealed water pipelines.",
    packages: [
      {
        name: "Tap / Mixer Repair & Service", price: 149, originalPrice: 249, time: "30 mins",
        category: "Bestsellers", tag: "Bestseller", rating: "4.9 (9,100)",
        image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&auto=format&fit=crop",
        features: ["Worn washer & O-ring replacement", "Spindle / cartridge repair", "Water pressure balancing", "Zero splash leak check"],
        details: [
          "Detailed inspection of dripping bathroom mixer or kitchen sink faucet",
          "Replacement of worn internal rubber gaskets or spindle mechanisms (parts extra at actuals)",
          "Re-torqueing and water pressure testing under continuous flow",
          "Guaranteed cleanliness with no water spillage on cabinets or floors",
        ],
      },
      {
        name: "Kitchen & Bath Drain Unblocking", price: 299, originalPrice: 399, time: "45 mins",
        category: "Bestsellers", tag: "No Mess", rating: "4.8 (5,210)",
        image: "https://images.unsplash.com/photo-1542013936693-8c463dfacf7d?q=80&w=600&auto=format&fit=crop",
        features: ["High-pressure mechanical flush", "Siphon trap removal & wash", "Grease & hair dissolution", "Smooth flow testing"],
        details: [
          "Dismantling and cleaning of below-sink bottle traps and floor gully grates",
          "Insertion of plumbing snakes to dislodge deep seated hair and grease clogs",
          "High-pressure hot water flushes verifying unrestricted, gurgle-free drainage",
        ],
      },
    ],
  },
  {
    slug: "switchboard-wiring",
    category: "Electrical",
    badge: "POPULAR",
    badgeColor: "bg-orange-500 text-white",
    rating: "4.8 (8,900 reviews)",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1600&auto=format&fit=crop",
    time: "30 - 45 mins",
    warranty: "30-day spark warranty",
    title: "Switchboard & Wiring Repair",
    description: "Certified licensed electricians for safe installation, fault diagnosis, burnt switch replacements, ceiling fans, and inverter wiring connections.",
    packages: [
      {
        name: "Burnt Switch / Socket Fix", price: 99, originalPrice: 149, time: "30 mins",
        category: "Bestsellers", tag: "Quick Fix", rating: "4.8 (6,300)",
        image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=600&auto=format&fit=crop",
        features: ["Fault & earthing diagnosis", "Burnt component extraction", "Modular socket mounting", "Spark & voltage check"],
        details: [
          "Safety-first diagnosis of sparking or malfunctioning electrical wall switches",
          "Removal of damaged faceplates and burnt internal brass contact wiring",
          "Installation of brand newly compatible modular switches (parts extra at retail cost)",
          "Earth leakage and voltage polarity testing for complete appliance safety",
        ],
      },
      {
        name: "Ceiling Fan Installation & Balance", price: 199, originalPrice: 299, time: "45 mins",
        category: "Bestsellers", tag: "Safety Verified", rating: "4.9 (2,600)",
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop",
        features: ["Heavy load shackle mounting", "Regulator wire connection", "Dynamic blade balancing", "Wobble & hum-free check"],
        details: [
          "Unboxing, downrod coupling, and canopy alignment of new ceiling fan units",
          "Secure mechanical attachment to ceiling RCC suspension hooks",
          "Electronic speed regulator hookup and blade balancing to eliminate wobble or mechanical noise",
        ],
      },
    ],
  },
];

async function main() {
  for (const svc of SERVICES) {
    const existing = await prisma.service.findUnique({ where: { slug: svc.slug } });
    if (existing) {
      console.log(`Skipping "${svc.title}" — slug "${svc.slug}" already exists`);
      continue;
    }

    const { packages, ...serviceData } = svc;
    const created = await prisma.service.create({
      data: {
        ...serviceData,
        benefits: defaultBenefits,
        howItWorks: defaultSteps,
        faqs: defaultFaqs,
        packages: { create: packages },
      },
    });
    console.log(`Seeded "${created.title}" with ${packages.length} package(s)`);
  }
}

main()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
