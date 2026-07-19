export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  tags?: string[];
  author: string;
  authorDescription?: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
  slug: string;
}

export const MOCK_BLOGS: BlogPost[] = [
  {
    id: "1",
    title: "10 Essential Plumbing Checks for Homeowners",
    excerpt: "Prevent costly water damage with these simple plumbing maintenance tips you can do yourself.",
    content: "<p>Plumbing issues can turn from a minor annoyance into a major disaster if left unchecked. As a homeowner, performing regular inspections can save you thousands of rupees in water damage and emergency repair bills. Start by routinely checking the cabinets under your sinks for any signs of moisture, dampness, or strange odors.</p><p>Next, pay attention to your water pressure. A sudden drop in pressure could indicate a hidden leak or sediment buildup in your aerators. Don't forget to test your toilets for silent leaks by placing a few drops of food coloring in the tank—if the color seeps into the bowl without flushing, you have a leak. By staying proactive, you ensure your home's plumbing remains in top condition year-round.</p>",
    tags: ["Plumbing", "Maintenance", "DIY Tips"],
    author: "Mike Plumber",
    authorDescription: "Licensed master plumber with over 15 years of residential repair experience.",
    date: "MAY 27, 2026",
    category: "PLUMBING",
    readTime: "5 min",
    image: "/banner_services.png",
    slug: "essential-plumbing-checks",
  },
  {
    id: "2",
    title: "Top 10 Home Improvement Hacks on a Budget",
    excerpt: "Upgrade your living space without breaking the bank using these simple DIY hacks.",
    content: "<p>You don't need a massive budget to breathe new life into your home. One of the most effective and affordable ways to upgrade any room is a fresh coat of paint. Whether you're doing an accent wall or brightening up a dark hallway, paint offers the highest return on investment. Furthermore, updating cabinet hardware in your kitchen or bathroom can completely transform the space for just a few rupees per handle.</p><p>Another excellent hack is utilizing smart lighting. Installing dimmer switches or smart LED bulbs allows you to change the ambiance of a room instantly. For exterior curb appeal, simply pressure washing your driveway and planting some low-maintenance perennials can make your home look brand new. Small, thoughtful updates always beat expensive overhauls.</p>",
    tags: ["Home Improvement", "DIY", "Budgeting"],
    author: "Alex Johnson",
    authorDescription: "DIY enthusiast and budget home improvement expert.",
    date: "JUN 12, 2026",
    category: "HOME IMPROVEMENT",
    readTime: "8 min",
    image: "/banner_blog.png",
    slug: "top-10-home-improvement-hacks",
  },
  {
    id: "3",
    title: "The Ultimate Seasonal Maintenance Checklist",
    excerpt: "Keep your home in top shape year-round with this comprehensive guide to seasonal chores.",
    content: "<p>Every season brings its own set of challenges for your home's exterior and interior. In the spring, your focus should be on checking the roof for winter damage, cleaning out the gutters, and servicing your AC unit before the summer heat hits. Neglecting the AC could lead to inefficient cooling and higher energy bills.</p><p>As fall approaches, the priority shifts to winterization. This means sealing drafts around windows and doors, draining outdoor faucets to prevent frozen pipes, and ensuring your heating system is clean and functional. Following a strict seasonal checklist ensures that small maintenance tasks don't compound into massive, expensive repairs down the line.</p>",
    tags: ["Maintenance", "Checklist", "Seasonal"],
    author: "Sarah Connor",
    authorDescription: "Professional home inspector and seasonal maintenance consultant.",
    date: "JUL 05, 2026",
    category: "MAINTENANCE",
    readTime: "10 min",
    image: "/banner_about.png",
    slug: "seasonal-maintenance-checklist",
  },
  {
    id: "4",
    title: "How to Choose the Perfect Interior Paint Color",
    excerpt: "Expert tips on selecting the perfect palette for your living room and bedrooms.",
    content: "<p>Choosing a paint color can be overwhelming given the thousands of swatches available. The secret is to start by identifying the mood you want to set. Warm colors like terracotta and soft yellows create a cozy, energetic vibe, perfect for kitchens and living rooms. Conversely, cool tones like slate blue and sage green are incredibly calming, making them ideal for bedrooms and bathrooms.</p><p>Always test your paint choices before committing. Paint a large square on your wall and observe how the color changes throughout the day. Natural light in the morning will make the color look vastly different than warm artificial light in the evening. Don't rush the process; the right color will tie your entire home's aesthetic together perfectly.</p>",
    tags: ["Design", "Painting", "Interior"],
    author: "Emma Design",
    authorDescription: "Interior designer specializing in modern, functional aesthetics.",
    date: "SEP 22, 2026",
    category: "DESIGN",
    readTime: "7 min",
    image: "/banner_blog.png",
    slug: "choosing-the-right-paint-color",
  },
  {
    id: "5",
    title: "Electrical Safety 101: When to Call a Pro",
    excerpt: "Learn how to spot dangerous electrical issues in your home and when it's time to call an expert.",
    content: "<p>While DIY projects can be fun and rewarding, electrical work is one area where you should exercise extreme caution. Flickering lights, outlets that are warm to the touch, or breakers that constantly trip are massive red flags. These symptoms often indicate overloaded circuits or faulty wiring, which are primary causes of electrical fires.</p><p>If you're dealing with anything more complicated than changing a light fixture or replacing a standard switch plate, it's time to call a licensed electrician. Professionals have the tools and training to diagnose complex issues safely. Never compromise your home's safety to save a few bucks on electrical repairs.</p>",
    tags: ["Electrical", "Safety", "Professional Help"],
    author: "David Volt",
    authorDescription: "Licensed electrician passionate about home safety and smart home integrations.",
    date: "OCT 14, 2026",
    category: "ELECTRICAL",
    readTime: "6 min",
    image: "/banner_services.png",
    slug: "electrical-safety-101",
  },
  {
    id: "6",
    title: "Winterizing Your Garden & Outdoor Spaces",
    excerpt: "Protect your plants and prepare your patio furniture for the harsh winter months.",
    content: "<p>Your outdoor spaces need just as much attention as the interior when preparing for winter. Begin by pruning dead branches from trees and shrubs to prevent them from snapping under the weight of heavy snow and damaging your property. You should also lay down a thick layer of mulch around your perennials to insulate their roots against freezing temperatures.</p><p>Don't forget your patio furniture and outdoor plumbing. Drain all garden hoses and store them inside, and shut off the valve to your outdoor spigots. Cover your outdoor furniture with weatherproof tarps or move them into the garage. Taking these steps ensures your yard and patio will be ready to flourish the moment spring arrives.</p>",
    tags: ["Gardening", "Winter", "Outdoors"],
    author: "Green Thumb",
    authorDescription: "Master gardener and landscape architect.",
    date: "OCT 30, 2026",
    category: "GARDENING",
    readTime: "4 min",
    image: "/banner_services.png",
    slug: "winterizing-your-garden",
  }
];
