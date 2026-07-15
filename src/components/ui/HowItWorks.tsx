import { ClientIcon } from "@/components/ui/ClientIcon";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

import { SectionHeader } from "@/components/ui/SectionHeader";

const STEPS = [
  {
    num: "01",
    title: "Discover the right service",
    desc: "Browse 40+ verticals or search a specific need. Every card shows all-in pricing, average job duration and verified pro ratings — no hidden fees, no surprises.",
    tags: ["40+ verticals", "All-in pricing", "Instant quotes"],
    icon: "ph:magnifying-glass"
  },
  {
    num: "02",
    title: "Confirm your address & pincode",
    desc: "We check pro availability in your exact pincode across 90+ Delhi NCR neighbourhoods and show you the nearest slots — usually within the next 60 minutes.",
    tags: ["90+ pincodes", "Live availability", "Local pros only"],
    icon: "ph:map-pin"
  },
  {
    num: "03",
    title: "Lock a slot in seconds",
    desc: "Pick same-day or scheduled. Reschedule free up to 2 hours before. Pay online or on completion — you're only charged after the job is done and approved.",
    tags: ["Same-day slots", "Free reschedule", "Pay after service"],
    icon: "ph:calendar-check"
  },
  {
    num: "04",
    title: "Meet your verified pro",
    desc: "Get matched with the highest-rated pro in your zone. See their photo, past jobs, live ETA and a one-tap call button — no awkward phone tag.",
    tags: ["Background-checked", "Live ETA", "Photo & rating"],
    icon: "ph:user-check"
  },
  {
    num: "05",
    title: "Service done, on time",
    desc: "Real-time tracking, before/after photos, digital invoice with GST. Our supervisor spot-checks 1 in every 5 jobs — quality never slips.",
    tags: ["Live tracking", "Before/after photos", "Digital GST invoice"],
    icon: "ph:sparkle"
  },
  {
    num: "06",
    title: "Rate. Rebook. Repeat.",
    desc: "Every job has a 30-day warranty. If anything's off, we come back for free — or refund fully. Loyal customers unlock priority slots and quarterly credit.",
    tags: ["30-day warranty", "Free re-work", "Loyalty credits"],
    icon: "ph:chat-circle-text"
  }
];

export function HowItWorks() {
  return (
    <section className="w-full bg-slate-50 dark:bg-[#0A0F1C] py-16 sm:py-24 px-4 sm:px-8 lg:px-16 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <SectionHeader
          badgeNumber="05"
          badgeText="How it works"
          title={
            <>
              Book in 3 taps. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4FF] to-[#0070FF]">Done in 3 hours.</span>
            </>
          }
          description="From tapping &quot;Book&quot; to sipping tea on a spotless sofa — here's every step, in detail, with what you get at each stage."
          alignment="center"
        />

        {/* Timeline Container */}
        <div className="relative w-full">
          {/* Desktop Center Line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-slate-200 dark:bg-slate-800/60 -translate-x-1/2" />

          <div className="space-y-6 sm:space-y-8 lg:space-y-12">
            {STEPS.map((step, index) => {
              const isRightSide = index % 2 !== 0; // Odd index means it goes on the right

              return (
                <ScrollReveal
                  key={step.num}
                  className="relative group w-full"
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Mobile Vertical Line */}
                  {index !== STEPS.length - 1 && (
                    <div className="lg:hidden absolute left-[15px] sm:left-[19px] top-10 bottom-[-2rem] w-[2px] bg-slate-200 dark:bg-slate-800/60" />
                  )}

                  <div className={`flex flex-col lg:flex-row w-full items-start lg:items-center justify-between ${isRightSide ? 'lg:flex-row-reverse' : ''}`}>

                    {/* Card Container */}
                    <div className="w-full lg:w-[45%] pl-10 sm:pl-14 lg:pl-0 relative">

                      {/* Mobile Icon Circle (Absolute) */}
                      <div className="lg:hidden absolute left-0 sm:left-1 top-1 sm:top-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#0f1629] border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center z-10 transition-all duration-300 group-hover:border-[#00B4FF] group-hover:shadow-[0_0_15px_rgba(0,180,255,0.3)] shadow-sm">
                        <ClientIcon icon={step.icon} className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-slate-400 group-hover:text-[#00B4FF] transition-colors" />
                        <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-[#00B4FF] text-white text-[8px] sm:text-[9px] font-bold rounded-full w-4 h-4 sm:w-4 sm:h-4 flex items-center justify-center shadow-sm border border-white dark:border-[#0f1629]">
                          {step.num}
                        </div>
                      </div>

                      {/* The Card */}
                      <div className={`bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 lg:p-7 shadow-sm hover:shadow-lg dark:shadow-none dark:hover:shadow-[0_4px_30px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:border-[#00B4FF]/30 backdrop-blur-sm relative overflow-hidden ${!isRightSide ? 'lg:text-right' : 'lg:text-left'}`}>
                        {/* Subtle hover gradient inside card */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00B4FF]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="relative z-10">
                          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">
                            Step {step.num}
                          </div>
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#00B4FF] transition-colors">
                            {step.title}
                          </h3>
                          <p className="text-xs sm:text-[13px] lg:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                            {step.desc}
                          </p>
                          <div className={`flex flex-wrap gap-1.5 sm:gap-2 ${!isRightSide ? 'lg:justify-end' : 'lg:justify-start'}`}>
                            {step.tags.map(tag => (
                              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-bold text-[#00B4FF] bg-[#00B4FF]/10 border border-[#00B4FF]/20 transition-colors group-hover:bg-[#00B4FF]/15 group-hover:border-[#00B4FF]/30">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Desktop Icon Circle (Center) */}
                    <div className="hidden lg:flex w-[10%] justify-center relative items-center">
                      {/* Connecting Line active state (glow) */}
                      <div className="absolute top-0 bottom-[-4rem] w-[2px] bg-gradient-to-b from-[#00B4FF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative w-12 h-12 rounded-full bg-white dark:bg-[#0f1629] border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center z-10 transition-all duration-300 group-hover:border-[#00B4FF] group-hover:shadow-[0_0_20px_rgba(0,180,255,0.4)] shadow-sm group-hover:scale-110">
                        <ClientIcon icon={step.icon} className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-[#00B4FF] transition-colors" />
                        <div className="absolute -top-2 -right-2 bg-[#00B4FF] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md border-2 border-white dark:border-[#0f1629]">
                          {step.num}
                        </div>
                      </div>
                    </div>

                    {/* Empty spacer section for Desktop */}
                    <div className="hidden lg:block w-[45%]" />

                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
