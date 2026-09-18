import * as dotenv from 'dotenv';
dotenv.config();

const excludedCategories = [
  'appliance-repair',
  'home-services',
  'electricians-plumbers-carpenters',
];

// High-quality Unsplash fallbacks
const defaultServiceImage = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop";
const defaultPackageImage = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop";

async function verifyImageUrl(url: string, fallback: string): Promise<string> {
  try {
    const res = await fetch(url, { method: 'HEAD', timeout: 5000 });
    if (res.ok) return url;
    console.log(`Image failed verification (${res.status}): ${url}`);
    return fallback;
  } catch (error) {
    console.log(`Image check failed for ${url}, using fallback.`);
    return fallback;
  }
}

const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const seedData = {
  'cleaning-pest-control': [
    {
      title: "Full Home Cleaning",
      badge: "Best Seller",
      badgeColor: "bg-blue-600 text-white dark:bg-blue-500 dark:text-white",
      rating: "4.8 (8.5M+ bookings)",
      isPopular: true,
      image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1974&auto=format&fit=crop",
      time: "4-6 hrs",
      description: "Deep cleaning of your entire house, including floors, bathrooms, and kitchen.",
      benefits: [
        "Deep cleaning of all rooms and surfaces", 
        "Professional eco-friendly chemicals used", 
        "Stain removal guarantee", 
        "Trained and background-verified professionals"
      ],
      howItWorks: [
        { title: "Step 1: Preparation", description: "Our team arrives with all necessary equipment and moves light furniture to ensure maximum coverage.", icon: "ph:toolbox" },
        { title: "Step 2: Dry Cleaning", description: "Comprehensive dry dusting and cobweb removal from ceilings, walls, and corners.", icon: "ph:broom" },
        { title: "Step 3: Wet Cleaning", description: "Deep scrubbing of floors, kitchen tiles, and bathroom walls using professional-grade agents.", icon: "ph:drop" },
        { title: "Step 4: Finishing Touches", description: "Final wipe down of all surfaces, leaving your home spotless and smelling fresh.", icon: "ph:sparkle" }
      ],
      faqs: [
        { question: "Do I need to provide cleaning supplies?", answer: "No, our professionals bring all necessary equipment and eco-friendly chemicals." },
        { question: "Are the chemicals safe for pets and children?", answer: "Absolutely. We use top-tier, non-toxic cleaning agents that are safe for your entire family." },
        { question: "How many professionals will be assigned?", answer: "Depending on the size of the house, a team of 2 to 4 trained professionals will be deployed." },
        { question: "Do you clean the inside of cupboards?", answer: "If the cupboards are emptied beforehand, we will clean the interiors. Otherwise, only exteriors are wiped." }
      ],
      packages: [
        {
          name: "1 BHK Empty House Cleaning",
          price: 2499,
          originalPrice: 3000,
          time: "4 hrs",
          tag: "Most Popular",
          image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop",
          features: [
            "Floor scrubbing with single disc machine", 
            "Bathroom deep clean including acid wash for tough stains", 
            "Kitchen degreasing and slab polishing",
            "Balcony cleaning"
          ],
          details: [
            { title: "What's included", items: ["Floor scrubbing", "Cobweb removal", "Fan and tube light cleaning"] },
            { title: "What's excluded", items: ["Upholstery cleaning", "Exterior window cleaning", "Appliance deep cleaning"] }
          ]
        },
        {
          name: "2 BHK Furnished House Cleaning",
          price: 3599,
          originalPrice: 4500,
          time: "5 hrs",
          image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop",
          features: [
            "Dry vacuuming of up to 5-seater sofa", 
            "Floor scrubbing", 
            "Bathroom & Kitchen deep clean",
            "Mattress dry vacuuming (1 bed)"
          ],
          details: [
            { title: "What's included", items: ["Everything in empty house cleaning", "Basic upholstery vacuuming"] },
            { title: "What's excluded", items: ["Wet shampooing of sofa", "Curtain washing"] }
          ]
        },
        {
          name: "3 BHK Furnished House Cleaning",
          price: 4599,
          originalPrice: 5500,
          time: "6 hrs",
          features: [
            "Dry vacuuming of up to 7-seater sofa", 
            "Floor scrubbing", 
            "3 Bathrooms deep clean", 
            "Kitchen deep clean with appliance exterior wipe"
          ],
          details: [
            { title: "What's included", items: ["Complete deep cleaning of 3 BHK", "Upholstery and mattress vacuuming"] },
            { title: "What's excluded", items: ["Wet shampooing", "Wall washing (only dry dusting included)"] }
          ]
        }
      ]
    },
    {
      title: "Pest Control",
      badge: "Eco-Friendly",
      badgeColor: "bg-green-600 text-white dark:bg-green-500 dark:text-white",
      rating: "4.7 (2.1M+ bookings)",
      image: "https://images.pexels.com/photos/5690987/pexels-photo-5690987.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      time: "1-2 hrs",
      description: "Effective pest control solutions for cockroaches, ants, termites, and bed bugs.",
      benefits: [
        "Government approved Bayer chemicals", 
        "Odorless and non-messy treatment", 
        "Safe for kids, pregnant women, and pets",
        "Up to 90 days warranty on selected services"
      ],
      howItWorks: [
        { title: "Step 1: Inspection", description: "Thorough inspection of the premises to identify pest hotspots.", icon: "ph:magnifying-glass" },
        { title: "Step 2: Gel Application", description: "Strategic application of gel baits in cabinets, which pests consume and take back to their colonies.", icon: "ph:drop-half-bottom" },
        { title: "Step 3: Spraying", description: "Targeted spraying in corners, drains, and entry points.", icon: "ph:spray-bottle" },
        { title: "Step 4: Prevention Advice", description: "Expert guidance on how to prevent future infestations.", icon: "ph:shield-check" }
      ],
      faqs: [
        { question: "Is it safe for pets?", answer: "Yes, we use safe, odorless, and government-approved chemicals." },
        { question: "Do I need to vacate the house?", answer: "For standard cockroach/ant treatment, no vacating is required. For termite or bed bug spray, a 2-hour vacating is advised." },
        { question: "How long is the warranty?", answer: "Our standard cockroach control comes with a 90-day warranty including free revisits if pests return." },
        { question: "Will the gel attract more cockroaches?", answer: "The gel acts as bait; while you may see them come out to eat it, it will ultimately wipe out the entire colony." }
      ],
      packages: [
        {
          name: "Cockroach, Ant & General Pest Control",
          price: 999,
          originalPrice: 1500,
          time: "1 hr",
          features: [
            "Gel bait application for cockroaches", 
            "Odorless spray for ants", 
            "Focus on kitchen, bathrooms, and drain pipes",
            "90 days warranty"
          ],
          details: [
            { title: "What's included", items: ["Gel application", "Corner spraying", "One free revisit within 90 days"] },
            { title: "What's excluded", items: ["Termite treatment", "Bed bug treatment"] }
          ]
        },
        {
          name: "Termite Control - 1 BHK",
          price: 4299,
          originalPrice: 5000,
          time: "2 hrs",
          features: [
            "Drill-fill-seal technique", 
            "1-year service warranty", 
            "Injection of termiticide into wooden fixtures",
            "Chalk sealing of drill holes"
          ],
          details: [
            { title: "What's included", items: ["Drilling 45 degree holes", "Chemical injection", "Sealing with white cement"] },
            { title: "What's excluded", items: ["Painting over the sealed holes", "Replacement of damaged wood"] }
          ]
        }
      ]
    },
    {
      title: "Sofa & Carpet Cleaning",
      rating: "4.8 (1.5M+ bookings)",
      image: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=2070&auto=format&fit=crop",
      time: "1-2 hrs",
      description: "Deep dry vacuuming and wet shampooing of your sofas and carpets.",
      benefits: [
        "Removes deep-seated dust and allergens", 
        "Shampooing removes stubborn stains", 
        "Fabric brightening",
        "Quick drying equipment used"
      ],
      howItWorks: [
        { title: "Step 1: Dry Vacuuming", description: "Industrial vacuum cleaner removes loose dust and debris.", icon: "ph:wind" },
        { title: "Step 2: Pre-treatment", description: "Targeting tough stains with specialized spot removers.", icon: "ph:eyedropper" },
        { title: "Step 3: Shampooing", description: "Application of fabric-safe shampoo and gentle scrubbing.", icon: "ph:drop" },
        { title: "Step 4: Wet Extraction", description: "Powerful wet vacuum extracts dirt and 80% of moisture.", icon: "ph:arrow-circle-up" }
      ],
      faqs: [
        { question: "How long does it take to dry?", answer: "It typically takes 3-4 hours to dry completely under a high-speed ceiling fan." },
        { question: "Will old stains be completely removed?", answer: "We remove up to 90% of stains. However, very old or chemical stains might only lighten." },
        { question: "Is it safe for leather sofas?", answer: "This service is for fabric sofas. We have a separate dry polishing package for leather sofas." },
        { question: "Do you clean the back of the sofa?", answer: "Yes, we clean the seats, armrests, and the back of the sofa completely." }
      ],
      packages: [
        {
          name: "3 Seater Sofa Cleaning",
          price: 899,
          originalPrice: 1200,
          time: "1 hr",
          features: ["Deep dry vacuuming", "Shampooing", "Wet vacuum extraction", "Fabric softening"],
          details: [
            { title: "What's included", items: ["Cleaning of seats, backrests, and armrests"] },
            { title: "What's excluded", items: ["Leather sofa polishing", "Cushion cleaning (charged extra)"] }
          ]
        },
        {
          name: "5 Seater Sofa Cleaning",
          price: 1299,
          originalPrice: 1800,
          time: "1.5 hrs",
          features: ["Deep dry vacuuming", "Shampooing", "Wet vacuum extraction", "Fabric softening"],
          details: [
            { title: "What's included", items: ["Cleaning of up to 5 standard seats"] },
            { title: "What's excluded", items: ["Leather sofas"] }
          ]
        }
      ]
    }
  ],
  'personal-services': [
    {
      title: "Salon for Women",
      badge: "Premium",
      badgeColor: "bg-purple-600 text-white dark:bg-purple-500 dark:text-white",
      rating: "4.9 (5M+ bookings)",
      isPopular: true,
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop",
      time: "45-90 mins",
      description: "Professional salon services at the comfort of your home.",
      benefits: [
        "Top-tier branded products (O3+, RICA, Lotus)", 
        "Hygienic single-use kits", 
        "Trained and background-verified beauticians",
        "Mess-free service with disposable sheets"
      ],
      howItWorks: [
        { title: "Step 1: Setup", description: "Beautician arrives and sets up a comfortable, hygienic portable salon space.", icon: "ph:suitcase" },
        { title: "Step 2: Consultation", description: "Quick consultation on your skin and hair type to ensure the right products are used.", icon: "ph:chats" },
        { title: "Step 3: Service", description: "Expert service delivery using sterilized tools and branded sealed products.", icon: "ph:scissors" },
        { title: "Step 4: Cleanup", description: "Post-service cleanup leaving your space exactly as it was.", icon: "ph:broom" }
      ],
      faqs: [
        { question: "Do you bring your own products?", answer: "Yes, we bring 100% genuine and sealed branded products. You don't need to provide anything." },
        { question: "How is hygiene maintained?", answer: "We use single-use disposable kits, sterilized tools, and the beautician wears a mask and gloves." },
        { question: "Can I customize the package?", answer: "Yes, you can add or remove individual services during checkout." },
        { question: "Do I need to arrange a bed/chair?", answer: "No, our beautician will set up wherever you are most comfortable, though a standard chair or bed works best." }
      ],
      packages: [
        {
          name: "Waxing & Threading (Full Arms + Legs)",
          price: 599,
          originalPrice: 899,
          time: "45 mins",
          features: [
            "RICA / Honey Wax used (based on choice)", 
            "Includes eyebrow & upper lip threading", 
            "Post-wax soothing gel application",
            "Use of disposable wax strips"
          ],
          details: [
            { title: "What's included", items: ["Full arms, full legs waxing", "Threading"] },
            { title: "What's excluded", items: ["Bikini wax", "Underarms (unless added)"] }
          ]
        },
        {
          name: "O3+ Facial & Cleanup",
          price: 1499,
          originalPrice: 2000,
          time: "60 mins",
          tag: "Glow Package",
          features: [
            "Deep cleansing and exfoliation", 
            "Blackhead/whitehead extraction", 
            "Rejuvenating face and neck massage",
            "Premium O3+ face mask"
          ],
          details: [
            { title: "What's included", items: ["6-step O3+ facial process", "Post-facial cleanup"] },
            { title: "What's excluded", items: ["Bleach (can be added separately)"] }
          ]
        },
        {
          name: "Classic Manicure & Pedicure",
          price: 999,
          originalPrice: 1399,
          time: "60 mins",
          features: [
            "Nail shaping & cuticle care", 
            "Deep sea salt scrub & massage", 
            "Callus removal for feet",
            "Premium nail polish application"
          ],
          details: [
            { title: "What's included", items: ["Full mani-pedi service", "Base and top coat polish"] },
            { title: "What's excluded", items: ["Gel polish", "Nail extensions"] }
          ]
        }
      ]
    },
    {
      title: "Massage for Men",
      badge: "Relaxation",
      badgeColor: "bg-teal-600 text-white dark:bg-teal-500 dark:text-white",
      rating: "4.8 (1M+ bookings)",
      image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=1974&auto=format&fit=crop",
      time: "60-90 mins",
      description: "Relaxing and therapeutic massage therapies at home.",
      benefits: [
        "Relieves muscle tension and stress", 
        "Improves blood circulation", 
        "Professional and certified male therapists",
        "Includes a comfortable portable massage table"
      ],
      howItWorks: [
        { title: "Step 1: Consultation", description: "Therapist sets up the bed and consults you on pressure preferences and focus areas.", icon: "ph:chats" },
        { title: "Step 2: Preparation", description: "Warming up muscles with light strokes.", icon: "ph:hand" },
        { title: "Step 3: Therapy", description: "Relaxing or deep tissue therapy session using premium aromatic oils.", icon: "ph:hands-praying" },
        { title: "Step 4: Wind Down", description: "Post-massage hot towel wipe down for ultimate relaxation.", icon: "ph:towel" }
      ],
      faqs: [
        { question: "Do you bring a massage table?", answer: "Yes, a professional folding massage bed is included in all 60+ min sessions." },
        { question: "Are oils provided?", answer: "Yes, we provide premium, skin-safe aromatic massage oils." },
        { question: "Can I request specific focus areas?", answer: "Absolutely, you can instruct the therapist to focus more on your back, legs, or shoulders." },
        { question: "Is this a medical treatment?", answer: "No, this is primarily for relaxation and muscle tension relief, not for treating medical conditions." }
      ],
      packages: [
        {
          name: "Stress Relief Massage (60 mins)",
          price: 1199,
          originalPrice: 1699,
          time: "60 mins",
          features: [
            "Full body Swedish massage techniques", 
            "Aromatic oils for deep relaxation", 
            "Focus on back & neck tension",
            "Hot towel finish"
          ],
          details: [
            { title: "What's included", items: ["Massage bed setup", "60 min hands-on time", "Oils and towels"] },
            { title: "What's excluded", items: ["Shower facility (client's own bathroom used)"] }
          ]
        },
        {
          name: "Deep Tissue Massage (90 mins)",
          price: 1799,
          originalPrice: 2499,
          time: "90 mins",
          features: [
            "Targeted deep pressure techniques", 
            "Relieves chronic knots and sports fatigue", 
            "Full body comprehensive coverage",
            "Extended focus on problematic areas"
          ],
          details: [
            { title: "What's included", items: ["Massage bed setup", "90 min hands-on time", "Deep pressure therapy"] },
            { title: "What's excluded", items: ["Medical/Physiotherapy treatments"] }
          ]
        }
      ]
    }
  ],
  'painting-water-proofing': [
    {
      title: "Interior Painting",
      badge: "Top Rated",
      badgeColor: "bg-orange-600 text-white dark:bg-orange-500 dark:text-white",
      rating: "4.7 (500K+ bookings)",
      image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=2051&auto=format&fit=crop",
      time: "1-3 days",
      description: "Hassle-free professional home painting services.",
      benefits: [
        "Dust-free mechanized sanding", 
        "Accurate laser measurement for pricing", 
        "Complete furniture masking & post-painting cleanup",
        "1-year service warranty"
      ],
      howItWorks: [
        { title: "Step 1: Consultation & Masking", description: "Color consultation followed by heavy-duty masking of your furniture and floors.", icon: "ph:paint-roller" },
        { title: "Step 2: Surface Prep", description: "Filling cracks with putty and mechanized dust-free sanding for a smooth base.", icon: "ph:wall" },
        { title: "Step 3: Painting", description: "Application of primer followed by 2 coats of premium interior paint.", icon: "ph:drop" },
        { title: "Step 4: Cleanup", description: "Removal of masking tapes and basic wet wiping of floors.", icon: "ph:broom" }
      ],
      faqs: [
        { question: "Is the paint cost included?", answer: "Yes, the quoted price is inclusive of labor, genuine paint, and consumables." },
        { question: "Do I need to move furniture?", answer: "Our team will help move light furniture to the center of the room and cover it with plastic sheets." },
        { question: "Which paint brands do you use?", answer: "We exclusively use genuine Asian Paints, Berger, or Dulux products." },
        { question: "Can I test the colors first?", answer: "Yes, our experts can apply a few sample patches on the wall for you to choose from." }
      ],
      packages: [
        {
          name: "1 Room Painting (Rental)",
          price: 3499,
          originalPrice: 4500,
          time: "1 day",
          features: [
            "Tractor emulsion / Distemper paint", 
            "Basic putty touch-ups for nail holes", 
            "Masking of floor and switches",
            "Single coat of primer + 2 coats of paint"
          ],
          details: [
            { title: "What's included", items: ["Labor and paint", "Basic masking", "Touch-up putty"] },
            { title: "What's excluded", items: ["Full wall putty", "Deep cleaning after painting"] }
          ]
        },
        {
          name: "2 BHK Full House Painting",
          price: 15999,
          originalPrice: 20000,
          time: "3 days",
          tag: "Premium",
          features: [
            "Premium washable emulsion paint (Royale/EasyClean)", 
            "2 full coats of wall putty for an ultra-smooth finish", 
            "Complete heavy-duty masking",
            "Mechanized sanding"
          ],
          details: [
            { title: "What's included", items: ["Labor, paint, putty, primer", "Complete house masking", "1-year warranty"] },
            { title: "What's excluded", items: ["Wood/Door polishing (charged extra)"] }
          ]
        }
      ]
    },
    {
      title: "Waterproofing",
      rating: "4.6 (100K+ bookings)",
      image: "https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      time: "2-4 hrs",
      description: "Expert solutions to fix all kinds of water leakage issues.",
      benefits: [
        "Advanced thermal scanning for leak detection", 
        "Use of genuine Dr. Fixit / Asian Paints products", 
        "Up to 5 years warranty on treatments",
        "Non-destructive repair techniques where possible"
      ],
      howItWorks: [
        { title: "Step 1: Inspection", description: "Detailed site inspection using moisture meters and thermal cameras.", icon: "ph:magnifying-glass" },
        { title: "Step 2: Diagnosis", description: "Identifying the root cause and source of the leakage.", icon: "ph:thermometer" },
        { title: "Step 3: Treatment", description: "Application of crack fillers, grouts, and elastomeric waterproof coatings.", icon: "ph:shield-plus" },
        { title: "Step 4: Quality Check", description: "Water ponding tests or secondary scans to ensure the leak is sealed.", icon: "ph:check-circle" }
      ],
      faqs: [
        { question: "Do you provide a warranty?", answer: "Yes, we provide up to a 5-year warranty depending on the treatment type." },
        { question: "Will you need to break tiles for bathroom leaks?", answer: "We use modern epoxy grouting techniques which often solve issues without breaking tiles." },
        { question: "Is the inspection cost adjusted?", answer: "Yes, the inspection fee is adjusted against your final repair bill if you proceed." },
        { question: "How long does a roof waterproofing take?", answer: "A standard 1000 sq ft roof takes 2 days for complete multi-layer coating." }
      ],
      packages: [
        {
          name: "Bathroom Waterproofing Inspection",
          price: 299,
          originalPrice: 499,
          time: "1 hr",
          features: [
            "Thermal leak detection camera check", 
            "Moisture mapping of walls", 
            "Detailed assessment report",
            "Consultation for permanent fix"
          ],
          details: [
            { title: "What's included", items: ["Inspection visit", "Diagnostic report"] },
            { title: "What's excluded", items: ["Actual repair work (quoted separately after inspection)"] }
          ]
        },
        {
          name: "Roof Leakage Repair",
          price: 4999,
          originalPrice: 6500,
          time: "4 hrs",
          features: [
            "Roof crack filling with polymer-modified mortar", 
            "Application of 2 coats of elastomeric coating", 
            "Focus on joints and drainage pipes",
            "3-year warranty"
          ],
          details: [
            { title: "What's included", items: ["Chemicals and labor", "Surface preparation", "3-year warranty"] },
            { title: "What's excluded", items: ["Major civil reconstruction work"] }
          ]
        }
      ]
    }
  ],
  'elevators-escalators': [
    {
      title: "Elevator Maintenance & Repair",
      badge: "Essential",
      badgeColor: "bg-red-600 text-white dark:bg-red-500 dark:text-white",
      rating: "4.8 (10K+ bookings)",
      image: "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?q=80&w=1974&auto=format&fit=crop",
      time: "2-5 hrs",
      description: "Professional maintenance, rescue, and repair of passenger & service elevators.",
      benefits: [
        "Certified electro-mechanical technicians", 
        "Genuine OEM spare parts used", 
        "24/7 emergency breakdown support",
        "Comprehensive safety and load audits"
      ],
      howItWorks: [
        { title: "Step 1: Diagnostics", description: "Thorough check of the control panel, motor, and traction cables.", icon: "ph:cpu" },
        { title: "Step 2: Servicing", description: "Lubrication of rails, door alignment, and sensor cleaning.", icon: "ph:wrench" },
        { title: "Step 3: Component Repair", description: "Replacing worn-out parts like rollers, relays, or belts.", icon: "ph:gear" },
        { title: "Step 4: Safety Test", description: "Running full load and ARD (Auto Rescue Device) safety drop tests.", icon: "ph:shield-check" }
      ],
      faqs: [
        { question: "Do you service all brands?", answer: "Yes, our technicians are trained to service all major brands like Otis, Schindler, Kone, and Johnson." },
        { question: "Do you offer Annual Maintenance Contracts (AMC)?", answer: "Yes, after an initial assessment, we provide comprehensive and non-comprehensive AMC options." },
        { question: "How fast do you respond to emergencies?", answer: "For emergency breakdowns and passenger rescues, we guarantee a 60-minute dispatch." },
        { question: "Do you repair the Auto Rescue Device (ARD)?", answer: "Yes, ARD battery replacements and controller repairs are handled by our senior technicians." }
      ],
      packages: [
        {
          name: "Routine Lift Servicing (Monthly)",
          price: 3999,
          originalPrice: 5000,
          time: "2 hrs",
          features: [
            "Door mechanics alignment and oiling", 
            "Motor and gearbox inspection", 
            "Control panel dust-cleaning and wiring check",
            "ARD battery check"
          ],
          details: [
            { title: "What's included", items: ["Labor for complete checkup", "Lubricants and basic consumables"] },
            { title: "What's excluded", items: ["Cost of replacement parts (like batteries, sensors)"] }
          ]
        },
        {
          name: "Emergency Breakdown Visit",
          price: 1499,
          originalPrice: 2000,
          time: "1 hr",
          tag: "Fast Track",
          features: [
            "Priority dispatch within 60 minutes", 
            "Fault diagnosis and temporary fix to release passengers", 
            "Minor repairs included",
            "Quote for permanent fix"
          ],
          details: [
            { title: "What's included", items: ["Priority visit", "Basic diagnosis and minor fault reset"] },
            { title: "What's excluded", items: ["Major parts replacement"] }
          ]
        },
        {
          name: "Complete Lift Overhaul (Modernization)",
          price: 49999,
          originalPrice: 60000,
          time: "3-5 days",
          tag: "Heavy",
          features: [
            "Replacement of control panel boards",
            "Cabin aesthetics upgrade",
            "New button panels (COP & LOP)",
            "Complete re-cabling"
          ],
          details: [
            { title: "What's included", items: ["Full labor and components", "1-year warranty on new parts"] },
            { title: "What's excluded", items: ["Motor and gearbox replacement (quoted separately)"] }
          ]
        },
        {
          name: "ARD (Auto Rescue Device) Repair",
          price: 8499,
          originalPrice: 10000,
          time: "3 hrs",
          features: [
            "Complete battery bank replacement",
            "Inverter board diagnostics",
            "Load test simulation",
            "Safety certification"
          ],
          details: [
            { title: "What's included", items: ["New heavy-duty batteries", "Installation and testing"] },
            { title: "What's excluded", items: ["Main control panel repairs"] }
          ]
        }
      ]
    },
    {
      title: "Escalator Servicing",
      rating: "4.6 (5K+ bookings)",
      image: "https://images.pexels.com/photos/1018880/pexels-photo-1018880.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      time: "4-6 hrs",
      description: "Complete maintenance, cleaning, and repair for commercial escalators.",
      benefits: [
        "Prevents sudden jerky stops", 
        "Increases lifespan of the step chain", 
        "Ensures compliance with commercial safety laws",
        "Reduces power consumption"
      ],
      howItWorks: [
        { title: "Step 1: Shutdown & Safety Barrier", description: "Safely shutting down the unit and placing work barriers.", icon: "ph:warning-circle" },
        { title: "Step 2: Step Cleaning", description: "Deep cleaning of steps and grooves using specialized machines.", icon: "ph:sparkle" },
        { title: "Step 3: Handrail & Chain Check", description: "Tension check for handrails and lubrication of the main step chain.", icon: "ph:gear" },
        { title: "Step 4: Load Testing", description: "Running the escalator empty and with test weights to verify smooth operation.", icon: "ph:check-circle" }
      ],
      faqs: [
        { question: "How often should escalators be serviced?", answer: "For heavy commercial use (malls, stations), a bi-weekly or monthly service is mandatory." },
        { question: "Do you fix broken handrails?", answer: "Yes, we handle complete handrail splicing, replacement, and tension adjustment." },
        { question: "Can you remove tough stains from the steps?", answer: "Yes, we use a specialized escalator step cleaning machine that brushes deep into the grooves." },
        { question: "Do you service late at night?", answer: "Yes, we offer after-hours servicing for malls to avoid passenger disruption." }
      ],
      packages: [
        {
          name: "Deep Step Cleaning",
          price: 5999,
          originalPrice: 7500,
          time: "4 hrs",
          features: [
            "Mechanized step groove cleaning",
            "Handrail sanitation",
            "Comb plate debris removal",
            "Glass balustrade wiping"
          ],
          details: [
            { title: "What's included", items: ["Complete aesthetic and hygiene clean"] },
            { title: "What's excluded", items: ["Mechanical repairs"] }
          ]
        },
        {
          name: "Comprehensive Mechanical Service",
          price: 12999,
          originalPrice: 15000,
          time: "6 hrs",
          features: [
            "Step chain lubrication",
            "Brake pad inspection",
            "Comb plate alignment",
            "Emergency stop button tests"
          ],
          details: [
            { title: "What's included", items: ["Full mechanical maintenance", "Lubricants"] },
            { title: "What's excluded", items: ["Replacement of main motor"] }
          ]
        }
      ]
    }
  ],
  'solar-installation-services': [
    {
      title: "Solar Panel Cleaning & Maintenance",
      badge: "Eco Saver",
      badgeColor: "bg-green-600 text-white dark:bg-green-500 dark:text-white",
      rating: "4.9 (50K+ bookings)",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop",
      time: "1-2 hrs",
      description: "Enhance your solar efficiency with professional cleaning and audits.",
      benefits: [
        "Improves power output by up to 20%", 
        "Uses RO/deionized water to prevent hard water scaling", 
        "No abrasive tools used to protect panel coating",
        "Includes basic electrical connection check"
      ],
      howItWorks: [
        { title: "Step 1: System Audit", description: "Pre-cleaning visual check and current efficiency reading.", icon: "ph:chart-line-up" },
        { title: "Step 2: Dry Brushing", description: "Removing heavy debris and leaves before applying water.", icon: "ph:broom" },
        { title: "Step 3: Cleaning", description: "Water-fed soft pole brushing to remove dust and bird droppings.", icon: "ph:drop" },
        { title: "Step 4: Verification", description: "Post-cleaning efficiency check to demonstrate output gain.", icon: "ph:sun" }
      ],
      faqs: [
        { question: "How often should I clean my panels?", answer: "We recommend professional cleaning every 3 to 6 months depending on local dust levels." },
        { question: "Do you use chemicals?", answer: "No, we use pure deionized water and soft brushes to ensure the anti-reflective coating on panels is not damaged." },
        { question: "Is the roof height an issue?", answer: "We bring extension ladders and water-fed poles that reach up to 3 stories easily." },
        { question: "Will cleaning void my warranty?", answer: "No, our methods comply strictly with major panel manufacturers' maintenance guidelines." }
      ],
      packages: [
        {
          name: "Basic Solar Panel Cleaning (Up to 10 panels)",
          price: 899,
          originalPrice: 1200,
          time: "1 hr",
          features: [
            "Soft brush water-fed cleaning", 
            "Deionized water rinse", 
            "Visual inspection for cracks",
            "Output check"
          ],
          details: [
            { title: "What's included", items: ["Cleaning of up to 10 standard panels", "Basic health report"] },
            { title: "What's excluded", items: ["Repair of cracked panels", "Inverter repair"] }
          ]
        },
        {
          name: "Deep Solar Panel Cleaning (11-25 panels)",
          price: 1499,
          originalPrice: 2000,
          time: "2 hrs",
          features: [
            "Stubborn stain and bird dropping removal", 
            "Complete RO wash for up to 25 panels", 
            "Wiring and MC4 connector check",
            "Comprehensive system health report"
          ],
          details: [
            { title: "What's included", items: ["Cleaning of up to 25 panels", "Detailed electrical connection check"] },
            { title: "What's excluded", items: ["Replacement of faulty cables"] }
          ]
        }
      ]
    },
    {
      title: "Solar Inverter Repair",
      rating: "4.7 (20K+ bookings)",
      image: "https://images.pexels.com/photos/9875680/pexels-photo-9875680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      time: "1 hr",
      description: "Fast and reliable repair for your solar inverters and batteries.",
      benefits: [
        "Expert diagnosis by certified solar electricians", 
        "Genuine replacement parts", 
        "Quick turnaround time",
        "Prevents costly system downtimes"
      ],
      howItWorks: [
        { title: "Step 1: Diagnostics", description: "Reading fault codes and testing internal components.", icon: "ph:cpu" },
        { title: "Step 2: Component Repair", description: "Repairing blown fuses, loose contacts, or faulty boards.", icon: "ph:wrench" },
        { title: "Step 3: Battery Check", description: "Testing battery health and acid levels (if applicable).", icon: "ph:battery-charging" },
        { title: "Step 4: Recalibration", description: "System restart and output recalibration to grid standards.", icon: "ph:check-circle" }
      ],
      faqs: [
        { question: "Do you provide spare parts?", answer: "Yes, we source and provide genuine spare parts at MRP." },
        { question: "Can you fix off-grid inverters?", answer: "Yes, we service both grid-tied, off-grid, and hybrid solar inverters." },
        { question: "Do you handle net metering issues?", answer: "We can fix the inverter side of the connection, but utility grid issues require contacting your power provider." },
        { question: "Is there a visit charge?", answer: "Yes, a diagnostic visit charge applies, which is adjusted if you proceed with our repair quote." }
      ],
      packages: [
        {
          name: "Inverter Checkup & Repair",
          price: 499,
          originalPrice: 799,
          time: "1 hr",
          features: [
            "Diagnostic testing and fault code read", 
            "AC/DC wiring check", 
            "Minor fault fix (like loose connections) included",
            "Repair estimate for major faults"
          ],
          details: [
            { title: "What's included", items: ["Technician visit and diagnosis", "Minor wiring fixes"] },
            { title: "What's excluded", items: ["Cost of major spare parts (e.g., control boards)"] }
          ]
        }
      ]
    }
  ],
  'vehicle-care': [
    {
      title: "Car Wash & Spa",
      badge: "Best Value",
      badgeColor: "bg-blue-600 text-white dark:bg-blue-500 dark:text-white",
      rating: "4.8 (800K+ bookings)",
      image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1931&auto=format&fit=crop",
      time: "1-3 hrs",
      description: "Premium doorstep car wash and interior detailing.",
      benefits: [
        "Waterless / Low-water technology saves gallons of water", 
        "Premium 3M and Meguiar's products used", 
        "Swirl-free microfiber towels used for wiping",
        "Doorstep convenience - we come to you"
      ],
      howItWorks: [
        { title: "Step 1: Exterior Wash", description: "Foam spray and gentle wipe down to remove dirt without scratching.", icon: "ph:car-profile" },
        { title: "Step 2: Wheel & Tyre", description: "Deep cleaning of alloys and application of tyre dress for a wet shine.", icon: "ph:steering-wheel" },
        { title: "Step 3: Interior Deep Clean", description: "High-power vacuuming and dry-cleaning of seats and carpets.", icon: "ph:wind" },
        { title: "Step 4: Polishing", description: "Dashboard polishing and exterior wax application for a showroom shine.", icon: "ph:sparkle" }
      ],
      faqs: [
        { question: "Do I need to provide water and electricity?", answer: "We require about 1-2 buckets of water. We bring our own extension cords for the vacuum cleaner." },
        { question: "Will it remove hard water spots on glass?", answer: "Standard wash removes normal dirt. Hard water stain removal requires our advanced glass polishing package." },
        { question: "Is it safe for ceramic-coated cars?", answer: "Yes, our foam wash is pH-neutral and completely safe for ceramic coatings." },
        { question: "Do you clean the underbody?", answer: "Since we operate at your doorstep without hydraulic lifts, we do not perform underbody washing." }
      ],
      packages: [
        {
          name: "Hatchback Deep Interior Cleaning",
          price: 999,
          originalPrice: 1499,
          time: "1.5 hrs",
          features: [
            "Seat dry cleaning and stain removal", 
            "Dashboard and door trim polishing", 
            "Complete floor and boot vacuuming",
            "Roof lining wipe"
          ],
          details: [
            { title: "What's included", items: ["Complete interior detailing"] },
            { title: "What's excluded", items: ["Exterior wash"] }
          ]
        },
        {
          name: "Sedan Complete Car Spa",
          price: 1399,
          originalPrice: 1899,
          time: "2 hrs",
          tag: "Best Value",
          features: [
            "Exterior foam wash & microfiber dry", 
            "Interior dry clean (seats + carpet)", 
            "Dashboard conditioning",
            "Exterior liquid wax polishing",
            "Tyre and alloy dressing"
          ],
          details: [
            { title: "What's included", items: ["Exterior wash and wax", "Interior detailing"] },
            { title: "What's excluded", items: ["Machine rubbing/polishing for scratches"] }
          ]
        },
        {
          name: "SUV Complete Car Spa",
          price: 1799,
          originalPrice: 2499,
          time: "2.5 hrs",
          features: [
            "Heavy-duty exterior foam wash", 
            "Teflon-infused liquid wax coating", 
            "Deep interior dirt extraction",
            "AC vent sanitization",
            "Complete glass polishing"
          ],
          details: [
            { title: "What's included", items: ["Complete interior and exterior detailing for large SUVs"] },
            { title: "What's excluded", items: ["Underbody wash (requires a hydraulic lift)"] }
          ]
        },
        {
          name: "Ceramic Wash & Maintenance",
          price: 2499,
          originalPrice: 3200,
          time: "2 hrs",
          features: [
            "pH neutral snow foam wash", 
            "Silica spray sealant application", 
            "Hydrophobic glass treatment",
            "Premium interior vacuum and wipe down"
          ],
          details: [
            { title: "What's included", items: ["Specialized wash for pre-coated cars"] },
            { title: "What's excluded", items: ["Application of new ceramic coating layer"] }
          ]
        }
      ]
    },
    {
      title: "Bike Repair & Service",
      badge: "Quick Fix",
      badgeColor: "bg-orange-500 text-white dark:bg-orange-400 dark:text-white",
      rating: "4.7 (150K+ bookings)",
      image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop",
      time: "1-2 hrs",
      description: "Convenient doorstep bike servicing and quick repairs.",
      benefits: [
        "Certified mechanics at your doorstep",
        "Genuine OEM parts used for replacements",
        "Transparent pricing with no hidden charges",
        "1-month service warranty"
      ],
      howItWorks: [
        { title: "Step 1: Diagnostics", description: "Mechanic performs a multi-point check of the engine, brakes, and electricals.", icon: "ph:magnifying-glass" },
        { title: "Step 2: Fluid Change", description: "Draining old oil and refilling with premium engine oil.", icon: "ph:drop" },
        { title: "Step 3: Tuning", description: "Chain lubrication, brake tightening, and carburetor/FI tuning.", icon: "ph:wrench" },
        { title: "Step 4: Test Ride", description: "Final test ride by the mechanic to ensure smooth performance.", icon: "ph:motorcycle" }
      ],
      faqs: [
        { question: "Is engine oil included in the price?", answer: "Basic servicing covers labor. Engine oil and other consumables are charged at MRP." },
        { question: "Do you service superbikes?", answer: "We currently service standard commuter bikes, scooters, and cruisers up to 350cc." },
        { question: "What if my bike needs a major part replaced?", answer: "Our mechanic will procure genuine parts. For heavy engine work, we offer a garage pickup facility." },
        { question: "Is washing included?", answer: "Yes, an eco-friendly waterless wipe down is included in the full service." }
      ],
      packages: [
        {
          name: "Standard Bike Servicing",
          price: 499,
          originalPrice: 800,
          time: "1.5 hrs",
          features: [
            "Engine oil change (oil cost extra)",
            "Chain cleaning & lubrication",
            "Brake check and adjustment",
            "Spark plug clean",
            "Air filter cleaning"
          ],
          details: [
            { title: "What's included", items: ["Comprehensive checkup and labor"] },
            { title: "What's excluded", items: ["Cost of engine oil and spare parts"] }
          ]
        },
        {
          name: "Scooter General Service",
          price: 399,
          originalPrice: 600,
          time: "1 hr",
          features: [
            "Carburetor cleaning",
            "Brake adjustment",
            "Battery health check",
            "Exterior polish"
          ],
          details: [
            { title: "What's included", items: ["Complete labor for general servicing"] },
            { title: "What's excluded", items: ["Engine oil cost"] }
          ]
        }
      ]
    },
    {
      title: "Car Denting & Painting",
      rating: "4.5 (80K+ bookings)",
      image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1974&auto=format&fit=crop",
      time: "2-3 days",
      description: "Professional dent removal and exact color-match painting at our partner garages.",
      benefits: [
        "100% color match guarantee",
        "High-quality DuPont/Nippon paint used",
        "Free pickup and drop facility",
        "2-year warranty on paint fading"
      ],
      howItWorks: [
        { title: "Step 1: Pickup", description: "Our driver picks up your car from your doorstep.", icon: "ph:car" },
        { title: "Step 2: Dent Pulling", description: "Mechanized dent pulling and surface smoothening at the garage.", icon: "ph:hammer" },
        { title: "Step 3: Painting", description: "Painting in a dust-free paint booth and clear coat application.", icon: "ph:paint-bucket" },
        { title: "Step 4: Delivery", description: "Car is washed, polished, and delivered back to you.", icon: "ph:check-circle" }
      ],
      faqs: [
        { question: "Is this done at my doorstep?", answer: "No, denting and painting require a dust-free paint booth, so we take it to our workshop." },
        { question: "Do you offer a color match guarantee?", answer: "Yes, we use computerized color mixing to ensure a 100% match with your car's original paint." },
        { question: "How long does it take?", answer: "Usually, a single panel takes 2 days. Full body paint takes around 7-10 days." },
        { question: "Do you handle insurance claims?", answer: "Yes, we assist with cashless insurance claims at our partner garages." }
      ],
      packages: [
        {
          name: "Single Panel Denting & Painting",
          price: 2499,
          originalPrice: 3500,
          time: "2 days",
          features: [
            "Dent removal on one panel (e.g. door or fender)",
            "Anti-rust coating application",
            "Premium color match painting",
            "Clear coat and polishing"
          ],
          details: [
            { title: "What's included", items: ["Complete repair of one panel", "Pickup and drop"] },
            { title: "What's excluded", items: ["Replacement of the panel if unrepairable"] }
          ]
        },
        {
          name: "Bumper Repair & Paint",
          price: 2199,
          originalPrice: 3000,
          time: "2 days",
          features: [
            "Plastic welding for minor cracks",
            "Full bumper painting",
            "Scratch removal",
            "Polishing"
          ],
          details: [
            { title: "What's included", items: ["Front or rear bumper repair"] },
            { title: "What's excluded", items: ["Cost of a new bumper if completely shattered"] }
          ]
        }
      ]
    }
  ]
};

