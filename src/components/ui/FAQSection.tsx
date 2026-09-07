"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";

const FAQ_CATEGORIES = ["General", "Services", "Pricing", "Support"] as const;
type Category = (typeof FAQ_CATEGORIES)[number];

const FAQ_DATA: Record<Category, { q: string; a: string }[]> = {
  General: [
    {
      q: "What exact services do you offer?",
      a: "We provide on-demand access to highly skilled professionals for plumbing, electrical work, carpentry, painting, and general home repairs. Our platform allows you to book an expert in seconds for any household need.",
    },
    {
      q: "Are your professionals background-checked?",
      a: "Yes, absolutely. Every Handy Expert goes through a rigorous multi-step vetting process, including identity verification, skill assessments, and comprehensive background checks to ensure your safety.",
    },
    {
      q: "Do you offer emergency services?",
      a: "Yes, we have a specialized team available for emergency repairs like severe plumbing leaks or electrical outages. Simply choose the 'Emergency' option during booking for prioritized dispatch.",
    },
  ],
  Services: [
    {
      q: "Do I need to provide materials or tools?",
      a: "Our experts come fully equipped with the standard tools needed for the job. For specific materials (like a particular paint color or light fixture), you can either provide them or request the expert to purchase them on your behalf.",
    },
    {
      q: "Can I request the same professional again?",
      a: "Certainly! If you were happy with a particular expert's work, you can easily rebook them through your past bookings history on your profile.",
    },
  ],
  Pricing: [
    {
      q: "How is the pricing calculated?",
      a: "We offer transparent, upfront pricing. Depending on the service, you will either be charged a fixed flat rate or an hourly rate. You'll see the exact cost or estimated range before you confirm your booking.",
    },
    {
      q: "Are there any hidden fees?",
      a: "No, we believe in complete transparency. The price you see is the price you pay for the service. Any additional materials required will be discussed and approved by you beforehand.",
    },
  ],
  Support: [
    {
      q: "What if I'm not satisfied with the work?",
      a: "We offer a 100% Satisfaction Guarantee. If you're not happy with the quality of the service, let us know within 48 hours, and we will send another expert to fix the issue at no extra cost.",
    },
    {
      q: "How do I cancel or reschedule a booking?",
      a: "You can cancel or reschedule your booking up to 24 hours before the scheduled time without any penalty via the app or website. Late cancellations may incur a small fee.",
    },
  ],
};

export interface FAQSectionProps {
  hideBadge?: boolean;
}

