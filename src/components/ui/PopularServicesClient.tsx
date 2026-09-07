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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const tabs = [{ id: ALL, slug: ALL, name: "All Services" }, ...categories];

  const filteredServices = services.filter(
    (service) => activeCategory === ALL || service.category?.slug === activeCategory
  );

  const activeCategoryName = tabs.find(t => t.slug === activeCategory)?.name || "All Services";

  return (
    <>
      {/* Categories Tab (Desktop) & Dropdown (Mobile) */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Mobile Dropdown (App-Native Bottom Sheet) */}
        <div className="md:hidden relative w-full mb-2">
          <button
            onClick={() => setIsDropdownOpen(true)}
            className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-[#131B2C] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold shadow-sm active:scale-[0.98] transition-transform"
          >
            <span className="text-[15px]">{activeCategoryName}</span>
            <ClientIcon
              icon="ph:caret-down-bold"
              className="w-5 h-5 text-[#00B4FF]"
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsDropdownOpen(false)}
                  className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm z-[100]"
                />
                
                {/* Bottom Sheet */}
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#131B2C] rounded-t-[32px] p-6 pb-10 z-[110] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[85vh] overflow-y-auto flex flex-col"
                >
                  <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 shrink-0"></div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-2 shrink-0">Select Category</h3>
                  
                  <div className="flex flex-col gap-2 overflow-y-auto pb-4">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveCategory(tab.slug);
                          setIsDropdownOpen(false);
                        }}
                        className={`
                          w-full flex items-center justify-between px-4 py-4 rounded-xl text-left transition-colors font-bold text-[15px]
                          ${activeCategory === tab.slug ? "bg-slate-50 dark:bg-[#1A2333] text-[#00B4FF]" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1A2333]/50"}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {tab.name}
                        </div>
                        {activeCategory === tab.slug && <ClientIcon icon="ph:check-circle-fill" className="w-5 h-5 text-[#00B4FF]" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
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
                slidesPerView={1.15}
                loop={filteredServices.length > 3}
                navigation={{
                  prevEl: '.popular-swiper-prev',
                  nextEl: '.popular-swiper-next',
                }}
                breakpoints={{
                  768: { slidesPerView: 2, spaceBetween: 24 },
                  1024: { slidesPerView: 5, spaceBetween: 24 },
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
