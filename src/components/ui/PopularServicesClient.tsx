"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { ClientIcon } from "./ClientIcon";
import { Service } from "@/types/service";
import type { Category } from "@/types/category";
import { ServiceCard } from "./ServiceCard";
import { motion, AnimatePresence } from "framer-motion";

const ALL = "__all__";

type PopularServicesClientProps = {
  services: Service[];
  /** Only categories that actually hold a service — see PopularServices. */
  categories: Category[];
};

export function PopularServicesClient({ services, categories }: PopularServicesClientProps) {
  const [activeCategory, setActiveCategory] = useState(ALL);
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const tabs = [{ id: ALL, slug: ALL, name: "All Services" }, ...categories];

  const filteredServices = services.filter(
    (service) => activeCategory === ALL || service.category?.slug === activeCategory
  );

  return (
    <>
      {/* Categories Tab (Desktop) & Dropdown (Mobile) */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Mobile Dropdown */}
        <div className="md:hidden relative w-full">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="w-full appearance-none bg-slate-100 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white py-3 pl-4 pr-10 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/50 transition-shadow"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.slug}>
                {tab.name}
              </option>
            ))}
          </select>
          <ClientIcon 
            icon="ph:caret-down-bold" 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" 
          />
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.slug)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeCategory === tab.slug
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-105"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#0f172a] dark:text-slate-400 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Desktop Navigation Buttons */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
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

      {/* Swiper Slider */}
      <div className="relative -mx-4 sm:mx-0 px-4 sm:px-0">
        {isMounted && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Swiper
                key={`swiper-${activeCategory}`}
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={1}
                loop={filteredServices.length > 3}
                navigation={{
                  prevEl: '.popular-swiper-prev',
                  nextEl: '.popular-swiper-next',
                }}
                breakpoints={{
                  768: { slidesPerView: 2, spaceBetween: 24 },
                  1024: { slidesPerView: 3, spaceBetween: 24 },
                }}
                className="w-full !pt-4 !pb-6 -mt-4"
              >
                {filteredServices.map((service) => (
                  <SwiperSlide key={service.id} className="h-auto flex">
                    <ServiceCard service={service} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </>
  );
}
