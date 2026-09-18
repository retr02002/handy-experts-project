/**
 * One-off: seeds 6 Home Services (CCTV Installation & Repair, TV Wall
 * Mounting, Mosquito Net Installation, Ceiling Hanger Installation,
 * Mosquito Mesh for Doors/Windows, Sofa & Furniture Repair) with full
 * content — benefits, 4-step process, FAQs, and 3 packages each.
 *
 * Same shape and conventions as seed-appliance-services.ts: content
 * (title/slug/description/benefits/process) supplied by the user; ratings,
 * badges, durations, warranty text, package pricing/features/details and
 * FAQs generated to match the existing catalog's tone. Every package has
 * its own distinct image, never reused across packages or from the hero.
 *
 * Hero and package images are verified-live Unsplash URLs (free licence,
 * no attribution required). Idempotent via upsert on slug — safe to re-run.
 *
 * Run with: npx tsx prisma/seed-home-services.ts
 */
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CATEGORY_SLUG = "home-services";

interface Benefit {
  icon: string;
  title: string;
  description: string;
}
interface Step {
  step: number;
  title: string;
  description: string;
}
interface Faq {
  question: string;
  answer: string;
}
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
interface ServiceSeed {
  slug: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  rating: string;
  image: string;
  time: string;
  warranty: string;
  benefits: Benefit[];
  howItWorks: Step[];
  faqs: Faq[];
  packages: PackageSeed[];
}

const img = (id: string) => `https://images.unsplash.com/${id}?q=80&w=600&auto=format&fit=crop`;

// Hero images — one per service, distinct from every package image below.
const CCTV_IMG = img("photo-1589935447067-5531094415d1");
const TV_MOUNT_IMG = img("photo-1633604712918-6ab1173d0ecd");
const MOSQUITO_NET_IMG = img("photo-1758998243249-4cc82f0df9e8");
const HANGER_IMG = img("photo-1780672484700-dd8e16b8d5a7");
const MOSQUITO_MESH_IMG = img("photo-1758998222336-d48b2390a686");
const SOFA_REPAIR_IMG = img("photo-1573866926487-a1865558a9cf");

// Per-package images — three distinct shots per service, none matching the
// hero or each other.
const CCTV_PKG_IMGS = [
  img("photo-1528312635006-8ea0bc49ec63"), // camera on post — site visit/consultation
  img("photo-1618482914248-29272d021005"), // multi-camera pole mount — single/multi camera install
  img("photo-1557597774-9d273605dfa9"), // assorted security cameras — full system + DVR setup
];
const TV_MOUNT_PKG_IMGS = [
  img("photo-1619233543829-665423afedc3"), // TV on brick wall — small TV mount
  img("photo-1521607630287-ee2e81ad3ced"), // wall-mount TV in room — mid-size with cable concealment
  img("photo-1694032007593-8ead82259b11"), // living room large TV — TV + soundbar setup
];
const MOSQUITO_NET_PKG_IMGS = [
  img("photo-1767032915447-a09b88e07b0c"), // light through mesh — window net
  img("photo-1780324547899-7b08d84dab9d"), // shadow patterns on screen — balcony/door net
  img("photo-1707819056053-c812026680bd"), // window with mesh and bird — bed net setup
];
const HANGER_PKG_IMGS = [
  img("photo-1771586929951-44c90962d3b0"), // clothes on balcony railing — single rod hanger
  img("photo-1762850497702-4d8b7b14b74c"), // clothes drying line — double rod pulley hanger
  img("photo-1782179283847-a9093f3b6c7f"), // laundry drying clothesline — heavy-duty 4-rod system
];
const MOSQUITO_MESH_PKG_IMGS = [
  img("photo-1646164011652-36d408ae5d36"), // close-up window view — window mesh
  img("photo-1769478372643-11b4d4e60722"), // aged weathered window screen — door mesh
  img("photo-1789482739931-bb01ecf90416"), // insect against fine mesh — sliding door track mesh
];
const SOFA_REPAIR_PKG_IMGS = [
  img("photo-1680702699412-7df12ead8846"), // leather couch — deep cleaning
  img("photo-1517858818796-d31fc694c92a"), // fabric sofa upholstery detail — reupholstery
  img("photo-1614808252118-540d86793cb6"), // padded armchair — foam/cushion repair
];

