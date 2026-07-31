import React from "react";
import { Service } from "@/types/service";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface ServiceFaqsSectionProps {
  service: Service;
}

export function ServiceFaqsSection({ service }: ServiceFaqsSectionProps) {
  if (!service.faqs || service.faqs.length === 0) return null;

  return (
    <section id="section-faqs" className="scroll-mt-28 sm:scroll-mt-32 pb-4">
      <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4 sm:mb-6 flex items-center gap-2 px-1">
        <ClientIcon icon="ph:question-duotone" className="w-5 h-5 sm:w-7 sm:h-7 text-orange-500" />
        Frequently Asked Questions
      </h2>
      <div className="flex flex-col gap-2.5 sm:gap-3">
        {service.faqs.map((faq, idx) => (
          <details key={idx} className="bg-white dark:bg-[#0E172B] border border-slate-200/90 dark:border-slate-800 rounded-xl sm:rounded-2xl shadow-xs group [&_summary::-webkit-details-marker]:hidden">
            <summary className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer font-bold text-xs sm:text-base text-slate-900 dark:text-white group-hover:text-[#00B4FF] transition-colors">
              <span className="pr-2 leading-snug">{faq.question}</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 group-open:rotate-180 group-open:bg-[#00B4FF] group-open:text-white transition-all shrink-0">
                <ClientIcon icon="ph:caret-down-bold" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </summary>
            <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed border-t border-slate-100 dark:border-slate-800/60 mt-1">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
