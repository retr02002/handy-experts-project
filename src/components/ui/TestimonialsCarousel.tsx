"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { TestimonialCard, TestimonialCardProps } from "@/components/ui/TestimonialCard";
import { ClientIcon } from "@/components/ui/ClientIcon";

const NavigationButtons = ({ swiperInstance }: { swiperInstance: SwiperType | null }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => swiperInstance?.slidePrev()}
      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-slate-200 dark:border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-[#00B4FF] hover:border-[#00B4FF] transition-all bg-white dark:bg-[#0B1120] hover:shadow-lg z-10"
    >
      <ClientIcon icon="ph:arrow-left-bold" className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
    <button
      onClick={() => swiperInstance?.slideNext()}
      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-slate-200 dark:border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-[#00B4FF] hover:border-[#00B4FF] transition-all bg-white dark:bg-[#0B1120] hover:shadow-lg z-10"
    >
      <ClientIcon icon="ph:arrow-right-bold" className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  </div>
);

export interface TestimonialsCarouselProps {
  testimonials: TestimonialCardProps[];
  hideBadge?: boolean;
}

export function TestimonialsCarousel({ testimonials, hideBadge }: TestimonialsCarouselProps) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  return (
    <>
      {/* Desktop Header with Navigation */}
      <div className="hidden lg:block">
        <SectionHeader
          badgeNumber={hideBadge ? undefined : "06"}
          badgeText={hideBadge ? undefined : "Testimonials"}
          title={
            <>
              Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4FF] to-[#0070FF]">Delhi households.</span>
            </>
          }
          description="312,000+ jobs completed. 4.8★ average across every category. Here's a slice."
          rightElement={<NavigationButtons swiperInstance={swiperInstance} />}
        />
      </div>

      {/* Mobile Header (No Navigation) */}
      <div className="lg:hidden">
        <SectionHeader
          badgeNumber={hideBadge ? undefined : "06"}
          badgeText={hideBadge ? undefined : "Testimonials"}
          title={
            <>
              Loved by <span className="text-[#00B4FF]">Delhi households.</span>
            </>
          }
          description="312,000+ jobs completed. 4.8★ average across every category. Here's a slice."
        />
      </div>

      {/* Swiper Carousel */}
      <div className="w-full">
        <Swiper
          modules={[Autoplay]}
          onSwiper={setSwiperInstance}
          spaceBetween={20}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            768: { slidesPerView: 1, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
            1280: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="w-full !pb-2 !pt-2"
        >
          {testimonials.map((t, idx) => (
            <SwiperSlide key={idx} className="h-auto pb-4">
              <TestimonialCard {...t} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Mobile Navigation Buttons (below cards) */}
      <div className="flex justify-center mt-2 lg:hidden relative z-10">
        <NavigationButtons swiperInstance={swiperInstance} />
      </div>
    </>
  );
}