const SERVICES: ServiceSeed[] = [
  {
    slug: "cctv-installation-repair",
    title: "CCTV Installation & Repair",
    description:
      "Professional security camera installation and troubleshooting to keep your home and business safe 24/7.",
    badge: "SECURE & SAFE",
    badgeColor: "bg-indigo-500 text-white",
    rating: "4.7 (2,890 reviews)",
    image: CCTV_IMG,
    time: "60 mins - 180 mins",
    warranty: "90-day installation warranty",
    benefits: [
      { icon: "ph:shield-check-duotone", title: "Highly Trained Security Experts", description: "Trust our background-checked professionals to secure your property with precision." },
      { icon: "ph:video-camera-duotone", title: "Optimal Viewing Angles", description: "We ensure complete blind-spot coverage for maximum, uninterrupted security monitoring." },
      { icon: "ph:plugs-connected-duotone", title: "Concealed & Clean Wiring", description: "Enjoy a beautifully neat installation with perfectly hidden cables and protective piping." },
      { icon: "ph:device-mobile-camera-duotone", title: "Seamless Mobile Integration", description: "Get instant, remote access to your live camera feed directly on your smartphone." },
    ],
    howItWorks: [
      { step: 1, title: "Schedule Your Security Visit", description: "Choose a convenient time for our security experts to visit your home or office." },
      { step: 2, title: "Strategic Site Assessment", description: "We locate the absolute perfect angles and mounting spots for your new cameras." },
      { step: 3, title: "Expert Camera Installation", description: "We securely mount, tightly wire, and safely power up your entire security system." },
      { step: 4, title: "Final Network Testing", description: "We configure the DVR/NVR and ensure your mobile app monitoring works flawlessly." },
    ],
    faqs: [
      { question: "How many cameras do I need for my home?", answer: "It depends on your property size and entry points — our technician assesses this for free during the site visit and recommends the right count and placement." },
      { question: "Can I view the camera feed on my phone from anywhere?", answer: "Yes, every installation includes mobile app setup so you can monitor your property live from anywhere with an internet connection." },
      { question: "Do you provide the cameras and DVR, or do I need to buy them?", answer: "We can supply the full hardware, or install cameras you've already purchased — just let us know when booking." },
      { question: "What happens if a camera stops working after installation?", answer: "Every installation is backed by a 90-day warranty covering both wiring and configuration issues, free of charge." },
    ],
    packages: [
      { name: "Site Visit & Consultation", price: 299, originalPrice: 499, time: "30 mins", category: "Bestsellers", tag: "Bestseller", rating: "4.8 (1,610)", image: CCTV_PKG_IMGS[0], features: ["Free site assessment", "Camera placement plan", "No-obligation quote", "All brands covered"], details: ["On-site walkthrough to identify optimal camera angles and blind spots", "Clear, itemised quote for hardware and installation before any work begins"] },
      { name: "Single Camera Installation", price: 1499, originalPrice: 1999, time: "90 mins", category: "Installation", tag: "Popular", rating: "4.7 (940)", image: CCTV_PKG_IMGS[1], features: ["Camera mounting & wiring", "Weatherproof sealing", "Mobile app setup", "90-day warranty"], details: ["Secure mounting and concealed wiring for one indoor or outdoor camera", "Mobile app pairing so you can view the live feed remotely"] },
      { name: "4-Camera Full System Setup", price: 4999, originalPrice: 6999, time: "180 mins", category: "Installation", tag: "Genuine Parts", rating: "4.8 (720)", image: CCTV_PKG_IMGS[2], features: ["4 cameras + DVR/NVR", "Full property coverage", "Remote monitoring setup", "90-day warranty"], details: ["Installation and wiring of a 4-camera system with a dedicated DVR/NVR recorder", "Complete network configuration and mobile app monitoring setup"] },
    ],
  },
  {
    slug: "tv-wall-mounting",
    title: "TV Wall Mounting",
    description:
      "Secure and perfectly aligned television wall mounting services for an immersive and clutter-free viewing experience.",
    badge: "PRECISION FIT",
    badgeColor: "bg-blue-500 text-white",
    rating: "4.8 (6,140 reviews)",
    image: TV_MOUNT_IMG,
    time: "45 mins - 75 mins",
    warranty: "1-year mounting warranty",
    benefits: [
      { icon: "ph:shield-check-duotone", title: "100% Safe & Secure Mounting", description: "We use heavy-duty wall brackets to ensure your expensive flat-screen TV never falls." },
      { icon: "ph:ruler-duotone", title: "Perfect Laser Alignment", description: "Get the exact ergonomic viewing height and a flawlessly straight screen installation." },
      { icon: "ph:sparkle-duotone", title: "Dust-Free Drilling Process", description: "We use vacuum-assisted drills to keep your beautiful living room completely spotless." },
      { icon: "ph:plugs-duotone", title: "Neat Cable Management", description: "We neatly tie up messy cords to give your entertainment wall a clean, premium look." },
    ],
    howItWorks: [
      { step: 1, title: "Book a Mounting Expert", description: "Pick a time that works perfectly for setting up your home theater or living room." },
      { step: 2, title: "Measure & Mark the Wall", description: "We calculate the optimal eye-level height to guarantee ultimate viewing comfort." },
      { step: 3, title: "Safe & Secure Wall Drilling", description: "We solidly bolt the mounting bracket to the concrete without damaging your paint." },
      { step: 4, title: "Mount & Connect Cables", description: "We carefully hang the TV and instantly connect your set-top box or gaming console." },
    ],
    faqs: [
      { question: "What wall types can you mount a TV on?", answer: "We mount on concrete, brick and drywall — our technician carries the right anchors for each and will advise if reinforcement is needed." },
      { question: "Can you mount a TV I already own, any size?", answer: "Yes, we mount TVs from 24\" up to 75\"+ — just share the screen size when booking so we bring the right bracket." },
      { question: "Will the cables be hidden inside the wall?", answer: "Standard mounting neatly ties and channels cables along the wall; in-wall cable concealment is available as part of our cable management package." },
      { question: "Is the mounting bracket included in the price?", answer: "A standard wall bracket is included; if you'd like a tilting or full-motion bracket, let us know and we'll adjust the quote before starting." },
    ],
    packages: [
      { name: "TV Mounting (up to 32\")", price: 499, originalPrice: 799, time: "45 mins", category: "Bestsellers", tag: "Bestseller", rating: "4.8 (2,980)", image: TV_MOUNT_PKG_IMGS[0], features: ["Wall bracket included", "Laser-level alignment", "Basic cable tie-up", "1-year warranty"], details: ["Secure wall-bracket mounting for TVs up to 32 inches", "Laser-level alignment for a perfectly straight, ergonomic viewing height"] },
      { name: "TV Mounting (33\"-55\") with Cable Concealment", price: 899, originalPrice: 1299, time: "60 mins", category: "Installation", tag: "Popular", rating: "4.8 (2,140)", image: TV_MOUNT_PKG_IMGS[1], features: ["Heavy-duty bracket", "In-wall cable channel", "Set-top box connection", "1-year warranty"], details: ["Heavy-duty bracket mounting for mid-to-large screens up to 55 inches", "Cables neatly channelled along the wall for a clutter-free finish"] },
      { name: "TV + Soundbar Mount & Setup", price: 1299, originalPrice: 1799, time: "75 mins", category: "Installation", tag: "Genuine Parts", rating: "4.7 (1,020)", image: TV_MOUNT_PKG_IMGS[2], features: ["TV + soundbar mounting", "Full A/V cable setup", "Gaming console connection", "1-year warranty"], details: ["Combined TV and soundbar mounting with a fully synced audio-video setup", "Connection of set-top box, gaming console and other entertainment devices"] },
    ],
  },
  {
    slug: "mosquito-net-installation",
    title: "Mosquito Net Installation",
    description:
      "High-quality, durable mosquito net installations for balconies and beds to protect your family from harmful insects.",
    badge: "PEST-FREE",
    badgeColor: "bg-emerald-500 text-white",
    rating: "4.6 (3,520 reviews)",
    image: MOSQUITO_NET_IMG,
    time: "30 mins - 45 mins",
    warranty: "6-month product warranty",
    benefits: [
      { icon: "ph:shield-duotone", title: "Premium Tear-Resistant Nets", description: "We utilize highly durable netting materials that easily withstand daily wear and tear." },
      { icon: "ph:bug-beetle-duotone", title: "Complete Insect Protection", description: "Keep dangerous dengue and malaria mosquitoes completely out of your safe living space." },
      { icon: "ph:wind-duotone", title: "Unrestricted Fresh Airflow", description: "Enjoy a wonderfully cool breeze without compromising on your family's pest safety." },
      { icon: "ph:drop-duotone", title: "Easy to Detach & Wash", description: "Our nets feature convenient magnetic or velcro strips for effortless removal and cleaning." },
    ],
    howItWorks: [
      { step: 1, title: "Request a Measurement Visit", description: "Schedule a quick home visit to get incredibly accurate sizing for your balcony or bed." },
      { step: 2, title: "Precise Space Measurement", description: "We take exact custom dimensions to ensure your new net fits perfectly without gaps." },
      { step: 3, title: "Custom Frame Installation", description: "We securely attach the netting frame to your walls, ensuring a tight, unyielding seal." },
      { step: 4, title: "Final Gap Inspection", description: "We rigorously check every corner to guarantee there are zero entry points for bugs." },
    ],
    faqs: [
      { question: "How do I clean the mosquito net?", answer: "Most of our nets detach with a magnetic or velcro strip, so you can take them down, wash them, and reattach them in minutes." },
      { question: "Will the net block airflow into my balcony or room?", answer: "No — our netting material is designed to keep insects out while letting a full, natural breeze through." },
      { question: "Can you install a net on an irregularly shaped balcony?", answer: "Yes, we take custom measurements for every job, including angled or irregular balcony shapes." },
      { question: "How long does the netting material last?", answer: "Our tear-resistant nets typically last 3-5 years with normal use, and are covered by a 6-month product warranty from installation." },
    ],
    packages: [
      { name: "Window Net Installation", price: 399, originalPrice: 599, time: "30 mins", category: "Bestsellers", tag: "Bestseller", rating: "4.7 (1,860)", image: MOSQUITO_NET_PKG_IMGS[0], features: ["Custom-fit netting", "Magnetic strip closure", "Per-window pricing", "6-month warranty"], details: ["Custom-measured mosquito netting fitted to a single window frame", "Magnetic closure strip for effortless daily opening and cleaning"] },
      { name: "Balcony/Door Net Installation", price: 699, originalPrice: 999, time: "45 mins", category: "Installation", tag: "Popular", rating: "4.6 (1,240)", image: MOSQUITO_NET_PKG_IMGS[1], features: ["Full balcony/door coverage", "Reinforced frame", "Velcro or magnetic strips", "6-month warranty"], details: ["Full-coverage netting for balcony openings or sliding doors", "Reinforced frame installation for a tight, gap-free seal"] },
      { name: "Bed Mosquito Net Setup", price: 499, originalPrice: 749, time: "30 mins", category: "Installation", tag: "Quick Fix", rating: "4.6 (420)", image: MOSQUITO_NET_PKG_IMGS[2], features: ["Ceiling or frame-mounted", "Easy-access opening", "Machine-washable net", "6-month warranty"], details: ["Ceiling or bed-frame mounted canopy netting sized to your bed", "Easy-access opening for nightly use, fully machine washable"] },
    ],
  },
  {
    slug: "hanger-installation",
    title: "Ceiling Hanger Installation",
    description:
      "Sturdy and space-saving ceiling cloth drying hanger installations for effortless laundry management.",
    badge: "SPACE SAVER",
    badgeColor: "bg-cyan-500 text-white",
    rating: "4.7 (2,970 reviews)",
    image: HANGER_IMG,
    time: "30 mins - 60 mins",
    warranty: "1-year installation warranty",
    benefits: [
      { icon: "ph:arrows-out-line-vertical-duotone", title: "Ultimate Space Optimization", description: "Free up your crowded balcony floor by brilliantly utilizing empty overhead ceiling space." },
      { icon: "ph:anchor-simple-duotone", title: "Heavy-Duty Load Capacity", description: "Hang wet, heavy blankets and thick winter clothes safely without any fear of breakage." },
      { icon: "ph:shield-check-duotone", title: "Premium Rust-Proof Steel", description: "We install high-grade stainless steel rods that will never stain your freshly washed clothes." },
      { icon: "ph:arrows-down-up-duotone", title: "Smooth Pulley Mechanism", description: "Effortlessly raise and lower the drying rods with our high-quality, anti-friction nylon ropes." },
    ],
    howItWorks: [
      { step: 1, title: "Schedule an Installation", description: "Book an expert handyman to set up your convenient ceiling hanger system quickly." },
      { step: 2, title: "Precise Ceiling Marking", description: "We carefully map out the exact drilling spots to ensure the hanger is perfectly balanced." },
      { step: 3, title: "Secure Ceiling Drilling", description: "We safely install heavy-duty concrete anchors for maximum weight-bearing stability." },
      { step: 4, title: "Final Pulley Testing", description: "We string the ropes and thoroughly test the pulling mechanism for smooth operation." },
    ],
    faqs: [
      { question: "How much weight can the hanger safely hold?", answer: "Our standard stainless steel rods support up to 15-20kg per rod — enough for wet blankets and heavy winter clothing." },
      { question: "Will drilling damage my false ceiling?", answer: "We use anchors rated for your specific ceiling type and always confirm structural suitability before drilling — false ceilings may need an alternate mounting point, which we'll advise on-site." },
      { question: "Can the rods be raised and lowered easily?", answer: "Yes, our pulley-based systems use a smooth nylon rope mechanism so you can lower rods to load or unload clothes without a ladder." },
      { question: "Do the rods rust over time?", answer: "No, we only install rust-proof stainless steel rods, so your clothes stay stain-free for years." },
    ],
    packages: [
      { name: "Single Rod Ceiling Hanger", price: 349, originalPrice: 549, time: "30 mins", category: "Bestsellers", tag: "Bestseller", rating: "4.7 (1,540)", image: HANGER_PKG_IMGS[0], features: ["1 stainless steel rod", "Ceiling anchor mounting", "Up to 15kg capacity", "1-year warranty"], details: ["Installation of one heavy-duty stainless steel drying rod", "Concrete ceiling anchors rated for daily laundry loads"] },
      { name: "Double Rod Pulley Hanger", price: 649, originalPrice: 949, time: "45 mins", category: "Installation", tag: "Popular", rating: "4.7 (980)", image: HANGER_PKG_IMGS[1], features: ["2 rods with pulley system", "Smooth nylon ropes", "Up to 20kg per rod", "1-year warranty"], details: ["Two-rod system with a pulley mechanism for easy raising and lowering", "Anti-friction nylon ropes for smooth day-to-day operation"] },
      { name: "Heavy-Duty 4-Rod Hanger System", price: 999, originalPrice: 1399, time: "60 mins", category: "Installation", tag: "Genuine Parts", rating: "4.6 (450)", image: HANGER_PKG_IMGS[2], features: ["4-rod full system", "Reinforced ceiling anchors", "Ideal for large families", "1-year warranty"], details: ["Full 4-rod drying system for large balconies or big families", "Reinforced anchoring rated for the combined weight of all four rods"] },
    ],
  },
  {
    slug: "mosquito-mesh-installation",
    title: "Mosquito Mesh for Doors/Windows",
    description:
      "Custom-fitted mosquito mesh for doors and windows to block pests while maintaining excellent home ventilation.",
    badge: "CLEAR VIEW",
    badgeColor: "bg-teal-500 text-white",
    rating: "4.6 (2,340 reviews)",
    image: MOSQUITO_MESH_IMG,
    time: "35 mins - 60 mins",
    warranty: "1-year product warranty",
    benefits: [
      { icon: "ph:frame-corners-duotone", title: "Precision Custom-Fit Frames", description: "We tailor every single mesh screen to fit your specific door or window dimensions flawlessly." },
      { icon: "ph:eye-slash-duotone", title: "High-Visibility Clear Mesh", description: "Enjoy completely unobstructed outside views with our ultra-thin, nearly invisible netting." },
      { icon: "ph:shield-star-duotone", title: "Sturdy Aluminum Framing", description: "Our highly durable, rust-free framing ensures your mesh screens last for years without bending." },
      { icon: "ph:sparkle-duotone", title: "Low Maintenance & Easy Clean", description: "A simple, quick wipe is all it takes to keep your protective window screens looking brand new." },
    ],
    howItWorks: [
      { step: 1, title: "Book a Free Consultation", description: "Pick a convenient time for our experts to visit and showcase high-quality mesh material samples." },
      { step: 2, title: "Accurate Frame Measurement", description: "We carefully measure your exact window and door dimensions to guarantee a perfectly snug fit." },
      { step: 3, title: "Custom Screen Fabrication", description: "We build your beautifully tailored mesh frames with extreme precision in our workshop." },
      { step: 4, title: "Final Seamless Installation", description: "We attach the mesh securely to your home fixtures with absolutely zero gaps or loose edges." },
    ],
    faqs: [
      { question: "What's the difference between mosquito net and mosquito mesh?", answer: "Mesh is a rigid, aluminum-framed screen fixed to your window or door frame, while netting is a flexible fabric — mesh is more durable and better suited to permanent door and window fittings." },
      { question: "Can I still open and close my window normally?", answer: "Yes, our mesh frames are built to fit your existing window or door mechanism, including sliding and hinged types." },
      { question: "Does the mesh block much natural light?", answer: "No, our ultra-thin mesh is nearly invisible from indoors and doesn't noticeably reduce light or your view outside." },
      { question: "How is this cleaned and maintained?", answer: "A simple wipe-down every few weeks keeps the mesh clear — no special cleaning products are needed." },
    ],
    packages: [
      { name: "Window Mesh Installation", price: 449, originalPrice: 699, time: "35 mins", category: "Bestsellers", tag: "Bestseller", rating: "4.7 (1,180)", image: MOSQUITO_MESH_PKG_IMGS[0], features: ["Custom aluminum frame", "Clear fine mesh", "Per-window pricing", "1-year warranty"], details: ["Custom-fabricated aluminum-framed mesh fitted to a single window", "Fine, near-invisible mesh that preserves your outside view"] },
      { name: "Door Mesh Installation", price: 699, originalPrice: 999, time: "45 mins", category: "Installation", tag: "Popular", rating: "4.6 (760)", image: MOSQUITO_MESH_PKG_IMGS[1], features: ["Hinged or fixed frame", "Reinforced corners", "Smooth-operating hinges", "1-year warranty"], details: ["Custom mesh door screen with reinforced corner joints", "Smooth-operating hinges fitted to your existing door frame"] },
      { name: "Sliding Door Mesh (Track System)", price: 1199, originalPrice: 1699, time: "60 mins", category: "Installation", tag: "Genuine Parts", rating: "4.6 (400)", image: MOSQUITO_MESH_PKG_IMGS[2], features: ["Sliding track mesh panel", "Roller mechanism", "Heavy-duty aluminum frame", "1-year warranty"], details: ["Track-mounted sliding mesh panel for balcony or patio doors", "Smooth roller mechanism for easy daily sliding"] },
    ],
  },
  {
    slug: "sofa-repair-services",
    title: "Sofa & Furniture Repair",
    description:
      "Professional sofa repair, upholstery replacement, and deep cleaning to restore your furniture's comfort and look.",
    badge: "LIKE NEW",
    badgeColor: "bg-rose-500 text-white",
    rating: "4.7 (4,180 reviews)",
    image: SOFA_REPAIR_IMG,
    time: "60 mins - 180 mins",
    warranty: "30-day service warranty",
    benefits: [
      { icon: "ph:piggy-bank-duotone", title: "Cost-Effective Restoration", description: "Save money by expertly repairing your beloved old sofa instead of buying a brand new one." },
      { icon: "ph:swatches-duotone", title: "Wide Range of Premium Fabrics", description: "Choose from hundreds of luxurious leather, velvet, and cotton upholstery material options." },
      { icon: "ph:armchair-duotone", title: "High-Density Foam Upgrade", description: "Restore that amazing sink-in comfort with high-quality, long-lasting seating cushions." },
      { icon: "ph:house-duotone", title: "Convenient At-Home Service", description: "We perform minor fabric stitching and deep intensive cleaning directly in your living room." },
    ],
    howItWorks: [
      { step: 1, title: "Schedule an Inspection", description: "Book a professional upholsterer to carefully assess your damaged or sagging living room furniture." },
      { step: 2, title: "Fabric & Foam Assessment", description: "We deeply inspect the internal wooden frame, suspension springs, and outer upholstery condition." },
      { step: 3, title: "Transparent Cost Estimate", description: "Pick your desired new fabric and fully approve the transparent repair or reupholstery quote." },
      { step: 4, title: "Expert Sofa Restoration", description: "We expertly replace the foam, fix the broken springs, and stitch the new fabric for a perfect finish." },
    ],
    faqs: [
      { question: "Is it cheaper to repair my sofa than buy a new one?", answer: "In most cases yes — reupholstering or repairing a structurally sound sofa typically costs a fraction of buying new, while keeping furniture you already love." },
      { question: "What fabric options do I have for reupholstery?", answer: "We carry a wide range of leather, velvet and cotton-blend fabric samples for you to choose from during the inspection visit." },
      { question: "Can you fix sagging cushions without replacing the whole sofa?", answer: "Yes — sagging is usually a foam or spring issue, both of which we repair or replace on-site without needing a full reupholstery." },
      { question: "Do you offer this service for chairs and other furniture too?", answer: "Yes, we repair and reupholster armchairs, dining chairs and other upholstered furniture, not just sofas." },
    ],
    packages: [
      { name: "Sofa Deep Cleaning", price: 599, originalPrice: 899, time: "60 mins", category: "Bestsellers", tag: "Bestseller", rating: "4.8 (2,120)", image: SOFA_REPAIR_PKG_IMGS[0], features: ["Deep fabric/leather cleaning", "Stain treatment", "Odour removal", "Per-seat pricing"], details: ["Deep cleaning of fabric or leather upholstery, including embedded dirt and stains", "Odour-neutralising treatment for a fresh, like-new feel"] },
      { name: "Sofa Reupholstery", price: 2499, originalPrice: 3499, time: "180 mins", category: "Restoration", tag: "Premium", rating: "4.7 (860)", image: SOFA_REPAIR_PKG_IMGS[1], features: ["Full fabric replacement", "Choice of premium materials", "Frame & spring check", "30-day warranty"], details: ["Complete fabric replacement with your choice of leather, velvet or cotton-blend material", "Frame and suspension spring inspection before restitching"] },
      { name: "Foam Replacement & Cushion Repair", price: 1299, originalPrice: 1799, time: "90 mins", category: "Restoration", tag: "Popular", rating: "4.6 (1,200)", image: SOFA_REPAIR_PKG_IMGS[2], features: ["High-density foam upgrade", "Cushion restitching", "Sag/spring repair", "30-day warranty"], details: ["Replacement of worn or sagging seat cushions with high-density foam", "Spring and support-webbing repair where needed"] },
    ],
  },
];

