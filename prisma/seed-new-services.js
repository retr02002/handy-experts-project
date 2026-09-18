const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const NEW_SERVICES = [
  {
    slug: "electrical-services",
    categorySlug: "home-services-maintainence",
    badge: "TOP RATED",
    badgeColor: "bg-amber-500 text-white",
    rating: "4.9 (12,480 reviews)",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1600&auto=format&fit=crop",
    time: "30 mins - 2 hrs",
    warranty: "30-day service warranty",
    title: "Electrical Services",
    description: "Expert electrical repairs, wiring, and appliance installations to keep your home safe and fully powered.",
    benefits: [
      { icon: "ph:shield-warning-duotone", title: "100% Shock-Proof Safety Assured", description: "Our certified electricians strictly follow advanced safety protocols to completely eliminate fire and shock hazards." },
      { icon: "ph:lightning-duotone", title: "Rapid Fault Detection & Fixing", description: "We quickly diagnose and resolve annoying power trips, flickering lights, and dangerous short circuits." },
      { icon: "ph:plug-duotone", title: "Premium Quality Wiring & Parts", description: "We exclusively utilize ISI-marked cables and heavy-duty switches to ensure long-lasting electrical durability." },
      { icon: "ph:receipt-duotone", title: "Completely Transparent Pricing", description: "You will always know the exact labor and material costs upfront with our highly transparent billing system." }
    ],
    howItWorks: [
      { step: 1, icon: "ph:calendar-plus-duotone", title: "Book a Trusted Electrician", description: "Easily schedule a highly convenient home visit for any minor fixes or major electrical wiring upgrades." },
      { step: 2, icon: "ph:magnifying-glass-duotone", title: "Detailed Power Supply Diagnosis", description: "We meticulously inspect your main circuit breaker and faulty wall outlets to pinpoint the exact electrical issue." },
      { step: 3, icon: "ph:wrench-duotone", title: "Safe & Efficient Repair Work", description: "Our experts safely replace burnt wires, install new switchboards, or securely mount heavy ceiling fans." },
      { step: 4, icon: "ph:lightbulb-duotone", title: "Final Load & Switch Testing", description: "We rigorously test the newly repaired electrical points to guarantee a stable, safe, and continuous power flow." }
    ],
    packages: [
      {
        name: "Switch & Socket Repair", price: 129, originalPrice: 199, time: "30 mins",
        category: "Repairs", tag: "Quick Fix", rating: "4.8 (3,200)",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop",
        features: ["Fault diagnosis", "Burnt switch replacement", "Earthing check", "Live voltage testing"],
        details: ["Complete diagnosis and safe replacement of damaged or burnt electrical switches and sockets."]
      },
      {
        name: "Ceiling Fan Installation", price: 199, originalPrice: 299, time: "45 mins",
        category: "Installations", tag: "Popular", rating: "4.9 (4,150)",
        image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?q=80&w=600&auto=format&fit=crop",
        features: ["Hook mounting", "Regulator wiring", "Blade balancing", "Wobble-free check"],
        details: ["Professional mounting of ceiling fans including blade balancing for noise-free and smooth operation."]
      },
      {
        name: "MCB / Fuse Replacement", price: 249, originalPrice: 399, time: "45 mins",
        category: "Repairs", tag: "Safety First", rating: "4.8 (1,840)",
        image: "https://plus.unsplash.com/premium_photo-1673827306232-28e469d4bd41?q=80&w=600&auto=format&fit=crop",
        features: ["Circuit breakdown check", "Tripping resolution", "MCB replacement", "Load distribution"],
        details: ["Accurate diagnosis of power tripping issues and replacement of faulty MCBs or fuses for continuous power."]
      },
      {
        name: "Full Room Wiring Check", price: 499, originalPrice: 799, time: "1 hr",
        category: "Inspections", tag: "Thorough", rating: "4.7 (950)",
        image: "https://images.unsplash.com/photo-1498084393753-b411b2d26b34?q=80&w=600&auto=format&fit=crop",
        features: ["Complete load check", "Short circuit tracing", "Wire health testing", "Safety report"],
        details: ["A comprehensive inspection of your room's wiring to identify potential hazards and ensure load safety."]
      }
    ]
  },
  {
    slug: "plumbing-services",
    categorySlug: "home-services-maintainence",
    badge: "ESSENTIAL",
    badgeColor: "bg-blue-500 text-white",
    rating: "4.8 (14,320 reviews)",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1600&auto=format&fit=crop",
    time: "45 mins - 2 hrs",
    warranty: "15-day leak warranty",
    title: "Plumbing Services",
    description: "Fast and reliable plumbing solutions for leak repairs, pipe blockages, and new fixture installations.",
    benefits: [
      { icon: "ph:drop-slash-duotone", title: "Guaranteed Zero Leakage Solutions", description: "We expertly seal burst pipes and dripping faucets to prevent structural water damage to your expensive home interiors." },
      { icon: "ph:toilet-duotone", title: "Comprehensive Fixture Installations", description: "Upgrade your bathroom with our flawless installation of modern washbasins, toilets, and high-pressure showerheads." },
      { icon: "ph:clock-fast-duotone", title: "Lightning-Fast Emergency Response", description: "Never let an overflowing sink ruin your day with our incredibly rapid emergency plumbing assistance." },
      { icon: "ph:sparkle-duotone", title: "Hygienic & Mess-Free Execution", description: "Our professionals always clean up the wet work area thoroughly after fixing your drainage or plumbing issues." }
    ],
    howItWorks: [
      { step: 1, icon: "ph:calendar-duotone", title: "Schedule a Plumbing Expert", description: "Quickly book an experienced plumber online to resolve any annoying leaks or sudden drainage blockages." },
      { step: 2, icon: "ph:magnifying-glass-duotone", title: "Thorough Leakage & Pipe Inspection", description: "We carefully examine your hidden water lines and internal drainage systems to locate the exact point of failure." },
      { step: 3, icon: "ph:wrench-duotone", title: "Immediate Repair & Replacement", description: "We rapidly replace rusted angle valves, tightly seal loose pipe joints, and completely unclog choked drains." },
      { step: 4, icon: "ph:drop-duotone", title: "High-Pressure Water Flow Test", description: "We run the water at full capacity to ensure strong pressure and verify that absolutely no hidden leaks remain." }
    ],
    packages: [
      {
        name: "Tap / Mixer Repair", price: 149, originalPrice: 249, time: "30 mins",
        category: "Bestsellers", tag: "Bestseller", rating: "4.9 (8,200)",
        image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=600&auto=format&fit=crop",
        features: ["Spindle replacement", "Washer fix", "Water pressure tuning", "Leak check"],
        details: ["Expert repair of dripping taps and mixers, including internal washer and spindle replacement."]
      },
      {
        name: "Washbasin Pipe Blockage Removal", price: 249, originalPrice: 399, time: "45 mins",
        category: "Repairs", tag: "Quick Clear", rating: "4.8 (4,300)",
        image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&auto=format&fit=crop",
        features: ["Bottle trap cleaning", "Hair & debris removal", "Chemical flush", "Smooth flow test"],
        details: ["Complete unclogging of washbasin pipes, removing hair, grease, and built-up grime for a smooth flow."]
      },
      {
        name: "Toilet Commode Installation", price: 1199, originalPrice: 1599, time: "2 hrs",
        category: "Installations", tag: "Expert Job", rating: "4.7 (1,250)",
        image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=600&auto=format&fit=crop",
        features: ["Old unit removal", "Floor sealing", "Flush tank connection", "Silicone finish"],
        details: ["Safe removal of old commode and professional installation of the new unit with perfect floor sealing."]
      },
      {
        name: "Water Tank Cleaning", price: 699, originalPrice: 999, time: "90 mins",
        category: "Cleaning", tag: "Hygiene", rating: "4.8 (2,600)",
        image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=600&auto=format&fit=crop",
        features: ["De-watering", "High-pressure scrub", "Anti-bacterial spray", "Sludge removal"],
        details: ["Thorough mechanical and high-pressure cleaning of overhead water tanks to ensure hygienic water supply."]
      }
    ]
  },
  {
    slug: "carpentry-services",
    categorySlug: "home-services-maintainence",
    badge: "PRECISION",
    badgeColor: "bg-emerald-600 text-white",
    rating: "4.8 (9,110 reviews)",
    image: "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=1600&auto=format&fit=crop",
    time: "1 hr - 4 hrs",
    warranty: "30-day workmanship warranty",
    title: "Carpenter Services",
    description: "Custom woodwork, furniture repairs, and precise carpentry solutions tailored to elevate your living space.",
    benefits: [
      { icon: "ph:hammer-duotone", title: "Master Craftsmanship & Precision", description: "Rely on our highly skilled carpenters for flawless custom furniture building and incredibly detailed woodwork." },
      { icon: "ph:door-open-duotone", title: "Seamless Door & Window Fixes", description: "Say goodbye to noisy, jammed doors and loose cabinet hinges with our incredibly precise alignment adjustments." },
      { icon: "ph:tree-duotone", title: "Premium Termite-Resistant Wood", description: "We source and utilize only high-quality, chemically treated timber to ensure your furniture lasts for generations." },
      { icon: "ph:ruler-duotone", title: "Perfectly Custom-Tailored Designs", description: "We build bespoke wardrobes, functional modular kitchens, and beautiful bookshelves that match your exact room dimensions." }
    ],
    howItWorks: [
      { step: 1, icon: "ph:calendar-plus-duotone", title: "Book a Master Carpenter", description: "Select a highly convenient date for our carpentry expert to visit your home for a detailed consultation." },
      { step: 2, icon: "ph:ruler-duotone", title: "Accurate Wood & Space Measurement", description: "We take incredibly precise room dimensions and carefully assess any broken furniture that requires structural fixing." },
      { step: 3, icon: "ph:hammer-wrench-duotone", title: "Expert Cutting, Joining & Repair", description: "We skillfully cut, assemble, and tightly screw wooden boards together or expertly fix your damaged table legs." },
      { step: 4, icon: "ph:check-circle-duotone", title: "Final Finishing & Alignment Check", description: "We meticulously inspect the final polish, test all the closing hinges, and ensure every single drawer slides effortlessly." }
    ],
    packages: [
      {
        name: "Door Hinge/Handle Repair", price: 199, originalPrice: 299, time: "45 mins",
        category: "Repairs", tag: "Quick Fix", rating: "4.8 (3,100)",
        image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=600&auto=format&fit=crop",
        features: ["Hinge alignment", "Handle replacement", "Latch adjustment", "Smooth-close testing"],
        details: ["Quick and efficient fixing of misaligned doors, noisy hinges, and loose handles."]
      },
      {
        name: "Furniture Assembly", price: 499, originalPrice: 799, time: "90 mins",
        category: "Bestsellers", tag: "Bestseller", rating: "4.9 (5,240)",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop",
        features: ["Flat-pack assembly", "Structural integrity check", "Screw tightening", "Packaging cleanup"],
        details: ["Expert assembly of all kinds of flat-pack furniture like wardrobes, beds, and tables with precise fitting."]
      },
      {
        name: "Lock Replacement", price: 349, originalPrice: 499, time: "60 mins",
        category: "Repairs", tag: "Security", rating: "4.8 (2,400)",
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=600&auto=format&fit=crop",
        features: ["Lock removal", "New lock fitting", "Key testing", "Door alignment check"],
        details: ["Secure installation of new mortise or cylindrical locks to ensure safety for your home and rooms."]
      },
      {
        name: "Custom Shelf / Drilling", price: 249, originalPrice: 399, time: "45 mins",
        category: "Installations", tag: "Handy", rating: "4.7 (1,850)",
        image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600&auto=format&fit=crop",
        features: ["Safe drilling", "Wall anchor insertion", "Shelf mounting", "Level testing"],
        details: ["Professional drilling and wall mounting for custom shelves, frames, and artwork ensuring a perfectly leveled look."]
      }
    ]
  }
];

