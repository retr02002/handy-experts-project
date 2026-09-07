"use client";

import { TrustCard } from "@/components/ui/TrustCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import { ClientIcon } from "@/components/ui/ClientIcon";

const TRUST_FEATURES = [
  {
    title: "6-Step Verified Professionals",
    subtitle: "Background & Skill Audits",
    desc: "Every local handyman passes a rigorous 6-step screening, including background checks and skill audits, ensuring top-tier home service quality.",
    icon: "ph:shield-check",
  },
  {
    title: "Certified & Insured Protection",
    subtitle: "₹5 Lakh Public Liability Cover",
    desc: "Book with peace of mind. Every home repair service is fully insured against accidental damage, providing up to ₹5 Lakh in comprehensive coverage.",
    icon: "ph:certificate",
  },
  {
    title: "On-Time Arrival Guarantee",
    subtitle: "15 Min Delay = Waived Fee",
    desc: "We respect your time. If our expert technicians are delayed by more than 15 minutes, your initial visitation and diagnostic fee is automatically waived.",
    icon: "ph:clock",
  },
  {
    title: "30-Day Service Warranty",
    subtitle: "No-Questions-Asked Re-Work",
    desc: "Quality guaranteed. If you experience any issues related to our service within 30 days, we'll dispatch a technician to re-do the work completely free.",
    icon: "ph:sparkle",
  },
  {
    title: "Genuine Brand Spare Parts",
    subtitle: "6-Month Manufacturer Warranty",
    desc: "No compromises. All appliance repairs utilize 100% authentic, brand-verified spare parts, backed by a standard 6-month manufacturer warranty.",
    icon: "ph:wrench",
  },
  {
    title: "Top-Rated Home Services",
    subtitle: "Across 312,000+ Completed Jobs",
    desc: "Trusted across Delhi NCR. We maintain an exceptional 4.8/5 average rating across 312,000+ completed household services with transparent reviews.",
    icon: "ph:medal",
  }
];

export function TrustSection() {
  return (
    <section className="relative w-full bg-slate-50 dark:bg-[#060A13] py-4 sm:py-12 px-4 sm:px-8 lg:px-16 overflow-hidden">
      {/* Subtle Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Top Gradient for smooth transition */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-50 dark:from-[#0A0F1C] to-transparent pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <SectionHeader
          badgeNumber="03"
          badgeText="Trust"
          title={
            <>
              Certified, audited, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4FF] to-[#0070FF]">trusted.</span>
            </>
          }
          description="We don't just connect you with professionals, we guarantee their quality. Every service is backed by our comprehensive trust and safety protocols."
        />

        {/* Desktop Grid (6 in a row) */}
        <div className="hidden xl:grid xl:grid-cols-6 gap-4 lg:gap-5">
          {TRUST_FEATURES.map((feature, index) => (
            <TrustCard 
              key={index}
              title={feature.title}
              subtitle={feature.subtitle}
              desc={feature.desc}
              icon={feature.icon}
              index={index}
            />
          ))}
        </div>

        {/* Mobile & Tablet Swiper Slider */}
        <div className="block xl:hidden -mx-4 sm:mx-0 px-4 sm:px-0">
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: '.trust-swiper-prev',
              nextEl: '.trust-swiper-next',
            }}
            spaceBetween={16}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              768: { slidesPerView: 3, spaceBetween: 24 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
            }}
            className="w-full !pb-4"
          >
            {TRUST_FEATURES.map((feature, index) => (
              <SwiperSlide key={index} className="h-auto flex">
                <TrustCard 
                  title={feature.title}
                  subtitle={feature.subtitle}
                  desc={feature.desc}
                  icon={feature.icon}
                  index={index}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows Below Cards */}
          <div className="mt-1 flex justify-center gap-3 relative z-10">
            <button 
              className="trust-swiper-prev w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-[#131B2F] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1e2a44] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              aria-label="Previous card"
            >
              <ClientIcon icon="ph:arrow-left-bold" className="w-4 h-4" />
            </button>
            <button 
              className="trust-swiper-next w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-[#131B2F] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1e2a44] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm z-10"
              aria-label="Next card"
            >
              <ClientIcon icon="ph:arrow-right-bold" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