async function main() {
  const category = await prisma.category.findUnique({ where: { slug: CATEGORY_SLUG }, select: { id: true, name: true } });
  if (!category) throw new Error(`Category "${CATEGORY_SLUG}" not found — seed it first.`);
  console.log(`Seeding into category: ${category.name} (${category.id})\n`);

  for (const svc of SERVICES) {
    const service = await prisma.service.upsert({
      where: { slug: svc.slug },
      create: {
        slug: svc.slug,
        title: svc.title,
        categoryId: category.id,
        badge: svc.badge,
        badgeColor: svc.badgeColor,
        rating: svc.rating,
        image: svc.image,
        videoUrl: "",
        time: svc.time,
        warranty: svc.warranty,
        description: svc.description,
        benefits: svc.benefits as unknown as Prisma.InputJsonValue,
        howItWorks: svc.howItWorks as unknown as Prisma.InputJsonValue,
        faqs: svc.faqs as unknown as Prisma.InputJsonValue,
      },
      update: {
        title: svc.title,
        categoryId: category.id,
        badge: svc.badge,
        badgeColor: svc.badgeColor,
        rating: svc.rating,
        image: svc.image,
        time: svc.time,
        warranty: svc.warranty,
        description: svc.description,
        benefits: svc.benefits as unknown as Prisma.InputJsonValue,
        howItWorks: svc.howItWorks as unknown as Prisma.InputJsonValue,
        faqs: svc.faqs as unknown as Prisma.InputJsonValue,
      },
      select: { id: true },
    });

    // Packages have no unique key to upsert on — replace the set wholesale
    // so re-running this script never duplicates or orphans old rows.
    await prisma.servicePackage.deleteMany({ where: { serviceId: service.id } });
    await prisma.servicePackage.createMany({
      data: svc.packages.map((p) => ({
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

    console.log(`✓ ${svc.title}  (/services/${svc.slug})  — ${svc.packages.length} packages`);
  }

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
