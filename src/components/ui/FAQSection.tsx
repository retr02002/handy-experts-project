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
    <section className="relative py-24 bg-slate-50 dark:bg-[#0A0F1C] overflow-hidden">
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
                  flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                  ${isActive
                    ? "bg-[#0EA5E9] text-white shadow-[0_0_20px_rgba(14,165,233,0.4)] border border-[#0EA5E9]"
                    : "bg-white dark:bg-[#131B2C] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1A2333]"
                  }
                `}
              >
                {category === "General" && <ClientIcon icon="ph:chat-circle-text" className="w-4 h-4" />}
                {category === "Services" && <ClientIcon icon="ph:wrench" className="w-4 h-4" />}
                {category === "Pricing" && <ClientIcon icon="ph:credit-card" className="w-4 h-4" />}
                {category === "Support" && <ClientIcon icon="ph:lifebuoy" className="w-4 h-4" />}
                {category}
              </button>
            );
          })}
        </div>

        {/* Dropdown - Mobile */}
        <div className="md:hidden relative mb-8">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-[#131B2C] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium shadow-sm"
          >
            <div className="flex items-center gap-2">
              {activeCategory === "General" && <ClientIcon icon="ph:chat-circle-text" className="w-5 h-5 text-[#0EA5E9]" />}
              {activeCategory === "Services" && <ClientIcon icon="ph:wrench" className="w-5 h-5 text-[#0EA5E9]" />}
              {activeCategory === "Pricing" && <ClientIcon icon="ph:credit-card" className="w-5 h-5 text-[#0EA5E9]" />}
              {activeCategory === "Support" && <ClientIcon icon="ph:lifebuoy" className="w-5 h-5 text-[#0EA5E9]" />}
              {activeCategory}
            </div>
            <ClientIcon
              icon="ph:caret-down"
              className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#131B2C] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-20"
              >
                {FAQ_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors
                      ${activeCategory === category ? "bg-slate-50 dark:bg-[#1A2333] text-[#0EA5E9]" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1A2333]/50"}
                    `}
                  >
                    {category === "General" && <ClientIcon icon="ph:chat-circle-text" className="w-5 h-5" />}
                    {category === "Services" && <ClientIcon icon="ph:wrench" className="w-5 h-5" />}
                    {category === "Pricing" && <ClientIcon icon="ph:credit-card" className="w-5 h-5" />}
                    {category === "Support" && <ClientIcon icon="ph:lifebuoy" className="w-5 h-5" />}
                    {category}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Accordion List */}
          <div className="space-y-4">
            {FAQ_DATA[activeCategory].map((item, idx) => {
              const isActive = activeQuestionIdx === idx;
              const numStr = (idx + 1).toString().padStart(2, "0");

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
                    className="w-full flex items-center gap-4 p-5 text-left focus:outline-none"
                  >
                    <div
                      className={`
                        shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                        ${isActive
                          ? "bg-[#0EA5E9] text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]"
                          : "bg-slate-100 dark:bg-[#1A2333] text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-[#222E42]"
                        }
                      `}
                    >
                      {numStr}
                    </div>

                    <span
                      className={`flex-grow font-semibold text-[15px] sm:text-base transition-colors duration-300 ${isActive
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                        }`}
                    >
                      {item.q}
                    </span>

                    <div
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-colors duration-300 ${isActive
                        ? "border-[#0EA5E9]/30 text-[#0EA5E9]"
                        : "border-slate-200 dark:border-slate-700 text-slate-400 group-hover:border-slate-300 dark:group-hover:border-slate-600"
                        }`}
                    >
                      <ClientIcon
                        icon={isActive ? "ph:minus" : "ph:plus"}
                        className="w-3.5 h-3.5"
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
                        <div className="pl-[68px] pr-6 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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
