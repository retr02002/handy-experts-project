import React from "react";
import { Service } from "@/data/mockServices";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface ServiceSummaryCardProps {
  service: Service;
}

export function ServiceSummaryCard({ service }: ServiceSummaryCardProps) {
  return (
    <div className="bg-white dark:bg-[#0E172B] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs w-full min-w-0 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#00B4FF]/10 via-purple-500/5 to-transparent rounded-bl-full pointer-events-none"></div>

      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#00B4FF] dark:bg-blue-500/10 text-[10px] font-black uppercase tracking-wider border border-blue-100/60 dark:border-blue-500/20 mb-2.5 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00B4FF] animate-pulse"></span>
        {service.badge || service.category}
      </span>

      <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2 break-words">
        {service.title}
      </h1>

      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <div className="flex items-center text-amber-500 font-black gap-1 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md text-xs border border-amber-200/60 dark:border-amber-500/20 shadow-2xs shrink-0">
          <ClientIcon icon="ph:star-fill" className="w-3.5 h-3.5 text-amber-500" />
          <span>{service.rating.split(' ')[0]}</span>
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
          {service.rating.includes('(') ? service.rating.slice(service.rating.indexOf('(')) : '(12,480 bookings)'}
        </span>
      </div>

      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-3.5 font-medium break-words">
        {service.description}
      </p>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#00B4FF]/15 dark:bg-[#00B4FF]/20 flex items-center justify-center text-[#00B4FF] shrink-0 shadow-2xs">
            <ClientIcon icon="ph:clock-duotone" className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Duration</div>
            <div className="text-xs font-black text-slate-800 dark:text-white leading-tight truncate">{service.time}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 shadow-2xs">
            <ClientIcon icon="ph:shield-check-duotone" className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Protection</div>
            <div className="text-xs font-black text-slate-800 dark:text-white leading-tight truncate">{service.warranty}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
