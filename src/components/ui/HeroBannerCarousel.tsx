"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";

const banners = [
  {
    id: 1,
    title: "Expert AC Service",
    subtitle: "Get 20% off on first booking",
    query: "ac",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop",
    bgColor: "from-blue-600/90 to-blue-900/90",
  },
  {
    id: 2,
    title: "Deep Home Cleaning",
    subtitle: "Sparkling clean, guaranteed",
    query: "cleaning",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop",
    bgColor: "from-emerald-600/90 to-teal-900/90",
  },
  {
    id: 3,
    title: "Professional Plumbing",
    subtitle: "Fast & reliable repairs",
    query: "plumbing",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=1974&auto=format&fit=crop",
    bgColor: "from-orange-600/90 to-red-900/90",
  },
  {
    id: 4,
    title: "Electrical Services",
    subtitle: "Safe & certified electricians",
    query: "electrical",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=2069&auto=format&fit=crop",
    bgColor: "from-yellow-600/90 to-amber-900/90",
  },
];

export function HeroBannerCarousel() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full mb-8 sm:mb-10 relative z-0">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={16}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        className="w-full h-20 sm:h-24 md:h-28 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id} className="relative w-full h-full cursor-pointer" onClick={() => router.push(`/services?q=${banner.query}`)}>
            {/* Background Image */}
            <img
              src={banner.image}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.bgColor} mix-blend-multiply opacity-80`} />
            
            <div className="absolute inset-0 flex flex-row items-center justify-between px-5 sm:px-10 py-2 text-white z-10">
              <div className="flex flex-col pr-4">
                <h3 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight drop-shadow-md leading-tight">
                  {banner.title}
                </h3>
                <p className="hidden sm:block text-sm opacity-90 font-medium drop-shadow-md mt-0.5 sm:mt-1">
                  {banner.subtitle}
                </p>
              </div>
              
              <span className="shrink-0 inline-block px-4 py-1.5 sm:px-6 sm:py-2.5 bg-white text-slate-900 hover:bg-slate-100 transition-colors rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-black/10 whitespace-nowrap">
                Book Now
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
