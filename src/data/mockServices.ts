export type ServicePackage = {
  name: string;
  price: number;
  originalPrice: number;
  time: string;
  features: string[];
  details?: string[];
};

export type ServiceBenefit = {
  icon: string;
  title: string;
  description: string;
};

export type ServiceStep = {
  step: number;
  title: string;
  description: string;
};

export type ServiceFaq = {
  question: string;
  answer: string;
};

export type Service = {
  id: number;
  slug: string;
  category: string;
  badge: string;
  badgeColor: string;
  rating: string;
  image: string;
  time: string;
  warranty: string;
  title: string;
  description: string;
  packages: ServicePackage[];
  benefits?: ServiceBenefit[];
  howItWorks?: ServiceStep[];
  faqs?: ServiceFaq[];
};

// Common dummy data generators for ease of updating
const defaultBenefits: ServiceBenefit[] = [
  { icon: "ph:leaf-duotone", title: "Eco-friendly", description: "We use 100% safe, non-toxic products that are safe for pets and children." },
  { icon: "ph:shield-check-duotone", title: "Verified Pros", description: "Background-checked, highly trained professionals with 5+ years of experience." },
  { icon: "ph:clock-countdown-duotone", title: "On-time Guarantee", description: "If we're late, you get an instant ₹100 discount on your service." },
  { icon: "ph:currency-inr-duotone", title: "Transparent Pricing", description: "No hidden fees. You pay exactly what you see before booking." }
];

const defaultSteps: ServiceStep[] = [
  { step: 1, title: "Book Online", description: "Choose your package, pick a time slot, and confirm your booking instantly." },
  { step: 2, title: "Pro Assigned", description: "A verified professional is assigned to your task and will arrive on time." },
  { step: 3, title: "Service Delivered", description: "The expert completes the job using professional-grade equipment." },
  { step: 4, title: "Payment & Feedback", description: "Pay securely online or in cash, and rate your experience." }
];

const defaultFaqs: ServiceFaq[] = [
  { question: "Are the chemicals used safe for children and pets?", answer: "Yes, we exclusively use hospital-grade, eco-friendly chemicals that are completely safe once dry." },
  { question: "Do I need to provide any equipment or cleaning supplies?", answer: "No, our professionals carry all necessary industry-grade equipment and premium supplies." },
  { question: "What happens if I am not satisfied with the service?", answer: "We offer a 'No Questions Asked' rework guarantee if reported within 24 hours of service completion." },
  { question: "Can I reschedule my booking?", answer: "Yes, you can reschedule up to 2 hours before the service time without any penalty fees." }
];