export const FAQSection = ({ hideBadge }: FAQSectionProps = {}) => {
  const [activeCategory, setActiveCategory] = useState<Category>("General");
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category);
    setActiveQuestionIdx(0); // Reset accordion on category change
    setIsDropdownOpen(false);
  };

  return (
    <section className="relative py-4 sm:py-12 bg-slate-50 dark:bg-[#0A0F1C] overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeNumber={hideBadge ? undefined : "08"}
          badgeText={hideBadge ? undefined : "FAQ"}
          title={
            <>
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4FF] to-[#0070FF]">Questions.</span>
            </>
          }
          description="Everything you need to know about our services, pricing, and guarantees. Can&apos;t find the answer you&apos;re looking for? Please chat to our friendly team."
        />

        {/* Tabs - Desktop */}
        <div className="hidden md:flex justify-start gap-2 mb-12">
          {FAQ_CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300
                  ${isActive
                    ? "bg-[#0EA5E9] text-white shadow-[0_4px_16px_rgba(14,165,233,0.35)] border border-[#0EA5E9] scale-105"
                    : "bg-white dark:bg-[#131B2C] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1A2333]"
                  }
                `}
              >
                {category === "General" && <ClientIcon icon={isActive ? "ph:chat-circle-text-fill" : "ph:chat-circle-text-bold"} className="w-5 h-5" />}
                {category === "Services" && <ClientIcon icon={isActive ? "ph:wrench-fill" : "ph:wrench-bold"} className="w-5 h-5" />}
                {category === "Pricing" && <ClientIcon icon={isActive ? "ph:credit-card-fill" : "ph:credit-card-bold"} className="w-5 h-5" />}
                {category === "Support" && <ClientIcon icon={isActive ? "ph:lifebuoy-fill" : "ph:lifebuoy-bold"} className="w-5 h-5" />}
                {category}
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown (App-Native Bottom Sheet) */}
        <div className="md:hidden relative mb-8">
          <button
            onClick={() => setIsDropdownOpen(true)}
            className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-[#131B2C] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              {activeCategory === "General" && <ClientIcon icon="ph:chat-circle-text-fill" className="w-6 h-6 text-[#0EA5E9]" />}
              {activeCategory === "Services" && <ClientIcon icon="ph:wrench-fill" className="w-6 h-6 text-[#0EA5E9]" />}
              {activeCategory === "Pricing" && <ClientIcon icon="ph:credit-card-fill" className="w-6 h-6 text-[#0EA5E9]" />}
              {activeCategory === "Support" && <ClientIcon icon="ph:lifebuoy-fill" className="w-6 h-6 text-[#0EA5E9]" />}
              <span className="text-[15px]">{activeCategory}</span>
            </div>
            <ClientIcon
              icon="ph:caret-down-bold"
              className="w-5 h-5 text-slate-400"
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
                  className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#131B2C] rounded-t-[32px] p-6 pb-10 z-[110] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
                >
                  <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-2">Select Category</h3>
                  
                  <div className="flex flex-col gap-2">
                    {FAQ_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className={`
                          w-full flex items-center justify-between px-4 py-4 rounded-xl text-left transition-colors font-bold text-[15px]
                          ${activeCategory === category ? "bg-slate-50 dark:bg-[#1A2333] text-[#0EA5E9]" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1A2333]/50"}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {category === "General" && <ClientIcon icon={activeCategory === category ? "ph:chat-circle-text-fill" : "ph:chat-circle-text"} className="w-6 h-6" />}
                          {category === "Services" && <ClientIcon icon={activeCategory === category ? "ph:wrench-fill" : "ph:wrench"} className="w-6 h-6" />}
                          {category === "Pricing" && <ClientIcon icon={activeCategory === category ? "ph:credit-card-fill" : "ph:credit-card"} className="w-6 h-6" />}
                          {category === "Support" && <ClientIcon icon={activeCategory === category ? "ph:lifebuoy-fill" : "ph:lifebuoy"} className="w-6 h-6" />}
                          {category}
                        </div>
                        {activeCategory === category && <ClientIcon icon="ph:check-circle-fill" className="w-5 h-5 text-[#0EA5E9]" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Accordion List */}
          <div className="space-y-4">
            {FAQ_DATA[activeCategory].map((item, idx) => {
              const isActive = activeQuestionIdx === idx;

              return (
                <div
                  key={idx}
                  className={`
                    group overflow-hidden rounded-2xl border transition-all duration-300
                    ${isActive
                      ? "bg-white dark:bg-[#111928] border-[#0EA5E9]/30 shadow-[0_0_30px_rgba(14,165,233,0.05)] dark:shadow-[0_0_20px_rgba(14,165,233,0.1)]"
                      : "bg-white dark:bg-[#131B2C] border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
                    }
                  `}
                >
                  <button
                    onClick={() => setActiveQuestionIdx(isActive ? -1 : idx)}
                    className="w-full flex items-center gap-4 p-5 sm:p-6 text-left focus:outline-none"
                  >
                    <span
                      className={`flex-grow font-bold text-[15px] sm:text-base transition-colors duration-300 ${isActive
                        ? "text-[#0EA5E9]"
                        : "text-slate-900 dark:text-white group-hover:text-[#0EA5E9]"
                        }`}
                    >
                      {item.q}
                    </span>

                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive
                        ? "bg-[#0EA5E9]/10 text-[#0EA5E9]"
                        : "bg-slate-50 dark:bg-[#1A2333] text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-[#222E42]"
                        }`}
                    >
                      <ClientIcon
                        icon={isActive ? "ph:caret-up-bold" : "ph:caret-down-bold"}
                        className="w-4 h-4"
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800/50 mx-5 sm:mx-6">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Contact Card */}
          <div className="bg-white dark:bg-[#111928] border border-slate-200 dark:border-slate-800/60 rounded-[32px] p-8 lg:p-10 relative overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none">
            {/* Ambient glow in the card */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#0EA5E9]/20 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-500/20 dark:to-sky-400/5 flex items-center justify-center border border-sky-200 dark:border-sky-500/20 mb-6 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
                <ClientIcon icon="ph:chat-teardrop-text" className="w-7 h-7 text-[#0EA5E9]" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Still have questions?
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Confused about service guarantees, pricing structures, or looking for a specific type of repair? Our support team is ready to help you plan your needs.
              </p>

              <button className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.4)] hover:-translate-y-0.5 mb-10">
                Talk to Support
              </button>

              <div className="w-full flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-8">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">24/7</span>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">Support</span>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold text-[#0EA5E9]">&lt;2h</span>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">Response</span>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">99%</span>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">Satisfied</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
