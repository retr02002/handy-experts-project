import React from "react";
import { Service } from "@/types/service";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface ServiceBenefitsSectionProps {
  service: Service;
}

export function ServiceBenefitsSection({ service }: ServiceBenefitsSectionProps) {
  if (!service.benefits || service.benefits.length === 0) return null;

  return (
    <section id="section-benefits" className="scroll-mt-28 sm:scroll-mt-32 pt-2 sm:pt-4">
      <div className="bg-white dark:bg-[#0E172B] rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4 sm:mb-6 flex items-center gap-2">
          <ClientIcon icon="ph:sparkle-duotone" className="w-5 h-5 sm:w-7 sm:h-7 text-[#00B4FF]" />
          <span>Why Handyzo Leads the Industry</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {service.benefits.map((benefit, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-5 sm:p-6 rounded-3xl bg-slate-50/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-100 dark:border-slate-700/50 hover:shadow-lg dark:hover:shadow-none dark:hover:border-[#00B4FF]/30 transition-all duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mb-4 rounded-2xl bg-gradient-to-br from-[#00B4FF]/10 to-[#00B4FF]/5 dark:from-[#00B4FF]/20 dark:to-[#00B4FF]/10 text-[#00B4FF] flex items-center justify-center font-bold text-base shadow-inner shrink-0">
                {benefit.icon ? <ClientIcon icon={benefit.icon} className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm" /> : `0${idx + 1}`}
              </div>
              <div className="min-w-0 flex flex-col gap-1.5">
                <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white break-words">{benefit.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium px-2">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
