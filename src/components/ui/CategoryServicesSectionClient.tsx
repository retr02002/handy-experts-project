"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import { ClientIcon } from "./ClientIcon";
import { CompactServiceCard } from "./CompactServiceCard";
import type { CategoryWithServices } from "@/types/category";

const emptySubscribe = () => () => { };

export function CategoryServicesSectionClient({ category }: { category: CategoryWithServices }) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  if (!mounted) return null;

  return (
    <section className="py-6 sm:py-8 px-4 sm:px-8 lg:px-16 bg-white dark:bg-[#020813] border-t border-slate-100 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {category.name}
          </h2>
          <Link
            href="/services"
            className="text-sm font-bold text-[#00B4FF] hover:text-[#0099D9] transition-colors flex items-center gap-1 group"
          >
            See All
            <ClientIcon icon="ph:arrow-right-bold" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="relative group/swiper">
          <Swiper
            modules={[Autoplay, Navigation]}
            onSwiper={setSwiperInstance}
            navigation={{
              prevEl: `.prev-${category.slug}`,
              nextEl: `.next-${category.slug}`,
            }}
            watchOverflow={true}
            spaceBetween={16}
            slidesPerView={2.5}
            autoplay={{ delay: 6000, disableOnInteraction: true }}
            breakpoints={{
              640: { slidesPerView: 3.5, spaceBetween: 16 },
              768: { slidesPerView: 4.5, spaceBetween: 20 },
              1024: { slidesPerView: 6, spaceBetween: 24 },
            }}
            className="w-full !pb-4 !pt-2"
          >
            {category.services.map((service, idx) => (
              <SwiperSlide key={idx} className="h-auto">
                <CompactServiceCard service={service} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Nav Arrows */}
          <div className="flex opacity-0 group-hover/swiper:opacity-100 transition-opacity duration-300 md:opacity-100">
            <button
              className={`prev-${category.slug} absolute left-[-12px] md:left-[-20px] top-[35%] -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#00B4FF] z-10 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ClientIcon icon="ph:caret-left-bold" className="w-4 h-4" />
            </button>
            <button
              className={`next-${category.slug} absolute right-[-12px] md:right-[-20px] top-[35%] -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#00B4FF] z-10 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ClientIcon icon="ph:caret-right-bold" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
