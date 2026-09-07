import { ClientIcon } from "@/components/ui/ClientIcon";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export interface TrustCardProps {
  title: string;
  subtitle: string;
  desc: string;
  icon: string;
  index?: number;
}

export function TrustCard({ title, desc, icon, index = 0 }: TrustCardProps) {
  return (
    <ScrollReveal
      className="group relative bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 rounded-[20px] p-4 flex flex-col h-full hover:shadow-[0_8px_24px_rgba(0,180,255,0.08)] hover:-translate-y-1 hover:border-[#00B4FF]/40 transition-all duration-300"
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="flex flex-col gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-[#38bdf8] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:-rotate-3 group-hover:scale-105 transition-all duration-300 shadow-sm">
          <ClientIcon icon={icon} className="w-5 h-5" />
        </div>
        
        {/* Title */}
        <h3 className="text-[13px] sm:text-[14px] font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-[#00B4FF] transition-colors">
          {title}
        </h3>
      </div>

      {/* Description */}
      <div className="flex-grow mt-2">
        <p className="text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
          {desc}
        </p>
      </div>
    </ScrollReveal>
  );
}
