/**
 * One-off: seeds 8 Appliance Repair services (Washing Machine, Microwave,
 * Geyser, TV, Chimney, Gas Stove, Water Purifier, Laptop/Computer) with
 * full content — benefits, 4-step process, FAQs, and 3 packages each.
 * Deliberately excludes Refrigerator and AC repair, already seeded by hand.
 *
 * Content (title/slug/description/benefits/process) supplied by the user;
 * ratings, badges, durations, warranty text, package pricing/features/
 * details, FAQs and hero images are generated to match the existing
 * catalog's tone and shape (see refrigerator-fridge-repair as reference).
 *
 * Hero images are verified-live Unsplash URLs (free licence, no
 * attribution required). Idempotent via upsert on slug — safe to re-run.
 *
 * Run with: npx tsx prisma/seed-appliance-services.ts
 */
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CATEGORY_SLUG = "appliance-repair";

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

const WASHING_MACHINE_IMG = img("photo-1626806787461-102c1bfaaea1");
const MICROWAVE_IMG = img("photo-1608384156808-418b5c079968");
const GEYSER_IMG = img("photo-1601914697928-0b536e76d048");
const TV_IMG = img("photo-1631679893114-7957e44879db");
const CHIMNEY_IMG = img("photo-1451187863213-d1bcbaae3fa3");
const GAS_STOVE_IMG = img("photo-1629234358103-5b5ee53ece9c");
const WATER_PURIFIER_IMG = img("photo-1619191949276-8deafce6de19");
const LAPTOP_IMG = img("photo-1658240527554-9cf987b4de49");

// Per-package images — distinct from the service hero image above and from
// each other, so a service's 3 packages no longer look identical on the
// storefront. All verified live on images.unsplash.com before use.
const WASHING_MACHINE_PKG_IMGS = [
  img("photo-1668417863230-64f268d1d252"), // row of washing machines — diagnosis
  img("photo-1754732693535-7ffb5e1a51d6"), // motor/belt close-up — motor repair
  img("photo-1761079976271-3a78f547ca67"), // empty drum interior — drum/gasket service
];
const MICROWAVE_PKG_IMGS = [
  img("photo-1612769732688-b7d111799dca"), // microwave on cabinet — diagnosis
  img("photo-1696475091592-cd1cab5afdc2"), // close-up microwave — magnetron/heating fix
  img("photo-1615570640471-c3be64198dcb"), // silver microwave — touch panel/display repair
];
const GEYSER_PKG_IMGS = [
  img("photo-1594233078955-e1f73a02ebb2"), // steel water heater — inspection
  img("photo-1575299737366-39c143459bc5"), // water heater above sink — heating element replacement
  img("photo-1557075643-edba341ea7a2"), // stainless tank — tank descaling
];
const TV_PKG_IMGS = [
  img("photo-1594434885674-0a15708152bf"), // TV in dark room — diagnosis
  img("photo-1631408657211-f485611484af"), // flat screen white display — panel/backlight repair
  img("photo-1665166357844-884711bff962"), // TV screen blue background — motherboard/power repair
];
const CHIMNEY_PKG_IMGS = [
  img("photo-1642979430180-e676c2235ce2"), // hood above stovetop — deep cleaning
  img("photo-1714624107079-9925651c396a"), // extractor hood rustic kitchen — motor/suction repair
  img("photo-1778731525489-439d0dff9e31"), // stainless stove+hood — baffle filter replacement
];
const GAS_STOVE_PKG_IMGS = [
  img("photo-1607324772107-8ad6740ca195"), // gas stove burner detail — safety inspection
  img("photo-1608174427965-06e78e2f29a9"), // burning flames close-up — burner cleaning
  img("photo-1715187289840-02f4710e0aad"), // blue flame close-up — auto-ignition/valve repair
];
const WATER_PURIFIER_PKG_IMGS = [
  img("photo-1542013936693-884638332954"), // tap water access — RO filter change
  img("photo-1669139470813-827cbcf54b20"), // hand holding filtered water — membrane replacement
  img("photo-1556010334-298f19160723"), // spigot dropping water — full system AMC
];
const LAPTOP_PKG_IMGS = [
  img("photo-1721333089073-215a56fd710c"), // technician screwdriver on laptop — full system diagnosis
  img("photo-1604754742629-3e5728249d73"), // hardware/graphics card install — RAM/SSD upgrade
  img("photo-1654593114209-d915f46be333"), // technician working on laptop — virus removal/OS reinstall
];

