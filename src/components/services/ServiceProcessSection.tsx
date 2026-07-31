import React from "react";
import { Service } from "@/types/service";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface ServiceProcessSectionProps {
  service: Service;
}

export function ServiceProcessSection({ service }: ServiceProcessSectionProps) {
  if (!service.howItWorks || service.howItWorks.length === 0) return null;

  return (
    <section id="section-process" className="scroll-mt-28 sm:scroll-mt-32">
      <div className="bg-white dark:bg-[#0E172B] rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-5 sm:mb-8 flex items-center gap-2">
          <ClientIcon icon="ph:steps-duotone" className="w-5 h-5 sm:w-7 sm:h-7 text-purple-500" />
          <span>Our 4-Stage Mastery Process</span>
        </h2>
        <div className="relative border-l-2 border-purple-200 dark:border-purple-900/40 ml-3 sm:ml-4 flex flex-col gap-6 sm:gap-8 pb-2">
          {service.howItWorks.map((step, idx) => (
            <div key={idx} className="relative pl-6 sm:pl-8 group">
              <span className="absolute -left-[11px] top-0.5 w-5 h-5 rounded-full bg-white dark:bg-[#0E172B] border-4 border-purple-500 group-hover:scale-125 transition-transform shadow-md"></span>
              <h4 className="text-xs sm:text-lg font-black text-slate-900 dark:text-white mb-1 leading-tight">{step.step ? `${step.step}. ${step.title}` : step.title}</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg font-medium">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
