import React from "react";
import Link from "next/link";
import { Service } from "@/data/mockServices";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface ServiceBreadcrumbProps {
  service: Service;
}

export function ServiceBreadcrumb({ service }: ServiceBreadcrumbProps) {
  return (
    <div className="max-w-[1340px] mx-auto px-3 sm:px-6 lg:px-8 mb-4 sm:mb-6 w-full">
      <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 min-w-0 w-full overflow-hidden text-ellipsis whitespace-nowrap py-1">
        <Link 
          href="/" 
          className="hover:text-[#00B4FF] transition-colors font-bold flex items-center gap-1 shrink-0 bg-white dark:bg-[#0E172B] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs"
        >
          <ClientIcon icon="ph:arrow-left-bold" className="w-3.5 h-3.5 sm:hidden text-[#00B4FF]" />
          <span>Home</span>
        </Link>
        <ClientIcon icon="ph:caret-right-bold" className="w-3 h-3 text-slate-400 shrink-0 hidden sm:inline-block" />
        <span className="font-semibold text-slate-600 dark:text-slate-300 shrink-0 hidden sm:inline-block">{service.category}</span>
        <ClientIcon icon="ph:caret-right-bold" className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-slate-900 dark:text-white font-extrabold truncate pr-1">{service.title}</span>
      </div>
    </div>
  );
}
