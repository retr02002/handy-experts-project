import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function ServicePromoBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-transparent border border-blue-200 dark:border-blue-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 my-1 sm:my-2 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 w-full min-w-0">
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 w-full">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#00B4FF] text-white flex items-center justify-center shadow-lg shrink-0">
          <ClientIcon icon="ph:shield-check-bold" className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white mb-0.5 truncate">
            Feel Ease & Peace with Handy Experts
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed break-words">
            100% damage protection coverage & complimentary 48-hour free rework guarantee on every task.
          </p>
        </div>
      </div>
      <a 
        href="#section-benefits" 
        className="w-full sm:w-auto shrink-0 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:text-[#00B4FF] font-bold text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors text-center inline-block"
      >
        Learn More
      </a>
    </div>
  );
}