const defaultFaqs = [
  { question: "Do you provide a warranty on parts and services?", answer: "Yes! All our services come with a standard 30-day workmanship warranty, and specific repairs include extended coverage for complete peace of mind." },
  { question: "Do I need to arrange any tools or materials?", answer: "No, our verified professionals arrive fully equipped with all necessary tools, and they will source any spare parts needed at transparent retail rates." },
  { question: "How quickly can the professional reach my home?", answer: "For immediate requirements, we typically dispatch a professional to arrive within 60 minutes. You can also pre-schedule a time slot." },
  { question: "What if I am not satisfied with the job done?", answer: "Our Handy Experts Quality Guarantee ensures a 'No Questions Asked' free rework or full refund if you aren't completely happy with the service." },
];

async function seedNewServices() {
  const category = await prisma.category.findUnique({ where: { slug: "home-services-maintainence" } });
  
  if (!category) {
    console.log("Category home-services-maintainence not found! Please make sure it is created in the admin panel.");
    process.exit(1);
  }

  for (const svc of NEW_SERVICES) {
    // Attempt to delete it if it already exists, just in case, to ensure fresh seed
    try {
      await prisma.service.delete({ where: { slug: svc.slug } });
    } catch (e) {
      // Ignore if not found
    }

    const { packages, categorySlug, ...serviceData } = svc;
    
    const created = await prisma.service.create({
      data: {
        ...serviceData,
        categoryId: category.id,
        faqs: defaultFaqs,
        packages: { create: packages },
      },
    });
    console.log("Seeded new service " + created.title + " with " + packages.length + " package(s) under " + categorySlug);
  }
}

seedNewServices()
  .then(() => {
    console.log("New services seeded into home-services-maintainence.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
