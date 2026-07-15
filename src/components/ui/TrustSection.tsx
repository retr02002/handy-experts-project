import { TrustCard } from "@/components/ui/TrustCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

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
    <section className="relative w-full bg-slate-50 dark:bg-[#060A13] py-16 sm:py-24 px-4 sm:px-8 lg:px-16 overflow-hidden">
      {/* Subtle Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Top Gradient for smooth transition */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-50 dark:from-[#0A0F1C] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          badgeNumber="06"
          badgeText="Trust"
          title={
            <>
              Certified, audited, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4FF] to-[#0070FF]">trusted.</span>
            </>
          }
          description="We don't just connect you with professionals, we guarantee their quality. Every service is backed by our comprehensive trust and safety protocols."
        />

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
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
      </div>
    </section>
  );
}
