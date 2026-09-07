import React from "react";
import { SectionHeader } from "./SectionHeader";
import { PopularServicesClient } from "./PopularServicesClient";
import { getAllServices, getAllCategories } from "@/lib/services-data";
import { ClientIcon } from "./ClientIcon";

export async function PopularServices() {
  const services = await getAllServices();

  // Tabs are derived from what the catalog actually holds, so creating an empty
  // category in the admin never adds a dead tab to the homepage.
  const populated = new Map(
    services.flatMap((s) => (s.category ? [[s.category.slug, s.category] as const] : []))
  );
  const categories = (await getAllCategories()).filter((c) => populated.has(c.slug));

  return (
    <section className="py-4 sm:py-12 bg-white dark:bg-[#060b14] overflow-hidden border-t border-slate-100 dark:border-slate-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeader
          badgeNumber="01"
          badgeText="POPULAR"
          title={
            <>
              Most booked <span className="text-[#00B4FF]">this week.</span>
            </>
          }
          description="Real jobs. Real ratings. Real Delhi pros. Every service below is booked live in the last 7 days."
        />

        {/* Client Component handles tabs and swiper interactvity */}
        <PopularServicesClient services={services} categories={categories} />

        {/* Mobile Navigation Buttons */}
        <div className="mt-2 flex md:hidden justify-center gap-3">
          <button 
            className="popular-swiper-prev w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-[#151f32] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1e2a44] transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
            aria-label="Previous service"
          >
            <ClientIcon icon="ph:arrow-left-bold" className="w-4 h-4" />
          </button>
          <button 
            className="popular-swiper-next w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-[#151f32] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1e2a44] transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
            aria-label="Next service"
          >
            <ClientIcon icon="ph:arrow-right-bold" className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
