import React from "react";
import { Service } from "@/data/mockServices";
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
          <span>Why Handy Experts Leads the Industry</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {service.benefits.map((benefit, idx) => (
            <div key={idx} className="flex gap-3 sm:gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-[#00B4FF] to-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md shrink-0">
                {benefit.icon ? <ClientIcon icon={benefit.icon} className="w-5 h-5 sm:w-6 sm:h-6" /> : `0${idx + 1}`}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-base font-black text-slate-900 dark:text-white mb-1 break-words">{benefit.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs leading-relaxed font-medium">
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
