import Link from "next/link";
import Image from "next/image";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
const CATEGORIES = [
  {
    id: "handyman",
    title: "Handyman",
    description: "Furniture assembly, drilling, mounting and 40+ micro-fixes.",
    icon: "ph:wrench-fill",
    image: "https://images.unsplash.com/photo-1581141849291-1125c7b692b5?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "appliance",
    title: "Appliance Repair",
    description: "AC, washing machine, refrigerator, chimney, microwave.",
    icon: "ph:plug-fill",
    image: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "cleaning",
    title: "Cleaning & Pest",
    description: "Full-home cleaning, sofa, carpet, and pest control.",
    icon: "ph:spray-bottle-fill",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "painting",
    title: "Painting",
    description: "Interior paint, waterproofing, texture, and finish work.",
    icon: "ph:paint-roller-fill",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "movers",
    title: "Movers & Storage",
    description: "Household shifting, packers, and short-term storage.",
    icon: "ph:truck-fill",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "renovation",
    title: "Renovation",
    description: "Kitchen, bathroom, and full-home renovation projects.",
    icon: "ph:hammer-fill",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "salon",
    title: "Salon & Spa",
    description: "Home salon, hair, spa, and styling by verified artists.",
    icon: "ph:scissors-fill",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "pest",
    title: "Pest Control",
    description: "Termite, cockroach, and mosquito treatment plans.",
    icon: "ph:bug-fill",
    image: "https://plus.unsplash.com/premium_photo-1682126104327-ef7d5f260cf7?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGVzdCUyMGNvbnRyb2x8ZW58MHx8MHx8fDA%3D"
  }
];

export function CategoryGrid() {
  return (
    <section className="w-full bg-slate-50 dark:bg-[#0A0F1C] py-12 sm:py-16 px-4 sm:px-8 lg:px-16 border-t border-slate-200/50 dark:border-white/5">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <SectionHeader
          badgeNumber="02"
          badgeText="Categories"
          title={
            <>
              One platform. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4FF] to-[#0070FF]">Every service.</span>
            </>
          }
          description="Twelve verticals, one dashboard, zero middlemen. Pick a lane — we handle scheduling, quality and warranty."
          actionLink={{ text: "View all services", href: "#" }}
        />

        {/* CSS Grid for perfectly responsive cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="group relative h-[200px] sm:h-[240px] w-full rounded-3xl overflow-hidden cursor-pointer bg-slate-200 dark:bg-slate-800 isolate shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Background Image that scales on hover */}
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 z-0"
              />

              {/* Dynamic Overlay: Dark gradient that is beautiful in both light and dark modes */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 sm:to-transparent z-10 transition-opacity duration-500 group-hover:opacity-90" />

              {/* Top Glassmorphism Icon Pill */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-xl p-2.5 border border-white/20 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:bg-[#00B4FF]/90 group-hover:border-[#00B4FF]">
                <ClientIcon icon={cat.icon} className="text-white w-4 h-4 sm:w-5 sm:h-5 drop-shadow-md" />
              </div>

              {/* Bottom Content Area */}
              <div className="absolute bottom-0 left-0 w-full p-4 sm:p-5 z-20 flex flex-col justify-end">
                <h3 className="text-white text-xl sm:text-2xl font-bold mb-1.5 sm:mb-2 drop-shadow-md tracking-tight group-hover:text-[#00B4FF] transition-colors duration-300">
                  {cat.title}
                </h3>
                <p className="text-white/80 text-[13px] sm:text-sm font-medium line-clamp-2 drop-shadow-sm leading-relaxed max-w-[90%] transform transition-all duration-500 group-hover:text-white">
                  {cat.description}
                </p>
              </div>

              {/* Floating Hover Arrow */}
              <div className="absolute bottom-4 right-4 z-20 opacity-0 translate-y-3 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 hidden sm:flex">
                <div className="bg-white text-[#00B4FF] rounded-full p-1.5 shadow-lg">
                  <ClientIcon icon="ph:arrow-right-bold" className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