export const MOCK_SERVICES: Service[] = [
  {
    id: 1,
    slug: "ac-deep-service",
    category: "AC & Appliance",
    badge: "TRENDING",
    badgeColor: "bg-[#00B4FF] text-white",
    rating: "4.9 (12,480)",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1600&auto=format&fit=crop",
    time: "90 min",
    warranty: "30-day warranty",
    title: "AC Deep Service",
    description: "Foam-jet cleaning of coils, filters and drain lines — cooler air, lower bills, and a fresh-out-of-the-box smell.",
    benefits: defaultBenefits,
    howItWorks: defaultSteps,
    faqs: defaultFaqs,
    packages: [
      { 
        name: "Split AC Deep Clean", price: 599, originalPrice: 899, time: "45 mins", 
        features: ["Foam jet cleaning", "Filter & coil wash", "Gas check"],
        details: [
          "Pre-service check of AC parameters (cooling, air flow, noise)",
          "Deep cleaning of indoor unit filters, coil, and drain tray using high-pressure foam jet",
          "Dry vacuuming of outdoor unit",
          "Post-service cleanup of the work area"
        ]
      },
      { 
        name: "Window AC Deep Clean", price: 499, originalPrice: 699, time: "40 mins", 
        features: ["Complete unmounting", "Deep coil wash", "Drainage block clear"],
        details: [
          "Careful unmounting of the Window AC unit",
          "High-pressure water wash of the condenser and evaporator coils",
          "Clearing of drainage blockages to prevent leaks",
          "Safe remounting and performance check"
        ]
      },
    ],
  },
  {
    id: 2,
    slug: "full-home-deep-cleaning",
    category: "Cleaning",
    badge: "MOST BOOKED",
    badgeColor: "bg-white text-slate-900",
    rating: "4.8 (9,410)",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1600&auto=format&fit=crop",
    time: "5 hrs",
    warranty: "7-day redo warranty",
    title: "Full Home Deep Cleaning",
    description: "4-member crew, 42-point checklist, hospital-grade disinfectant. Move-in ready in a single afternoon.",
    benefits: defaultBenefits,
    howItWorks: defaultSteps,
    faqs: defaultFaqs,
    packages: [
      { 
        name: "Complete Home (Furnished)", price: 4299, originalPrice: 5599, time: "6 hrs", 
        features: ["Floor scrubbing & polish", "Bathroom acid wash", "Furniture dry vacuuming"],
        details: [
          "Deep cleaning of all rooms including dry vacuuming of furniture",
          "Intensive bathroom cleaning with descaling and acid wash",
          "Kitchen deep clean including appliance exteriors",
          "Floor scrubbing using industrial-grade machines"
        ]
      },
      { 
        name: "Kitchen & Bathroom", price: 1899, originalPrice: 2499, time: "3 hrs", 
        features: ["Tile descaling", "Chimney surface degrease", "Exhaust cleaning"],
        details: [
          "Degreasing of kitchen chimney, exhaust fan, and stovetop",
          "Descaling of bathroom tiles, taps, and showerheads",
          "Deep scrubbing of floors and hard-to-reach corners",
          "Stain removal from sinks and countertops"
        ]
      },
    ],
  },
  {
    id: 3,
    slug: "bathroom-deep-cleaning",
    category: "Cleaning",
    badge: "VALUE",
    badgeColor: "bg-slate-900 text-white dark:bg-black dark:text-white",
    rating: "4.8 (22,110)",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1600&auto=format&fit=crop",
    time: "60 min",
    warranty: "48-hr warranty",
    title: "Bathroom Deep Cleaning",
    description: "Descaling on tiles, taps and glass. Deep grout scrub with eco-safe acids — leaves zero streaks or fumes.",
    benefits: defaultBenefits,
    howItWorks: defaultSteps,
    faqs: defaultFaqs,
    packages: [
      { 
        name: "Deep Clean (1 Bathroom)", price: 399, originalPrice: 599, time: "60 mins", 
        features: ["Hard water stain removal", "Floor/wall tile scrubbing", "Mirror polishing"],
        details: [
          "Removal of hard water stains from glass partitions and mirrors",
          "Deep scrubbing of floor and wall tiles to remove grime",
          "Thorough cleaning and sanitization of the WC",
          "Polishing of all metallic fixtures and taps"
        ]
      },
      { 
        name: "Deep Clean (2 Bathrooms)", price: 699, originalPrice: 999, time: "2 hrs", 
        features: ["Combo discount", "Grout restoration", "WC deep sanitation"],
        details: [
          "Includes everything in the 1 Bathroom package, applied to 2 bathrooms",
          "Grout restoration to whiten spaces between tiles",
          "Deep sanitization and odor removal treatments",
          "Eco-friendly, fume-free chemicals used"
        ]
      },
    ],
  },
  {
    id: 4,
    slug: "sofa-spa-cleaning",
    category: "Cleaning",
    badge: "NEW",
    badgeColor: "bg-[#00B4FF] text-white",
    rating: "4.7 (5,210)",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1600&auto=format&fit=crop",
    time: "45 min/seat",
    warranty: "No warranty",
    title: "Sofa Spa Cleaning",
    description: "Hot-water extraction and shampooing for deep stain and pet odor removal. Dries in just 4 hours.",
    benefits: defaultBenefits,
    howItWorks: defaultSteps,
    faqs: defaultFaqs,
    packages: [
      { 
        name: "Sofa Spa (3 Seats)", price: 749, originalPrice: 999, time: "1.5 hrs", 
        features: ["Dry dust vacuuming", "Shampoo spot treatment", "Wet vacuum extraction"],
        details: [
          "Deep dry vacuuming to remove surface dust and crumbs",
          "Application of fabric-safe shampoo and spot treatment for stains",
          "Wet vacuum extraction to pull out embedded dirt and moisture",
          "Leaves the sofa smelling fresh; dries within 3-4 hours"
        ]
      },
      { 
        name: "Carpet Shampooing", price: 599, originalPrice: 799, time: "1 hr", 
        features: ["Deep pile brush", "Stain pre-treatment", "Deodorization spray"],
        details: [
          "Pre-treatment of stubborn stains and high-traffic areas",
          "Deep pile brushing to loosen dirt trapped in fibers",
          "Complete shampooing and extraction process",
          "Deodorization spray to eliminate lingering odors"
        ]
      },
    ],
  },
  {
    id: 5,
    slug: "leak-fix-pipe-repair",
    category: "Plumbing",
    badge: "ESSENTIAL",
    badgeColor: "bg-emerald-500 text-white",
    rating: "4.9 (15,300)",
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=1600&auto=format&fit=crop",
    time: "30 min",
    warranty: "15-day warranty",
    title: "Leak Fix & Pipe Repair",
    description: "Quick diagnosis and fixing of dripping taps, blocked drains, or leaking pipes with guaranteed no-mess service.",
    benefits: defaultBenefits,
    howItWorks: defaultSteps,
    faqs: defaultFaqs,
    packages: [
      { 
        name: "Tap/Mixer Repair", price: 149, originalPrice: 249, time: "30 mins", 
        features: ["Washer replacement", "Spindle change", "Leakage test"],
        details: [
          "Inspection of the leaking tap or mixer",
          "Replacement of worn-out washers, O-rings, or spindles (parts extra)",
          "Reassembly and pressure testing to ensure no leaks",
          "Clean-up of the work area post-repair"
        ]
      },
      { 
        name: "Drain Blockage Fix", price: 299, originalPrice: 399, time: "45 mins", 
        features: ["High-pressure flush", "Siphon trap clean", "Chemical descaling"],
        details: [
          "Opening and cleaning of the P-trap or siphon",
          "Use of manual snakes or high-pressure flush for deep clogs",
          "Chemical descaling for minor organic blockages",
          "Final water flow test to ensure perfect drainage"
        ]
      },
    ],
  },
  {
    id: 6,
    slug: "switchboard-wiring",
    category: "Electrical",
    badge: "POPULAR",
    badgeColor: "bg-orange-500 text-white",
    rating: "4.8 (8,900)",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1600&auto=format&fit=crop",
    time: "45 min",
    warranty: "30-day warranty",
    title: "Switchboard & Wiring",
    description: "Safe installation, repair, and replacement of switches, MCBs, and general wiring by certified electricians.",
    benefits: defaultBenefits,
    howItWorks: defaultSteps,
    faqs: defaultFaqs,
    packages: [
      { 
        name: "Switch/Socket Fix", price: 99, originalPrice: 149, time: "30 mins", 
        features: ["Burnout replacement", "Current leakage test", "Modular fitting"],
        details: [
          "Diagnosis of faulty or burnt-out switches/sockets",
          "Safe removal and replacement with new modular units (parts extra)",
          "Testing for correct voltage and earth leakage",
          "Securing the faceplate and testing the appliance"
        ]
      },
      { 
        name: "Fan Installation", price: 199, originalPrice: 299, time: "45 mins", 
        features: ["Secure canopy mount", "Regulator connection", "Blade balancing"],
        details: [
          "Safe unboxing and assembly of the new ceiling fan",
          "Secure mounting of the downrod and canopy to the ceiling hook",
          "Wiring connections including regulator integration",
          "Final balancing test to ensure wobble-free operation"
        ]
      },
    ],
  }
];