async function main() {
  const { prisma } = await import('../src/lib/prisma');
  
  try {
    const categories = await prisma.category.findMany();
    
    for (const category of categories) {
      if (excludedCategories.includes(category.slug)) {
        console.log(`Skipping excluded category: ${category.slug}`);
        continue;
      }
      
      let mappedDataKey = category.slug;
      if (!seedData[mappedDataKey as keyof typeof seedData]) {
        // Find a fuzzy match
        const fuzzy = Object.keys(seedData).find(k => category.slug.includes(k) || k.includes(category.slug));
        if (fuzzy) {
          mappedDataKey = fuzzy;
        } else {
          console.log(`No seed data found for category: ${category.slug}`);
          continue;
        }
      }
      
      console.log(`Seeding services for category: ${category.slug} (using data map: ${mappedDataKey})`);
      const services = seedData[mappedDataKey as keyof typeof seedData];
      
      for (const svc of services) {
        const verifiedImage = await verifyImageUrl(svc.image, defaultServiceImage);
        const serviceSlug = generateSlug(svc.title + '-' + category.slug);
        
        const createdService = await prisma.service.upsert({
          where: { slug: serviceSlug },
          update: {
            title: svc.title,
            badge: (svc as any).badge || null,
            badgeColor: (svc as any).badgeColor || null,
            rating: svc.rating || null,
            isPopular: (svc as any).isPopular || false,
            image: verifiedImage,
            time: svc.time || null,
            description: svc.description,
            benefits: svc.benefits || [],
            howItWorks: svc.howItWorks || [],
            faqs: svc.faqs || [],
            categoryId: category.id
          },
          create: {
            slug: serviceSlug,
            title: svc.title,
            badge: (svc as any).badge || null,
            badgeColor: (svc as any).badgeColor || null,
            rating: svc.rating || null,
            isPopular: (svc as any).isPopular || false,
            image: verifiedImage,
            time: svc.time || null,
            description: svc.description,
            benefits: svc.benefits || [],
            howItWorks: svc.howItWorks || [],
            faqs: svc.faqs || [],
            category: {
              connect: { id: category.id }
            }
          }
        });
        console.log(`  - Created/Updated Service: ${createdService.title}`);
        
        for (const pkg of svc.packages) {
          const existingPackages = await prisma.servicePackage.findMany({
            where: { serviceId: createdService.id, name: pkg.name }
          });
          
          let pkgImage = null;
          if ((pkg as any).image) {
            pkgImage = await verifyImageUrl((pkg as any).image, defaultPackageImage);
          }

          if (existingPackages.length > 0) {
            await prisma.servicePackage.update({
              where: { id: existingPackages[0].id },
              data: {
                price: pkg.price,
                originalPrice: pkg.originalPrice,
                time: pkg.time || null,
                tag: (pkg as any).tag || null,
                image: pkgImage,
                features: pkg.features || [],
                details: (pkg as any).details || null
              }
            });
            console.log(`    - Updated Package: ${pkg.name}`);
          } else {
            await prisma.servicePackage.create({
              data: {
                serviceId: createdService.id,
                name: pkg.name,
                price: pkg.price,
                originalPrice: pkg.originalPrice,
                time: pkg.time || null,
                tag: (pkg as any).tag || null,
                image: pkgImage,
                features: pkg.features || [],
                details: (pkg as any).details || null
              }
            });
            console.log(`    - Created Package: ${pkg.name}`);
          }
        }
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log('Seeding complete!'))
  .catch(console.error);
