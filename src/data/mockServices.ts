export type ServicePackage = {
  name: string;
  price: number;
  originalPrice: number;
  time: string;
  features: string[];
};

export type Service = {
  id: number;
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
};

export const MOCK_SERVICES: Service[] = [
  {
    id: 1,
    category: "AC & Appliance",
    badge: "TRENDING",
    badgeColor: "bg-[#00B4FF] text-white",
    rating: "4.9 (12,480)",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1600&auto=format&fit=crop",
    time: "90 min",
    warranty: "30-day warranty",
    title: "AC Deep Service",
    description: "Foam-jet cleaning of coils, filters and drain lines — cooler air, lower bills, and a fresh-out-of-the-box smell.",
    packages: [
      { name: "Split AC Deep Clean", price: 599, originalPrice: 899, time: "45 mins", features: ["Foam jet cleaning", "Filter & coil wash", "Gas check"] },
      { name: "Window AC Deep Clean", price: 499, originalPrice: 699, time: "40 mins", features: ["Complete unmounting", "Deep coil wash", "Drainage block clear"] },
    ],
  },
  {
    id: 2,
    category: "Cleaning",
    badge: "MOST BOOKED",
    badgeColor: "bg-white text-slate-900",
    rating: "4.8 (9,410)",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1600&auto=format&fit=crop",
    time: "5 hrs",
    warranty: "7-day redo warranty",
    title: "Full Home Deep Cleaning",
    description: "4-member crew, 42-point checklist, hospital-grade disinfectant. Move-in ready in a single afternoon.",
    packages: [
      { name: "Complete Home (Furnished)", price: 4299, originalPrice: 5599, time: "6 hrs", features: ["Floor scrubbing & polish", "Bathroom acid wash", "Furniture dry vacuuming"] },
      { name: "Kitchen & Bathroom", price: 1899, originalPrice: 2499, time: "3 hrs", features: ["Tile descaling", "Chimney surface degrease", "Exhaust cleaning"] },
    ],
  },
  {
    id: 3,
    category: "Cleaning",
    badge: "VALUE",
    badgeColor: "bg-slate-900 text-white dark:bg-black dark:text-white",
    rating: "4.8 (22,110)",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1600&auto=format&fit=crop",
    time: "60 min",
    warranty: "48-hr warranty",
    title: "Bathroom Deep Cleaning",
    description: "Descaling on tiles, taps and glass. Deep grout scrub with eco-safe acids — leaves zero streaks or fumes.",
    packages: [
      { name: "Deep Clean (1 Bathroom)", price: 399, originalPrice: 599, time: "60 mins", features: ["Hard water stain removal", "Floor/wall tile scrubbing", "Mirror polishing"] },
      { name: "Deep Clean (2 Bathrooms)", price: 699, originalPrice: 999, time: "2 hrs", features: ["Combo discount", "Grout restoration", "WC deep sanitation"] },
    ],
  },
  {
    id: 4,
    category: "Cleaning",
    badge: "NEW",
    badgeColor: "bg-[#00B4FF] text-white",
    rating: "4.7 (5,210)",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1600&auto=format&fit=crop",
    time: "45 min/seat",
    warranty: "No warranty",
    title: "Sofa Spa Cleaning",
    description: "Hot-water extraction and shampooing for deep stain and pet odor removal. Dries in just 4 hours.",
    packages: [
      { name: "Sofa Spa (3 Seats)", price: 749, originalPrice: 999, time: "1.5 hrs", features: ["Dry dust vacuuming", "Shampoo spot treatment", "Wet vacuum extraction"] },
      { name: "Carpet Shampooing", price: 599, originalPrice: 799, time: "1 hr", features: ["Deep pile brush", "Stain pre-treatment", "Deodorization spray"] },
    ],
  },
  {
    id: 5,
    category: "Plumbing",
    badge: "ESSENTIAL",
    badgeColor: "bg-emerald-500 text-white",
    rating: "4.9 (15,300)",
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=1600&auto=format&fit=crop",
    time: "30 min",
    warranty: "15-day warranty",
    title: "Leak Fix & Pipe Repair",
    description: "Quick diagnosis and fixing of dripping taps, blocked drains, or leaking pipes with guaranteed no-mess service.",
    packages: [
      { name: "Tap/Mixer Repair", price: 149, originalPrice: 249, time: "30 mins", features: ["Washer replacement", "Spindle change", "Leakage test"] },
      { name: "Drain Blockage Fix", price: 299, originalPrice: 399, time: "45 mins", features: ["High-pressure flush", "Siphon trap clean", "Chemical descaling"] },
    ],
  },
  {
    id: 6,
    category: "Electrical",
    badge: "POPULAR",
    badgeColor: "bg-orange-500 text-white",
    rating: "4.8 (8,900)",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1600&auto=format&fit=crop",
    time: "45 min",
    warranty: "30-day warranty",
    title: "Switchboard & Wiring",
    description: "Safe installation, repair, and replacement of switches, MCBs, and general wiring by certified electricians.",
    packages: [
      { name: "Switch/Socket Fix", price: 99, originalPrice: 149, time: "30 mins", features: ["Burnout replacement", "Current leakage test", "Modular fitting"] },
      { name: "Fan Installation", price: 199, originalPrice: 299, time: "45 mins", features: ["Secure canopy mount", "Regulator connection", "Blade balancing"] },
    ],
  },
];
