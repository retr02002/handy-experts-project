import { FeaturedServiceCard } from "@/components/ui/FeaturedServiceCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

const FEATURED_CARDS = [
  {
    id: "waterproofing",
    tag: "WATERPROOFING",
    title: "Damp walls? We fix it.",
    description: "Expert seepage repair, backed by a 3-year no-leak warranty.",
    action: "Book now",
    // Replaced broken Unsplash image with a working one for construction/repair
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop",
    span: "md:col-span-1 md:row-span-2",
  },
  {
    id: "painting",
    tag: "INTERIOR PAINTING",
    title: "A new look for your home",
    description: "Premium paints. Same-week completion. Furniture safe.",
    action: "Book now",
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=800&auto=format&fit=crop",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    id: "repairs",
    tag: "REPAIRS",
    title: "Appliance revival, on the spot",
    description: "AC, fridge, washing machine — diagnosed in 30 minutes flat.",
    action: "Book now",
    image: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?q=80&w=800&auto=format&fit=crop",
    span: "md:col-span-1 md:row-span-1",
  }
];

export function FeaturedServices() {
  return (
    <section className="w-full bg-slate-50 dark:bg-[#020813] py-8 sm:py-12 px-4 sm:px-8 xl:px-0 transition-colors duration-300 border-t border-slate-200 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto flex flex-col">
        {/* Compact Header section */}
        <SectionHeader
          badgeNumber="04"
          badgeText="Featured"
          title={
            <>
              Ready & tested. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4FF] to-[#0070FF]">Infrastructure</span> <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4FF] to-[#0070FF]">for homes.</span>
            </>
          }
        />

        {/* Compact, responsive bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 auto-rows-[200px] sm:auto-rows-[220px]">
          {FEATURED_CARDS.map((card) => (
            <FeaturedServiceCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