const SERVICES: ServiceSeed[] = [
  {
    slug: "washing-machine-repair",
    title: "Washing Machine Repair",
    description:
      "Expert repairs for all washing machine types to fix leaks, noise, and spin issues instantly.",
    badge: "QUICK FIX",
    badgeColor: "bg-blue-500 text-white",
    rating: "4.7 (5,320 reviews)",
    image: WASHING_MACHINE_IMG,
    time: "45 mins - 90 mins",
    warranty: "30-day repair warranty",
    benefits: [
      { icon: "ph:star-duotone", title: "Multi-Brand Appliance Experts", description: "Our skilled technicians are highly trained to repair all top washing machine brands." },
      { icon: "ph:clock-fast-duotone", title: "Fast Same-Day Service", description: "Get your laundry routine back on track quickly with our prompt, same-day resolution." },
      { icon: "ph:package-duotone", title: "High-Quality Authentic Spares", description: "We install durable, genuine replacement parts to prevent future expensive breakdowns." },
      { icon: "ph:sparkle-duotone", title: "Clean Post-Repair Experience", description: "We ensure a mess-free service, leaving your laundry area spotless after the fix." },
    ],
    howItWorks: [
      { step: 1, title: "Schedule Your Home Visit", description: "Pick your preferred time slot online for a hassle-free at-home repair visit." },
      { step: 2, title: "Precise Issue Diagnosis", description: "We accurately pinpoint hard-to-find leaks, motor faults, or annoying spinning noises." },
      { step: 3, title: "Fast On-Site Resolution", description: "Our experts perform rapid, reliable fixes right in your home to save you time." },
      { step: 4, title: "Final Post-Repair Testing", description: "We run a complete spin and drain cycle to guarantee everything works perfectly." },
    ],
    faqs: [
      { question: "Do you repair both front-load and top-load machines?", answer: "Yes, our technicians are trained across all major front-load and top-load brands, including Samsung, LG, IFB, Whirlpool and Bosch." },
      { question: "What if the machine needs a part that isn't available on the spot?", answer: "We'll quote the exact part cost upfront and schedule a quick follow-up visit as soon as the genuine part arrives — no extra visit charge." },
      { question: "Will the technician check for leaks and drainage issues too?", answer: "Yes, every visit includes a full inspection of hoses, drainage and the inlet valve, not just the specific issue you reported." },
      { question: "Is there a warranty on the repair?", answer: "Every repair is backed by a 30-day service warranty covering the same issue, completely free of charge." },
    ],
    packages: [
      { name: "Top & Front Load Diagnosis", price: 299, originalPrice: 499, time: "30 mins", category: "Bestsellers", tag: "Bestseller", rating: "4.8 (2,140)", image: WASHING_MACHINE_PKG_IMGS[0], features: ["Complete fault diagnosis", "No-obligation quote", "All brands covered", "Labour included"], details: ["Multi-point electrical and mechanical inspection of the wash and spin cycle", "Clear, itemised quote before any repair work begins", "Covers front-load, top-load and semi-automatic machines"] },
      { name: "Spin/Drain Motor Repair", price: 899, originalPrice: 1299, time: "60 mins", category: "Repairs", tag: "Genuine Parts", rating: "4.7 (1,380)", image: WASHING_MACHINE_PKG_IMGS[1], features: ["Genuine motor/pump parts", "Drain line unclogging", "Belt & coupler check", "60-day part warranty"], details: ["Removal and replacement of the faulty spin or drain motor with genuine parts", "Drain hose and pump filter unclogging to restore full discharge", "Full-load test cycle confirming spin balance and drainage"] },
      { name: "Drum & Gasket Deep Service", price: 649, originalPrice: 999, time: "50 mins", category: "Servicing", tag: "Popular", rating: "4.6 (980)", image: WASHING_MACHINE_PKG_IMGS[2], features: ["Drum descaling & sanitisation", "Gasket mould removal", "Odour treatment", "Full cycle test run"], details: ["Chemical descaling of the wash drum removing detergent residue and hard-water scale", "Rubber gasket cleaning and anti-fungal treatment to stop persistent odour", "Complete test wash cycle verifying spin, drainage and heating"] },
    ],
  },
  {
    slug: "microwave-repair",
    title: "Microwave Oven Repair",
    description: "Quick and safe microwave repairs to resolve heating issues and faulty panels in minutes.",
    badge: "SAFETY CHECKED",
    badgeColor: "bg-amber-500 text-white",
    rating: "4.6 (3,180 reviews)",
    image: MICROWAVE_IMG,
    time: "30 mins - 60 mins",
    warranty: "30-day repair warranty",
    benefits: [
      { icon: "ph:certificate-duotone", title: "Certified Electrical Experts", description: "Trust our rigorously trained professionals to handle complex microwave electronics safely." },
      { icon: "ph:shield-warning-duotone", title: "Guaranteed Radiation Safety", description: "We ensure your appliance is 100% safe to use with zero harmful radiation leaks." },
      { icon: "ph:tag-duotone", title: "Flat-Rate Inspection Fee", description: "Benefit from our standard, highly affordable inspection rates with no price surprises." },
      { icon: "ph:medal-duotone", title: "30-Day Post-Service Guarantee", description: "Cook with confidence knowing our reliable repair work is fully backed for a month." },
    ],
    howItWorks: [
      { step: 1, title: "Choose Your Ideal Time", description: "Enjoy highly flexible scheduling options designed to fit seamlessly around your day." },
      { step: 2, title: "Comprehensive Safety Check", description: "We carefully inspect the magnetron, touch panel, and high-voltage components." },
      { step: 3, title: "Genuine Part Replacement", description: "We swap out any faulty, burnt, or damaged elements with premium branded spares." },
      { step: 4, title: "Final Food Heating Test", description: "We actively verify that your microwave heats food evenly and functions flawlessly." },
    ],
    faqs: [
      { question: "Is it safe to have my microwave repaired instead of replaced?", answer: "Yes — our technicians test for radiation leakage after every repair, so your microwave is certified safe to use again." },
      { question: "Do you repair both solo and convection microwaves?", answer: "We service solo, grill and convection microwaves across all major brands including Samsung, LG, IFB and Bajaj." },
      { question: "My microwave runs but doesn't heat — is that covered?", answer: "Yes, that's one of our most common repairs — usually a faulty magnetron or high-voltage capacitor, both diagnosed on the spot." },
      { question: "What's included in the flat inspection fee?", answer: "The flat fee covers a full diagnostic check; if you approve the repair, that fee is adjusted against your final bill." },
    ],
    packages: [
      { name: "Standard Diagnosis Visit", price: 199, originalPrice: 349, time: "20 mins", category: "Bestsellers", tag: "Bestseller", rating: "4.8 (1,760)", image: MICROWAVE_PKG_IMGS[0], features: ["Full diagnostic check", "Radiation safety test", "No-obligation quote", "All brands covered"], details: ["Complete electrical and mechanical inspection to find the exact fault", "Radiation leakage test performed before and after any repair", "Clear quote provided before any work begins"] },
      { name: "Magnetron / Heating Fix", price: 799, originalPrice: 1199, time: "45 mins", category: "Repairs", tag: "Genuine Parts", rating: "4.6 (640)", image: MICROWAVE_PKG_IMGS[1], features: ["Genuine magnetron/capacitor", "High-voltage safety check", "Even-heating test", "60-day part warranty"], details: ["Replacement of the faulty magnetron or high-voltage capacitor with genuine parts", "Full high-voltage circuit safety inspection", "Even food-heating test across the full cavity"] },
      { name: "Touch Panel / Display Repair", price: 549, originalPrice: 899, time: "40 mins", category: "Repairs", tag: "Quick Fix", rating: "4.5 (410)", image: MICROWAVE_PKG_IMGS[2], features: ["Panel/keypad replacement", "Display calibration", "Function test", "30-day warranty"], details: ["Diagnosis and replacement of unresponsive touch panel or button assembly", "Display and timer calibration after part replacement", "Full function test across all cooking modes"] },
    ],
  },
  {
    slug: "geyser-repair",
    title: "Geyser Service & Repair",
    description: "Professional geyser servicing and repairs for a safe, continuous, and energy-efficient hot water supply.",
    badge: "SAME DAY",
    badgeColor: "bg-emerald-500 text-white",
    rating: "4.7 (4,050 reviews)",
    image: GEYSER_IMG,
    time: "40 mins - 75 mins",
    warranty: "30-day repair warranty",
    benefits: [
      { icon: "ph:shield-check-duotone", title: "Strict Electrical Safety Protocol", description: "We prioritize your family's safety by strictly preventing any electric shock hazards." },
      { icon: "ph:drop-half-duotone", title: "Deep Tank Descaling & Cleaning", description: "We thoroughly remove stubborn hard water buildup to dramatically improve heating efficiency." },
      { icon: "ph:receipt-duotone", title: "Honest & Clear Billing", description: "You only pay the price you agreed upon, with absolutely no hidden material costs." },
      { icon: "ph:lightning-duotone", title: "Rapid Hot Water Restoration", description: "Enjoy a warm bath the very same day with our incredibly fast turnaround times." },
    ],
    howItWorks: [
      { step: 1, title: "Request Easy Home Service", description: "Book a skilled geyser technician directly to your doorstep with just a few clicks." },
      { step: 2, title: "Leak & Wiring Inspection", description: "We thoroughly check your thermostat, internal wiring, and water pipes for safety." },
      { step: 3, title: "Deep Cleaning & Part Repair", description: "We expertly fix burnt heating elements or perform a complete internal tank descale." },
      { step: 4, title: "Heating Efficiency Test", description: "We measure the water heating speed to guarantee peak operational performance." },
    ],
    faqs: [
      { question: "Is it safe to get my geyser repaired rather than calling an electrician?", answer: "Yes — our technicians are trained specifically on geyser electricals and follow a strict safety protocol to rule out any shock hazard before touching the unit." },
      { question: "How often should a geyser be descaled?", answer: "We recommend descaling every 6-12 months in hard-water areas — it noticeably improves heating speed and extends the tank's life." },
      { question: "Do you service both instant and storage geysers?", answer: "Yes, we repair both instant (tankless) and storage geysers across all major brands." },
      { question: "What if my geyser is leaking from the tank itself?", answer: "We'll inspect and advise honestly — a leaking tank sometimes needs replacement rather than repair, and we'll never recommend an unnecessary fix." },
    ],
    packages: [
      { name: "Geyser Inspection & Safety Check", price: 249, originalPrice: 399, time: "30 mins", category: "Bestsellers", tag: "Bestseller", rating: "4.8 (2,010)", image: GEYSER_PKG_IMGS[0], features: ["Electrical safety check", "Thermostat inspection", "Leak check", "No-obligation quote"], details: ["Full inspection of wiring, thermostat and pressure valve for shock/leak risk", "Clear, itemised quote before any repair work begins"] },
      { name: "Heating Element Replacement", price: 899, originalPrice: 1349, time: "60 mins", category: "Repairs", tag: "Genuine Parts", rating: "4.7 (890)", image: GEYSER_PKG_IMGS[1], features: ["Genuine heating element", "Thermostat calibration", "Heating speed test", "60-day part warranty"], details: ["Replacement of the burnt or worn heating element with a genuine, brand-matched part", "Thermostat recalibration for accurate temperature control", "Heating-speed test to confirm peak performance"] },
      { name: "Tank Descaling & Deep Service", price: 599, originalPrice: 949, time: "50 mins", category: "Servicing", tag: "Popular", rating: "4.6 (720)", image: GEYSER_PKG_IMGS[2], features: ["Full tank descaling", "Anode rod check", "Pressure valve test", "Efficiency test"], details: ["Chemical descaling of the tank to remove hard-water scale buildup", "Anode rod and pressure relief valve inspection", "Final heating-efficiency test to confirm improvement"] },
    ],
  },
  {
    slug: "tv-repair",
    title: "Television Repair",
    description: "Screen, audio, and motherboard repairs by certified technicians for uninterrupted entertainment.",
    badge: "EXPERT TECH",
    badgeColor: "bg-violet-500 text-white",
    rating: "4.6 (2,760 reviews)",
    image: TV_IMG,
    time: "45 mins - 120 mins",
    warranty: "30-day repair warranty",
    benefits: [
      { icon: "ph:monitor-duotone", title: "Ultimate Screen Protection", description: "We handle delicate LED and OLED display panels with the utmost care and precision." },
      { icon: "ph:package-duotone", title: "Original High-Quality Parts", description: "We utilize premium motherboards, backlight LEDs, and sound chips for a longer TV lifespan." },
      { icon: "ph:house-duotone", title: "Convenient At-Home Fixes", description: "Avoid the enormous hassle of transporting your heavy, fragile flat-screen TV to a shop." },
      { icon: "ph:magnifying-glass-duotone", title: "Advanced Expert Diagnostics", description: "We utilize precise tracking tools to find hidden audio, video, or motherboard power issues." },
    ],
    howItWorks: [
      { step: 1, title: "Book Your TV Repair Appointment", description: "Select a convenient date and time to get your home entertainment system back online." },
      { step: 2, title: "Detailed Hardware Assessment", description: "Our pros locate the exact fault, whether it is a dead pixel, no sound, or no power." },
      { step: 3, title: "Transparent Cost Estimate", description: "You maintain full control by approving the repair cost before we touch a single wire." },
      { step: 4, title: "Comprehensive A/V Testing", description: "We meticulously ensure you have a crystal-clear picture and perfectly synced sound." },
    ],
    faqs: [
      { question: "Do you repair the TV at my home, or do I need to bring it to a shop?", answer: "All repairs are done at your home — our technicians carry the tools and testing equipment needed for on-site diagnosis and repair." },
      { question: "My TV has no sound but the picture works fine — can this be fixed?", answer: "Yes, this is usually a sound IC or speaker issue and is diagnosed and quoted on the same visit." },
      { question: "Do you work on both LED and OLED TVs?", answer: "Yes, our technicians are trained across LED, OLED and QLED panels from all major brands." },
      { question: "What happens if the TV needs a part you don't carry?", answer: "We'll quote the exact part cost upfront and schedule the fastest possible follow-up visit once the genuine part is sourced." },
    ],
    packages: [
      { name: "TV Diagnosis Visit", price: 249, originalPrice: 399, time: "30 mins", category: "Bestsellers", tag: "Bestseller", rating: "4.7 (1,320)", image: TV_PKG_IMGS[0], features: ["Full hardware diagnosis", "No-obligation quote", "All brands covered", "Labour included"], details: ["Complete diagnostic check of panel, sound, power and motherboard", "Clear, itemised quote before any repair work begins"] },
      { name: "Panel / Backlight Repair", price: 1499, originalPrice: 2199, time: "90 mins", category: "Repairs", tag: "Genuine Parts", rating: "4.6 (540)", image: TV_PKG_IMGS[1], features: ["Genuine backlight/panel parts", "Dead pixel fix", "Colour calibration", "60-day part warranty"], details: ["Replacement of faulty backlight strips or damaged display panel sections", "Colour and brightness calibration after part replacement", "Full-screen test across multiple sources"] },
      { name: "Motherboard / Power Repair", price: 999, originalPrice: 1499, time: "75 mins", category: "Repairs", tag: "Quick Fix", rating: "4.5 (410)", image: TV_PKG_IMGS[2], features: ["Motherboard/power supply fix", "Capacitor replacement", "Full A/V test", "60-day part warranty"], details: ["Diagnosis and repair of motherboard or power supply faults, including capacitor replacement", "Full audio/video test across HDMI, USB and antenna inputs"] },
    ],
  },
  {
    slug: "chimney-repair",
    title: "Chimney Service & Repair",
    description: "Deep degreasing and motor repairs to keep your kitchen smoke-free and hygienic.",
    badge: "DEEP CLEAN",
    badgeColor: "bg-orange-500 text-white",
    rating: "4.7 (3,940 reviews)",
    image: CHIMNEY_IMG,
    time: "40 mins - 75 mins",
    warranty: "30-day repair warranty",
    benefits: [
      { icon: "ph:sparkle-duotone", title: "Completely Mess-Free Cleaning", description: "We use specialized protective covers to ensure your kitchen counters stay spotless." },
      { icon: "ph:wind-duotone", title: "Restored Maximum Suction Power", description: "We clear deep grease blockages to restore your chimney's optimal kitchen airflow." },
      { icon: "ph:speaker-slash-duotone", title: "Significant Noise Reduction", description: "We expertly fix rattling motors and excessive vibrations for a much quieter kitchen." },
      { icon: "ph:leaf-duotone", title: "Safe Eco-Friendly Chemicals", description: "We exclusively use high-quality, non-toxic degreasers that are perfectly safe for your home." },
    ],
    howItWorks: [
      { step: 1, title: "Select Your Service Slot", description: "Pick a highly convenient time for our professional cleaning experts to visit your kitchen." },
      { step: 2, title: "Detailed Motor Inspection", description: "We carefully examine the internal blower and motor for heavy, stubborn grease blockages." },
      { step: 3, title: "Deep Scrubbing & Cleaning", description: "We intensively scrub the baffle filters and repair any malfunctioning suction parts." },
      { step: 4, title: "Final Smoke Extraction Test", description: "We rigorously test the chimney to guarantee it extracts smoke and odors powerfully." },
    ],
    faqs: [
      { question: "How often should a kitchen chimney be cleaned?", answer: "We recommend a deep clean every 3-4 months for regular use, to keep suction strong and prevent motor strain." },
      { question: "Will the cleaning damage my kitchen counters or walls?", answer: "No — we use protective covers throughout the service, so your counters and walls stay completely clean and undamaged." },
      { question: "My chimney is very noisy — can that be fixed?", answer: "Yes, noise is usually caused by grease-clogged blowers or worn motor bearings, both of which we inspect and repair on the spot." },
      { question: "Do you replace baffle filters as well as clean them?", answer: "Yes — if your filters are too worn or damaged to clean effectively, we offer genuine replacement filters as an add-on." },
    ],
    packages: [
      { name: "Chimney Deep Cleaning", price: 499, originalPrice: 799, time: "45 mins", category: "Bestsellers", tag: "Bestseller", rating: "4.8 (2,480)", image: CHIMNEY_PKG_IMGS[0], features: ["Degreasing & descaling", "Baffle filter cleaning", "Mess-free protective covers", "Eco-friendly chemicals"], details: ["Deep degreasing of the blower, ducts and baffle filters using eco-safe chemicals", "Protective covers used throughout to keep your kitchen spotless"] },
      { name: "Motor / Suction Repair", price: 899, originalPrice: 1349, time: "60 mins", category: "Repairs", tag: "Genuine Parts", rating: "4.6 (610)", image: CHIMNEY_PKG_IMGS[1], features: ["Genuine motor replacement", "Vibration & noise fix", "Suction power test", "60-day part warranty"], details: ["Replacement of a worn or failed blower motor with a genuine, brand-matched part", "Vibration and noise diagnosis, including bearing and mounting checks", "Final suction-power test to confirm restored airflow"] },
      { name: "Baffle Filter Replacement", price: 649, originalPrice: 999, time: "40 mins", category: "Servicing", tag: "Popular", rating: "4.5 (390)", image: CHIMNEY_PKG_IMGS[2], features: ["New baffle filters", "Full duct cleaning", "Grease trap clean-out", "Suction test"], details: ["Replacement of worn or damaged baffle filters with genuine parts", "Complete duct and grease-trap cleaning", "Post-service suction test"] },
    ],
  },
  {
    slug: "gas-stove-repair",
    title: "Gas Stove & Hob Service",
    description: "Safe and prompt gas stove repairs to fix low flames, gas leaks, and faulty auto-ignitions.",
    badge: "SAFETY FIRST",
    badgeColor: "bg-red-500 text-white",
    rating: "4.7 (4,610 reviews)",
    image: GAS_STOVE_IMG,
    time: "30 mins - 60 mins",
    warranty: "30-day repair warranty",
    benefits: [
      { icon: "ph:shield-check-duotone", title: "100% Safety Guarantee Assured", description: "We meticulously test everything to ensure there are absolutely zero dangerous gas leaks." },
      { icon: "ph:fire-extinguisher-duotone", title: "Comprehensive Fire Hazard Prevention", description: "We secure all valves and pipe fittings tightly to keep your cooking space completely safe." },
      { icon: "ph:clock-fast-duotone", title: "Extremely Quick Turnaround", description: "We rapidly unclog dirty burners so you can get back to cooking your meals without delay." },
      { icon: "ph:users-duotone", title: "Highly Trained Professionals", description: "Only certified, heavily experienced gas technicians will ever handle your kitchen stove." },
    ],
    howItWorks: [
      { step: 1, title: "Book a Trusted Stove Expert", description: "Easily schedule a reliable home visit for any hob or traditional gas stove repairs." },
      { step: 2, title: "Thorough Leak & Valve Check", description: "We carefully inspect the gas pipes, connection joints, and control knobs for issues." },
      { step: 3, title: "Deep Burner Cleaning & Fix", description: "We meticulously clear out internal blockages to restore a strong, healthy blue flame." },
      { step: 4, title: "Even Flame & Ignition Testing", description: "We ensure the auto-ignition works perfectly and the heat is distributed safely and evenly." },
    ],
    faqs: [
      { question: "Is it safe to have someone check for gas leaks at home?", answer: "Yes — our technicians follow a strict leak-testing protocol on every visit, checking all valves and pipe fittings before and after the repair." },
      { question: "My burner flame is yellow instead of blue — is that a problem?", answer: "Yes, a yellow or uneven flame usually means a clogged burner or airflow issue, and it's one of the most common repairs we handle." },
      { question: "Do you service both 2-burner and 4-burner hobs?", answer: "Yes, we repair gas stoves and hobs of every size and burner count, across all major brands." },
      { question: "What if the auto-ignition isn't sparking?", answer: "We check the igniter, battery and wiring on the spot and can usually fix or replace the faulty part in the same visit." },
    ],
    packages: [
      { name: "Gas Stove Safety Inspection", price: 199, originalPrice: 349, time: "25 mins", category: "Bestsellers", tag: "Bestseller", rating: "4.8 (2,890)", image: GAS_STOVE_PKG_IMGS[0], features: ["Full leak test", "Valve & knob check", "No-obligation quote", "All brands covered"], details: ["Complete leak test across all valves, pipe fittings and connection joints", "Inspection of control knobs and burner caps for wear"] },
      { name: "Burner Cleaning & Repair", price: 349, originalPrice: 549, time: "35 mins", category: "Repairs", tag: "Quick Fix", rating: "4.7 (1,420)", image: GAS_STOVE_PKG_IMGS[1], features: ["Deep burner cleaning", "Flame calibration", "Airflow check", "30-day warranty"], details: ["Deep cleaning of clogged burner heads and jets to restore a strong blue flame", "Airflow and flame-colour calibration across all burners"] },
      { name: "Auto-Ignition / Valve Repair", price: 549, originalPrice: 849, time: "45 mins", category: "Repairs", tag: "Genuine Parts", rating: "4.6 (760)", image: GAS_STOVE_PKG_IMGS[2], features: ["Genuine igniter/valve parts", "Wiring check", "Full ignition test", "60-day part warranty"], details: ["Replacement of a faulty igniter, battery or safety valve with genuine parts", "Full wiring inspection and ignition test across every burner"] },
    ],
  },
  {
    slug: "water-purifier-service",
    title: "Water Purifier / RO Service",
    description: "Comprehensive RO servicing and filter replacements for safe, pure, and healthy drinking water.",
    badge: "HEALTH FIRST",
    badgeColor: "bg-cyan-500 text-white",
    rating: "4.8 (5,870 reviews)",
    image: WATER_PURIFIER_IMG,
    time: "30 mins - 60 mins",
    warranty: "60-day service warranty",
    benefits: [
      { icon: "ph:package-duotone", title: "100% Genuine Branded Filters", description: "We always install authentic carbon filters and high-quality RO membranes for maximum purity." },
      { icon: "ph:drop-half-duotone", title: "Free Pre & Post TDS Level Check", description: "We guarantee optimal water quality by rigorously testing the dissolved solids for free." },
      { icon: "ph:heartbeat-duotone", title: "Family Health & Safety Priority", description: "We ensure every single drop you drink is 100% safe, clean, and healthy for your body." },
      { icon: "ph:shield-check-duotone", title: "Proactive Preventative Maintenance", description: "Our deep servicing prevents future breakdowns and extends the total lifespan of your RO." },
    ],
    howItWorks: [
      { step: 1, title: "Schedule a Technician Visit", description: "Book an expert RO technician online to secure a fast, reliable home appointment." },
      { step: 2, title: "Initial Water TDS Testing", description: "We check the pre-service water quality to fully understand your machine's specific needs." },
      { step: 3, title: "Comprehensive Filter Replacement", description: "We swiftly replace old, dirty membranes and deep clean the internal water storage tank." },
      { step: 4, title: "Final Purity & Taste Check", description: "We conduct detailed post-service water testing to guarantee a crisp, pure, and safe taste." },
    ],
    faqs: [
      { question: "How often should RO filters be changed?", answer: "Typically every 6-12 months depending on your water source and usage — we test your TDS levels to recommend the right schedule." },
      { question: "What is included in the TDS check?", answer: "We test your water quality before and after the service, completely free, so you know exactly how much your purity has improved." },
      { question: "Do you use genuine or generic filters?", answer: "We only install genuine, brand-matched carbon filters and RO membranes — never generic substitutes." },
      { question: "My purifier makes a loud pump noise — is this normal?", answer: "Not always — while some pump sound is normal, an unusually loud or grinding noise usually means the pump needs servicing, which we can check on the spot." },
    ],
    packages: [
      { name: "RO Filter Change & Service", price: 599, originalPrice: 899, time: "40 mins", category: "Bestsellers", tag: "Bestseller", rating: "4.9 (3,240)", image: WATER_PURIFIER_PKG_IMGS[0], features: ["Genuine carbon filters", "Free TDS check", "Tank cleaning", "60-day warranty"], details: ["Replacement of pre and post carbon filters with genuine, brand-matched parts", "Free TDS testing before and after the service", "Internal storage tank cleaning and sanitisation"] },
      { name: "Membrane Replacement", price: 1299, originalPrice: 1899, time: "50 mins", category: "Repairs", tag: "Genuine Parts", rating: "4.7 (980)", image: WATER_PURIFIER_PKG_IMGS[1], features: ["Genuine RO membrane", "Pump pressure check", "Full purity test", "60-day part warranty"], details: ["Replacement of the RO membrane with a genuine, brand-matched part", "Pump pressure and flow-rate inspection", "Final purity and taste test after replacement"] },
      { name: "Full System AMC Visit", price: 449, originalPrice: 699, time: "35 mins", category: "Servicing", tag: "Popular", rating: "4.6 (620)", image: WATER_PURIFIER_PKG_IMGS[2], features: ["Full system checkup", "Filter & membrane inspection", "TDS check", "Leak check"], details: ["Comprehensive inspection of filters, membrane, pump and storage tank", "Free TDS check and leak inspection across all fittings"] },
    ],
  },
  {
    slug: "computer-repair",
    title: "Laptop / Computer Service",
    description: "Reliable hardware and software solutions to boost your computer's speed and performance.",
    badge: "DATA SAFE",
    badgeColor: "bg-slate-700 text-white",
    rating: "4.7 (3,410 reviews)",
    image: LAPTOP_IMG,
    time: "45 mins - 90 mins",
    warranty: "30-day repair warranty",
    benefits: [
      { icon: "ph:lock-key-duotone", title: "Strict Data Privacy Assured", description: "We guarantee 100% secure handling of your highly sensitive personal files and documents." },
      { icon: "ph:cpu-duotone", title: "Advanced Chip-Level Experts", description: "Our technicians are highly trained to perform complex, intricate motherboard and circuit repairs." },
      { icon: "ph:rocket-launch-duotone", title: "Lightning-Fast Hardware Upgrades", description: "Experience a massive speed boost with our quick RAM and solid-state drive installations." },
      { icon: "ph:bug-beetle-duotone", title: "Complete Virus & Malware Removal", description: "We deeply sanitize your operating system, wiping out all harmful bugs and malicious software." },
    ],
    howItWorks: [
      { step: 1, title: "Raise a Quick Repair Request", description: "Book our highly convenient at-home computer repair service to save yourself a trip to the store." },
      { step: 2, title: "Deep System Diagnostics", description: "We run an extensive hardware and software scan to uncover all hidden performance bottlenecks." },
      { step: 3, title: "Expert Repair or OS Install", description: "We expertly fix broken physical components or perform a completely fresh operating system install." },
      { step: 4, title: "Final Performance & Speed Check", description: "We rigorously test your boot time and software responsiveness to ensure a much faster PC." },
    ],
    faqs: [
      { question: "Will my personal files and data be safe during the repair?", answer: "Yes — we follow a strict data-privacy protocol, and no files are accessed, copied or shared without your explicit permission." },
      { question: "Do you repair both laptops and desktop computers?", answer: "Yes, our technicians handle both laptops and desktops, including hardware repairs, upgrades and software issues." },
      { question: "How much faster will my laptop be after an SSD upgrade?", answer: "Most laptops see a dramatic improvement in boot time and app loading — often 3-5x faster — after switching from a hard drive to an SSD." },
      { question: "What if the issue turns out to be a hardware fault that needs a part?", answer: "We'll diagnose the exact fault, quote the part cost upfront, and only proceed once you approve — no surprise charges." },
    ],
    packages: [
      { name: "Full System Diagnosis", price: 299, originalPrice: 499, time: "30 mins", category: "Bestsellers", tag: "Bestseller", rating: "4.8 (1,890)", image: LAPTOP_PKG_IMGS[0], features: ["Full hardware & software scan", "No-obligation quote", "All brands covered", "Labour included"], details: ["Extensive hardware and software diagnostic scan to uncover the exact fault", "Clear, itemised quote before any repair or upgrade begins"] },
      { name: "RAM / SSD Upgrade", price: 999, originalPrice: 1499, time: "45 mins", category: "Repairs", tag: "Quick Fix", rating: "4.8 (1,120)", image: LAPTOP_PKG_IMGS[1], features: ["RAM/SSD installation", "Data migration", "Speed benchmark", "30-day warranty"], details: ["Installation of additional RAM or a solid-state drive to boost performance", "Safe data migration from the old drive where applicable", "Before/after speed benchmark to confirm the improvement"] },
      { name: "Virus Removal & OS Reinstall", price: 649, originalPrice: 999, time: "60 mins", category: "Repairs", tag: "Genuine Parts", rating: "4.6 (740)", image: LAPTOP_PKG_IMGS[2], features: ["Full malware removal", "OS reinstall (if needed)", "Driver updates", "Performance test"], details: ["Deep malware and virus scan with complete removal of malicious software", "Fresh operating system install and driver updates where required", "Final boot-time and responsiveness performance test"] },
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
