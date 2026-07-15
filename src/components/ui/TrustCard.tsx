import { ClientIcon } from "@/components/ui/ClientIcon";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export interface TrustCardProps {
  title: string;
  subtitle: string;
  desc: string;
  icon: string;
  index?: number;
}

export function TrustCard({ title, subtitle, desc, icon, index = 0 }: TrustCardProps) {
  return (
    <ScrollReveal
      className="group relative bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/60 rounded-[16px] p-4 sm:p-5 hover:shadow-lg dark:shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-transparent dark:hover:shadow-[0_4px_20px_rgba(0,180,255,0.08)] overflow-hidden"
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* 1. Subtle Gradient Border */}
      <div className="absolute inset-0 rounded-[16px] p-[1px] bg-gradient-to-b from-transparent to-[#00B4FF]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />

      {/* 2. Soft background mesh/glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#00B4FF]/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

      <div className="flex flex-col gap-3 sm:gap-4 relative z-10">

        {/* Top Row: Icon + Titles */}
        <div className="flex items-center gap-3">
          {/* Icon Box */}
          <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-50 dark:bg-[#131B2F] border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-[#00B4FF]/40 shadow-sm transition-colors duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <ClientIcon icon={icon} className="w-4 h-4 sm:w-5 sm:h-5 text-[#00B4FF] transition-all duration-300 group-hover:drop-shadow-[0_0_6px_rgba(0,180,255,0.4)]" />
          </div>

          {/* Title & Subtitle */}
          <div>
            <h3 className="text-md sm:text-lg font-bold text-slate-900 dark:text-white leading-tight mb-0.5 transition-colors duration-300">
              {title}
            </h3>
            <p className="text-[11px] sm:text-[12px] font-bold tracking-wide uppercase text-[#00B4FF]">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Description Text */}
        <p className="text-xs sm:text-[14px] text-slate-800 dark:text-slate-300 leading-relaxed font-medium">
          {desc}
        </p>
      </div>

      {/* 3. Expanding Bottom Highlight Line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-gradient-to-r from-[#00B4FF] to-[#0070FF] w-0 group-hover:w-full transition-all duration-500 ease-out z-10" />
    </ScrollReveal>
  );
}
