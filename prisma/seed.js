// One-time seed: transcribes the site's original static catalog
// (formerly src/data/mockServices.ts) into the real Service/ServicePackage
// tables now that the storefront reads from the database. Safe to re-run —
// it skips any slug that already exists.
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const { CATEGORIES } = require("./categories");
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
    categorySlug: "ac-appliance",
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
    categorySlug: "cleaning",
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
    categorySlug: "cleaning",
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
    categorySlug: "cleaning",
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
    categorySlug: "plumbing",
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
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",
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
    categorySlug: "electrical",
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
  {
    slug: "washing-machine-repair",
    categorySlug: "ac-appliance",
    badge: "SAME DAY",
    badgeColor: "bg-emerald-500 text-white",
    rating: "4.8 (7,240 reviews)",
    image: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?q=80&w=1600&auto=format&fit=crop",
    time: "45 mins - 90 mins",
    warranty: "60-day repair warranty",
    title: "Washing Machine Repair & Service",
    description: "Drum descaling, drainage unclogging, spin motor and control board repair for front-load, top-load and semi-automatic machines.",
    packages: [
      {
        name: "Front Load Deep Service", price: 649, originalPrice: 999, time: "60 mins",
        category: "Bestsellers", tag: "Bestseller", rating: "4.9 (2,980)",
        image: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=600&auto=format&fit=crop",
        features: ["Drum descaling & sanitisation", "Gasket mould removal", "Drain filter clean-out", "Full cycle test run"],
        details: [
          "Chemical descaling of the wash drum removing detergent residue and hard-water scale",
          "Rubber gasket cleaning and anti-fungal treatment to stop persistent odour",
          "Drain pump filter extraction, lint removal and inlet mesh cleaning",
          "Complete test wash cycle verifying spin balance, drainage and heating",
        ],
      },
      {
        name: "Top Load Repair Visit", price: 449, originalPrice: 699, time: "45 mins",
        category: "Repairs", tag: "Quick Fix", rating: "4.8 (1,640)",
        image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=600&auto=format&fit=crop",
        features: ["Full fault diagnosis", "Belt & coupler check", "Drainage unclogging", "Labour included"],
        details: [
          "Multi-point electrical and mechanical diagnosis of the wash and spin cycle",
          "Inspection of drive belt, coupler and gearbox with adjustment where needed",
          "Drain hose and pump unclogging to restore full water discharge",
          "Spare parts, if required, quoted upfront before any replacement",
        ],
      },
      {
        name: "Drain Motor Replacement", price: 1299, originalPrice: 1899, time: "75 mins",
        category: "Repairs", tag: "Genuine Parts", rating: "4.7 (720)",
        image: "https://images.unsplash.com/photo-1604335398980-ededcadcc37d?q=80&w=600&auto=format&fit=crop",
        features: ["Genuine drain pump motor", "Complete fitment & sealing", "Leak pressure test", "60-day part warranty"],
        details: [
          "Removal of the failed drain pump assembly and cleaning of the housing chamber",
          "Fitment of a brand-matched genuine drain motor with fresh sealing gaskets",
          "Full-load drainage pressure test confirming no seepage at the joints",
        ],
      },
    ],
  },
  {
    slug: "refrigerator-repair",
    categorySlug: "ac-appliance",
    badge: "",
    badgeColor: "bg-slate-900 text-white",
    rating: "4.7 (4,110 reviews)",
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?q=80&w=1600&auto=format&fit=crop",
    time: "45 mins - 2 hrs",
    warranty: "60-day repair warranty",
    title: "Refrigerator Repair & Gas Filling",
    description: "Cooling failure diagnosis, compressor and thermostat repair, defrost fixes and eco-friendly gas recharge for single and double-door fridges.",
    packages: [
      {
        name: "Cooling Issue Diagnosis", price: 399, originalPrice: 599, time: "45 mins",
        category: "Bestsellers", tag: "Most Booked", rating: "4.8 (1,910)",
        image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=600&auto=format&fit=crop",
        features: ["Compressor health check", "Thermostat calibration", "Coil & vent cleaning", "Written fault report"],
        details: [
          "Temperature mapping across freezer and fresh-food compartments",
          "Compressor current draw, relay and thermostat continuity checks",
          "Condenser coil dusting and vent clearing to restore airflow",
          "A written report listing the fault, the fix and the part cost upfront",
        ],
      },
      {
        name: "Fridge Gas Recharge", price: 1899, originalPrice: 2699, time: "2 hrs",
        category: "Repairs & Gas", tag: "Genuine Gas", rating: "4.7 (860)",
        image: "https://images.unsplash.com/photo-1536353284924-9220c464e262?q=80&w=600&auto=format&fit=crop",
        features: ["Leak detection & brazing", "Vacuum purge", "Genuine R600a gas", "Cooling verification"],
        details: [
          "Full-circuit leak detection followed by professional brazing of the leak point",
          "Vacuum pump purging to remove moisture before the refrigerant charge",
          "Measured genuine R600a / R134a refill to manufacturer specification",
          "Overnight cooling verification call the next day",
        ],
      },
    ],
  },
  {
    slug: "kitchen-deep-cleaning",
    categorySlug: "cleaning",
    badge: "TOP RATED",
    badgeColor: "bg-amber-500 text-white",
    rating: "4.9 (6,530 reviews)",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1600&auto=format&fit=crop",
    time: "3 - 4 hrs",
    warranty: "48-hour rework guarantee",
    title: "Kitchen Deep Cleaning",
    description: "Degreasing of chimney, hob, tiles and cabinet fronts with food-safe agents — a spotless kitchen without a single harsh fume.",
    packages: [
      {
        name: "Complete Kitchen Deep Clean", price: 1499, originalPrice: 2199, time: "3.5 hrs",
        category: "Bestsellers", tag: "Bestseller", rating: "4.9 (3,410)",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop",
        features: ["Chimney & hob degreasing", "Tile & backsplash scrubbing", "Cabinet exterior wipe-down", "Sink descaling & polish"],
        details: [
          "Heavy-duty degreasing of the chimney baffle filters, hood exterior and gas hob",
          "Steam-assisted scrubbing of wall tiles and backsplash removing baked-on oil film",
          "Exterior cleaning and polishing of all cabinet shutters and handles",
          "Sink and tap descaling with a stainless-steel shine finish",
          "Floor mopping and full waste removal on the way out",
        ],
      },
      {
        name: "Chimney & Hob Only", price: 799, originalPrice: 1199, time: "90 mins",
        category: "Add-ons", tag: "Value Deal", rating: "4.8 (1,220)",
        image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=600&auto=format&fit=crop",
        features: ["Baffle filter soak", "Hood interior degrease", "Burner clean & flame test", "Same-day service"],
        details: [
          "Baffle filters removed and hot-soaked in a food-safe degreasing solution",
          "Chimney hood interior scrubbed of accumulated grease and carbon",
          "Gas burner heads cleaned, unclogged and flame-tested for even blue flame",
        ],
      },
    ],
  },
  {
    slug: "bathroom-fittings-installation",
    categorySlug: "plumbing",
    badge: "",
    badgeColor: "bg-slate-900 text-white",
    rating: "4.8 (3,280 reviews)",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1600&auto=format&fit=crop",
    time: "45 mins - 2 hrs",
    warranty: "90-day workmanship warranty",
    title: "Bathroom Fittings & Installation",
    description: "Tap, shower, health faucet, geyser and western commode installation with leak-proof sealing and zero wall damage.",
    packages: [
      {
        name: "Tap / Mixer Installation", price: 299, originalPrice: 449, time: "45 mins",
        category: "Bestsellers", tag: "Bestseller", rating: "4.9 (1,880)",
        image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=600&auto=format&fit=crop",
        features: ["Old fitting removal", "Thread sealing & fitment", "Pressure leak test", "Debris cleanup"],
        details: [
          "Water line shut-off and careful removal of the existing tap or mixer",
          "Fresh PTFE thread sealing and torque-controlled fitment of the new unit",
          "Full-pressure leak test held for 10 minutes across every joint",
        ],
      },
      {
        name: "Geyser Installation", price: 649, originalPrice: 949, time: "90 mins",
        category: "Bestsellers", tag: "Popular", rating: "4.8 (940)",
        image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&auto=format&fit=crop",
        features: ["Wall mounting & bracket", "Inlet / outlet piping", "Earthing verification", "Heating test cycle"],
        details: [
          "Load-bearing wall anchor drilling and bracket mounting for the geyser body",
          "Inlet and outlet flexible pipe connection with pressure-relief valve fitment",
          "Electrical earthing verification before the first heating cycle test",
        ],
      },
      {
        name: "Western Commode Fitting", price: 1199, originalPrice: 1799, time: "2 hrs",
        category: "Installations", tag: "Expert Job", rating: "4.7 (410)",
        image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=600&auto=format&fit=crop",
        features: ["Old unit removal", "Floor levelling & sealing", "Flush tank plumbing", "Silicone finish"],
        details: [
          "Safe disconnection and removal of the existing commode without tile damage",
          "Floor levelling, wax-ring seating and bolt anchoring of the new unit",
          "Flush tank plumbing, water level calibration and full flush testing",
          "Neat silicone bead finish around the base",
        ],
      },
    ],
  },
  {
    slug: "fan-light-installation",
    categorySlug: "electrical",
    badge: "QUICK",
    badgeColor: "bg-[#00B4FF] text-white",
    rating: "4.8 (5,890 reviews)",
    image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=1600&auto=format&fit=crop",
    time: "30 mins - 90 mins",
    warranty: "90-day workmanship warranty",
    title: "Fan, Light & Appliance Installation",
    description: "Ceiling fans, chandeliers, LED panels, exhaust fans and geyser points installed safely with proper earthing and load checks.",
    packages: [
      {
        name: "Ceiling Fan Installation", price: 249, originalPrice: 399, time: "40 mins",
        category: "Bestsellers", tag: "Bestseller", rating: "4.9 (2,740)",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop",
        features: ["Hook & rod mounting", "Wiring & regulator hookup", "Blade balancing", "Wobble-free guarantee"],
        details: [
          "Ceiling hook load verification and down-rod assembly to the correct drop height",
          "Live, neutral and earth wiring terminated at the regulator with insulated caps",
          "Blade balancing so the fan runs without wobble or hum at full speed",
        ],
      },
      {
        name: "LED Panel / Light Fitting", price: 199, originalPrice: 349, time: "30 mins",
        category: "Bestsellers", tag: "Quick Fix", rating: "4.8 (1,960)",
        image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?q=80&w=600&auto=format&fit=crop",
        features: ["Per-light fitting", "Driver connection", "False ceiling safe", "Switch testing"],
        details: [
          "Clean cut-out or surface mounting depending on the fixture and ceiling type",
          "LED driver connection with correct polarity and insulated terminations",
          "Switch-point testing across every connected light",
        ],
      },
      {
        name: "Chandelier Installation", price: 899, originalPrice: 1399, time: "90 mins",
        category: "Installations", tag: "Expert Job", rating: "4.8 (520)",
        image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=600&auto=format&fit=crop",
        features: ["Load-bearing anchor", "Multi-arm assembly", "Height levelling", "Dimmer compatibility check"],
        details: [
          "Heavy-duty ceiling anchor rated well above the chandelier's loaded weight",
          "Careful multi-arm assembly and crystal fitment without scratching",
          "Precision height levelling and dimmer circuit compatibility verification",
        ],
      },
    ],
  },
  {
    slug: "furniture-assembly-repair",
    categorySlug: "carpentry",
    badge: "TRENDING",
    badgeColor: "bg-[#00B4FF] text-white",
    rating: "4.8 (4,620 reviews)",
    image: "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=1600&auto=format&fit=crop",
    time: "45 mins - 3 hrs",
    warranty: "60-day workmanship warranty",
    title: "Furniture Assembly & Repair",
    description: "Flat-pack assembly, wardrobe and drawer repair, hinge replacement, drilling and wall mounting by trained carpenters with their own tools.",
    packages: [
      {
        name: "Flat-Pack Furniture Assembly", price: 599, originalPrice: 899, time: "90 mins",
        category: "Bestsellers", tag: "Bestseller", rating: "4.9 (2,120)",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop",
        features: ["Any one flat-pack unit", "Manufacturer-spec assembly", "Anti-tip wall anchoring", "Packaging disposal"],
        details: [
          "Parts inventory check against the manual before assembly begins",
          "Assembly to manufacturer torque and alignment specification",
          "Anti-tip wall anchoring for any tall unit, included at no extra cost",
          "All cardboard and packaging waste carried away",
        ],
      },
      {
        name: "Drawer & Hinge Repair", price: 349, originalPrice: 549, time: "60 mins",
        category: "Repairs", tag: "Quick Fix", rating: "4.8 (1,340)",
        image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=600&auto=format&fit=crop",
        features: ["Up to 4 hinges or channels", "Alignment correction", "Hardware included", "Smooth-close testing"],
        details: [
          "Replacement of worn hinges, soft-close dampers or drawer channels",
          "Shutter alignment correction so gaps stay even across the run",
          "Smooth open-close cycle testing on every repaired unit",
        ],
      },
      {
        name: "Drilling & Wall Mounting", price: 299, originalPrice: 449, time: "45 mins",
        category: "Add-ons", tag: "Popular", rating: "4.8 (990)",
        image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600&auto=format&fit=crop",
        features: ["Up to 6 drill points", "Concealed wire detection", "Dust-controlled drilling", "Level-checked mounting"],
        details: [
          "Electronic wire and pipe detection before any drilling into the wall",
          "Dust-extraction drilling that leaves no debris on your floor",
          "Spirit-level verified mounting of shelves, TV brackets or mirrors",
        ],
      },
    ],
  },
  {
    slug: "door-lock-repair",
    categorySlug: "carpentry",
    badge: "",
    badgeColor: "bg-slate-900 text-white",
    rating: "4.7 (2,180 reviews)",
    image: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?q=80&w=1600&auto=format&fit=crop",
    time: "45 mins - 2 hrs",
    warranty: "60-day workmanship warranty",
    title: "Door Repair & Lock Replacement",
    description: "Jammed doors, sagging frames, broken latches and lock replacement — including digital locks — fixed without replacing the whole door.",
    packages: [
      {
        name: "Door Alignment & Jam Fix", price: 449, originalPrice: 699, time: "60 mins",
        category: "Bestsellers", tag: "Most Booked", rating: "4.8 (1,120)",
        image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=600&auto=format&fit=crop",
        features: ["Hinge realignment", "Edge planing if needed", "Latch adjustment", "Smooth-swing testing"],
        details: [
          "Diagnosis of whether the jam comes from the hinges, the frame or swelling",
          "Hinge repositioning and, where required, controlled edge planing",
          "Strike-plate and latch realignment so the door closes without force",
        ],
      },
      {
        name: "Lock Replacement", price: 549, originalPrice: 849, time: "60 mins",
        category: "Repairs", tag: "Security", rating: "4.7 (680)",
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=600&auto=format&fit=crop",
        features: ["Mortise or cylindrical lock", "Clean cut-out fitting", "Key set handover", "Operation testing"],
        details: [
          "Removal of the existing lock body without damaging the door face",
          "Precise cut-out adjustment and fitment of the new mortise or cylindrical lock",
          "Full key set handover and repeated lock-unlock operation testing",
        ],
      },
    ],
  },
  {
    slug: "interior-home-painting",
    categorySlug: "painting",
    badge: "TOP RATED",
    badgeColor: "bg-amber-500 text-white",
    rating: "4.9 (3,940 reviews)",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1600&auto=format&fit=crop",
    time: "1 - 4 days",
    warranty: "1-year paint warranty",
    title: "Interior Home Painting",
    description: "Putty, primer and two coats of premium emulsion with full furniture masking, daily site cleanup and a written finish guarantee.",
    packages: [
      {
        name: "Single Room Painting", price: 4999, originalPrice: 6999, time: "1 - 2 days",
        category: "Bestsellers", tag: "Bestseller", rating: "4.9 (1,640)",
        image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=600&auto=format&fit=crop",
        features: ["Up to 140 sq ft floor area", "Putty, primer & 2 emulsion coats", "Full furniture masking", "Daily site cleanup"],
        details: [
          "Wall sanding and crack filling followed by two coats of wall putty",
          "One primer coat and two coats of premium washable emulsion in your chosen shade",
          "Complete masking of furniture, floors, switches and fittings before work starts",
          "Site swept and cleared at the end of every working day",
        ],
      },
      {
        name: "Full Home Painting (2 BHK)", price: 21999, originalPrice: 29999, time: "3 - 4 days",
        category: "Bestsellers", tag: "Super Saver", rating: "4.9 (820)",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop",
        features: ["All rooms, hall & kitchen", "Premium emulsion throughout", "Ceiling included", "1-year finish warranty"],
        details: [
          "Complete 2 BHK coverage including bedrooms, living area, kitchen and ceilings",
          "Surface preparation, putty, primer and two premium emulsion coats throughout",
          "Dedicated site supervisor with a day-by-day schedule shared upfront",
          "One-year warranty against peeling, flaking and patchy finish",
        ],
      },
      {
        name: "Waterproofing & Damp Treatment", price: 3499, originalPrice: 4999, time: "1 day",
        category: "Add-ons", tag: "Monsoon Ready", rating: "4.8 (460)",
        image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop",
        features: ["Damp source diagnosis", "Chemical damp-proof coat", "Crack sealing", "Repaint of treated patch"],
        details: [
          "Moisture-meter diagnosis to locate the true source of the seepage",
          "Crack sealing and application of a chemical damp-proof barrier coat",
          "Repainting of the treated patch to blend with the surrounding wall",
        ],
      },
    ],
  },
  {
    slug: "cockroach-pest-control",
    categorySlug: "pest-control",
    badge: "TRENDING",
    badgeColor: "bg-emerald-500 text-white",
    rating: "4.8 (5,210 reviews)",
    image: "https://images.unsplash.com/photo-1632935190508-bcaf7b6c4b17?q=80&w=1600&auto=format&fit=crop",
    time: "45 mins - 90 mins",
    warranty: "60-day reappearance warranty",
    title: "Cockroach & General Pest Control",
    description: "Odourless, child- and pet-safe gel and spray treatment for cockroaches, ants and lizards with a written reappearance guarantee.",
    packages: [
      {
        name: "Cockroach Gel Treatment", price: 799, originalPrice: 1199, time: "45 mins",
        category: "Bestsellers", tag: "Bestseller", rating: "4.9 (2,410)",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop",
        features: ["Odourless gel application", "Kitchen & bathroom focus", "No need to vacate home", "60-day warranty"],
        details: [
          "Odourless, non-staining gel applied at hinge points, crevices and cabinet corners",
          "Targeted treatment of kitchen, bathroom and utility harbourage zones",
          "Completely safe to remain at home during and after the treatment",
          "Free re-treatment within 60 days if cockroaches reappear",
        ],
      },
      {
        name: "General Pest Combo", price: 1299, originalPrice: 1999, time: "90 mins",
        category: "Combos & Add-ons", tag: "Super Saver", rating: "4.8 (1,180)",
        image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=600&auto=format&fit=crop",
        features: ["Cockroach + ant + lizard", "Full-home coverage", "Child & pet safe", "90-day warranty"],
        details: [
          "Combined gel and spray protocol covering cockroaches, ants and lizards",
          "Full-home perimeter treatment including balconies and entry points",
          "Government-approved, child- and pet-safe formulations throughout",
        ],
      },
    ],
  },
  {
    slug: "termite-control",
    categorySlug: "pest-control",
    badge: "",
    badgeColor: "bg-slate-900 text-white",
    rating: "4.8 (1,760 reviews)",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1600&auto=format&fit=crop",
    time: "3 - 5 hrs",
    warranty: "1-year treatment warranty",
    title: "Termite Control Treatment",
    description: "Drill-fill-seal chemical barrier treatment along walls and skirting that stops active termite colonies and blocks re-entry for a year.",
    packages: [
      {
        name: "Anti-Termite Treatment (1 BHK)", price: 2999, originalPrice: 4499, time: "3 hrs",
        category: "Bestsellers", tag: "Bestseller", rating: "4.8 (740)",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop",
        features: ["Drill-fill-seal method", "Skirting & wall junctions", "Wooden furniture treatment", "1-year warranty"],
        details: [
          "Precision drilling at 12-inch intervals along wall and skirting junctions",
          "Pressure injection of a termiticide emulsion forming a continuous barrier",
          "Holes sealed and finished so the treatment stays visually invisible",
          "Surface treatment of affected wooden furniture and door frames",
        ],
      },
      {
        name: "Anti-Termite Treatment (3 BHK)", price: 5999, originalPrice: 8499, time: "5 hrs",
        category: "Bestsellers", tag: "Full Home", rating: "4.8 (390)",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop",
        features: ["Full 3 BHK coverage", "Perimeter soil treatment", "All wooden fixtures", "1-year warranty"],
        details: [
          "Complete 3 BHK drill-fill-seal barrier across every room and corridor",
          "External perimeter soil treatment where accessible, to block colony re-entry",
          "Treatment of all wooden fixtures, wardrobes and door frames",
        ],
      },
    ],
  },
  {
    slug: "salon-for-women-at-home",
    categorySlug: "salon-spa",
    badge: "TOP RATED",
    badgeColor: "bg-amber-500 text-white",
    rating: "4.9 (8,940 reviews)",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1600&auto=format&fit=crop",
    time: "60 mins - 2 hrs",
    warranty: "Single-use kit guarantee",
    title: "Salon for Women at Home",
    description: "Waxing, facials, threading, pedicure and cleanup by certified beauticians using single-use disposables and branded products.",
    packages: [
      {
        name: "Waxing & Threading Combo", price: 749, originalPrice: 1099, time: "60 mins",
        category: "Bestsellers", tag: "Bestseller", rating: "4.9 (3,820)",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop",
        features: ["Full arms, legs & underarms", "Eyebrow & upper lip threading", "Single-use disposables", "Branded rica wax"],
        details: [
          "Rica or chocolate wax on full arms, full legs and underarms",
          "Precision eyebrow shaping and upper-lip threading",
          "Fresh single-use spatulas, strips and sheets opened in front of you",
        ],
      },
      {
        name: "Facial & Cleanup", price: 999, originalPrice: 1499, time: "75 mins",
        category: "Bestsellers", tag: "Glow Up", rating: "4.9 (2,140)",
        image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=600&auto=format&fit=crop",
        features: ["Skin-type consultation", "Deep cleanse & exfoliation", "Massage & mask", "Branded product kit"],
        details: [
          "Short skin-type consultation before the product kit is chosen",
          "Deep cleansing, gentle exfoliation and steam-assisted extraction",
          "Relaxing face and neck massage followed by a suited mask and moisturiser",
        ],
      },
      {
        name: "Pedicure & Manicure", price: 899, originalPrice: 1299, time: "90 mins",
        category: "Combos & Add-ons", tag: "Relaxing", rating: "4.8 (1,610)",
        image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=600&auto=format&fit=crop",
        features: ["Soak, scrub & massage", "Cuticle care & shaping", "Foot mask", "Polish of your choice"],
        details: [
          "Warm soak, scrub and callus removal followed by a foot and calf massage",
          "Cuticle care, nail shaping and buffing on both hands and feet",
          "Nourishing foot mask and a polish shade of your choice to finish",
        ],
      },
    ],
  },
  {
    slug: "mens-grooming-at-home",
    categorySlug: "salon-spa",
    badge: "",
    badgeColor: "bg-slate-900 text-white",
    rating: "4.8 (3,410 reviews)",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1600&auto=format&fit=crop",
    time: "45 mins - 90 mins",
    warranty: "Sanitised-tools guarantee",
    title: "Men's Grooming at Home",
    description: "Haircut, beard styling, head massage and detan by trained male groomers who bring sanitised tools and a professional chair setup.",
    packages: [
      {
        name: "Haircut & Beard Styling", price: 449, originalPrice: 699, time: "45 mins",
        category: "Bestsellers", tag: "Bestseller", rating: "4.8 (1,940)",
        image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop",
        features: ["Consultation & style pick", "Machine + scissor cut", "Beard shaping & line-up", "Sanitised tool kit"],
        details: [
          "Short consultation on length, fade and finish before the first cut",
          "Combination machine and scissor cut with a clean neckline finish",
          "Beard trimming, shaping and a sharp razor line-up",
          "Every tool sanitised and unpacked in front of you",
        ],
      },
      {
        name: "Detan & Head Massage", price: 599, originalPrice: 899, time: "60 mins",
        category: "Combos & Add-ons", tag: "Refresh", rating: "4.8 (760)",
        image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=600&auto=format&fit=crop",
        features: ["Face & neck detan", "Oil head massage", "Steam & cleanup", "Branded products"],
        details: [
          "Detan pack applied across face, neck and hands to lift sun tan",
          "Twenty-minute relaxing oil head and shoulder massage",
          "Steam-assisted cleanup and moisturiser to finish",
        ],
      },
    ],
  },
];

async function main() {
  // Categories first — services reference them by slug.
  const categoryIdBySlug = new Map();
  for (const cat of CATEGORIES) {
    const saved = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryIdBySlug.set(saved.slug, saved.id);
  }
  console.log(`Categories ready: ${CATEGORIES.length}`);

  for (const svc of SERVICES) {
    const existing = await prisma.service.findUnique({ where: { slug: svc.slug } });
    if (existing) {
      console.log(`Skipping "${svc.title}" — slug "${svc.slug}" already exists`);
      continue;
    }

    const { packages, categorySlug, ...serviceData } = svc;
    const categoryId = categoryIdBySlug.get(categorySlug);
    if (!categoryId) {
      throw new Error(`Service "${svc.slug}" references unknown category slug "${categorySlug}"`);
    }

    const created = await prisma.service.create({
      data: {
        ...serviceData,
        categoryId,
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
