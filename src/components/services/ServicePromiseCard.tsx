import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function ServicePromiseCard() {
  return (
    <div className="bg-slate-900 text-white dark:bg-[#0B1424] p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-800 dark:border-blue-500/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-[#00B4FF]/15 rounded-full blur-xl pointer-events-none"></div>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[#00B4FF] text-white flex items-center justify-center shadow-xs shrink-0">
          <ClientIcon icon="ph:shield-check-bold" className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-black tracking-tight text-white leading-tight">UC Style Promise</h3>
          <span className="text-[10px] text-[#00B4FF] font-bold">100% Quality Assurance</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 text-[11px] sm:text-xs font-medium text-slate-300">
        <div className="flex items-start gap-2">
          <ClientIcon icon="ph:check-circle-fill" className="w-3.5 h-3.5 text-[#00B4FF] shrink-0 mt-0.5" />
          <span>Verified & Background Checked Professionals</span>
        </div>
        <div className="flex items-start gap-2">
          <ClientIcon icon="ph:check-circle-fill" className="w-3.5 h-3.5 text-[#00B4FF] shrink-0 mt-0.5" />
          <span>Hassle-free rework warranty on all tasks</span>
        </div>
        <div className="flex items-start gap-2">
          <ClientIcon icon="ph:check-circle-fill" className="w-3.5 h-3.5 text-[#00B4FF] shrink-0 mt-0.5" />
          <span>Safe, hospital-grade eco cleaning solutions</span>
        </div>
        <div className="flex items-start gap-2">
          <ClientIcon icon="ph:check-circle-fill" className="w-3.5 h-3.5 text-[#00B4FF] shrink-0 mt-0.5" />
          <span>Upfront pricing — zero bargaining required</span>
        </div>
      </div>

      <div className="mt-4 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-300 font-bold">
        <span>🛡️ 50,000+ happy homes</span>
        <span className="text-[#00B4FF] shrink-0">Learn More →</span>
      </div>
    </div>
  );
}
