// Canonical storefront categories, shared by seed.js and
// backfill-categories.js so the two can never drift apart.
//
// `name` values here must exactly match the legacy Service.category strings
// that existed before the Category table — that's the join key the backfill
// uses to link existing services.
//
// Images are placeholders carried over from the old hardcoded CategoryGrid
// array (all on images.unsplash.com, which is already in next.config.ts's
// remotePatterns). Admins can replace them from /admin/categories.
const CATEGORIES = [
  {
    slug: "ac-appliance",
    name: "AC & Appliance",
    description: "AC service, washing machine, refrigerator, chimney and microwave repair.",
    icon: "ph:fan",
    image: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?q=80&w=800&auto=format&fit=crop",
    sortOrder: 0,
  },
  {
    slug: "cleaning",
    name: "Cleaning",
    description: "Full-home deep cleaning, bathroom, sofa and carpet care.",
    icon: "ph:broom",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
    sortOrder: 1,
  },
  {
    slug: "plumbing",
    name: "Plumbing",
    description: "Leak fixes, pipe repair, tap and drainage work.",
    icon: "ph:drop",
    image: "https://images.unsplash.com/photo-1581141849291-1125c7b692b5?q=80&w=800&auto=format&fit=crop",
    sortOrder: 2,
  },
  {
    slug: "electrical",
    name: "Electrical",
    description: "Switchboards, wiring, fittings and electrical safety checks.",
    icon: "ph:lightning",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop",
    sortOrder: 3,
  },
  {
    slug: "carpentry",
    name: "Carpentry",
    description: "Furniture assembly, door and lock repair, drilling and mounting.",
    icon: "ph:hammer",
    image: "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=800&auto=format&fit=crop",
    sortOrder: 4,
  },
  {
    slug: "painting",
    name: "Painting",
    description: "Interior painting, waterproofing, texture and finish work.",
    icon: "ph:paint-roller",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop",
    sortOrder: 5,
  },
  {
    slug: "pest-control",
    name: "Pest Control",
    description: "Cockroach, termite, bed bug and mosquito treatment plans.",
    icon: "ph:bug",
    image: "https://images.unsplash.com/photo-1632935190508-bcaf7b6c4b17?q=80&w=800&auto=format&fit=crop",
    sortOrder: 6,
  },
  {
    slug: "salon-spa",
    name: "Salon & Spa",
    description: "Salon, waxing, facials, spa and grooming at home.",
    icon: "ph:scissors",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop",
    sortOrder: 7,
  },
];

module.exports = { CATEGORIES };
