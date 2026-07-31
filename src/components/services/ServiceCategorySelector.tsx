"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ServicePackage } from "@/data/mockServices";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface CategorySelectorProps {
  categoryNames: string[];
  packageCategories: Record<string, ServicePackage[]>;
}

function useScrollTo() {
  const [activeTab, setActiveTab] = useState<string>("all-packages");

  const scrollTo = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 105; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return { activeTab, scrollTo };
}

export function MobileCategoryChipBar({ categoryNames }: { categoryNames: string[] }) {
  const { activeTab, scrollTo } = useScrollTo();

  return (
    <div className="lg:hidden sticky top-[68px] sm:top-20 z-30 bg-white/95 dark:bg-[#060B15]/95 backdrop-blur-xl border-y border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-2 mb-4 shadow-xs w-full overflow-x-auto no-scrollbar flex items-center gap-2">
      {categoryNames.map((cat, index) => (
        <button
          key={cat}
          onClick={() => scrollTo(`section-${cat}`)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all shrink-0 ${
            activeTab === `section-${cat}` || (index === 0 && activeTab === 'all-packages')
              ? 'bg-gradient-to-r from-[#00B4FF] to-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {cat}
        </button>
      ))}
      <button
        onClick={() => scrollTo("section-benefits")}
        className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
      >
        ✨ Why Us
      </button>
      <button
        onClick={() => scrollTo("section-process")}
        className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
      >
        🔄 Process
      </button>
      <button
        onClick={() => scrollTo("section-faqs")}
        className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
      >
        ❓ FAQs
      </button>
    </div>
  );
}

export function DesktopCategorySelectorCard({ categoryNames, packageCategories }: CategorySelectorProps) {
  const { activeTab, scrollTo } = useScrollTo();

  return (
    <div className="bg-white dark:bg-[#0E172B] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hidden lg:block">
      <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 px-1 flex items-center justify-between">
        <span>Select a category</span>
        <ClientIcon icon="ph:list-drip-bold" className="w-3.5 h-3.5 text-[#00B4FF]" />
      </h3>
      <div className="flex flex-col gap-1">
        {categoryNames.map((cat, index) => {
          const firstPkg = packageCategories[cat]?.[0];
          return (
            <button
              key={cat}
              onClick={() => scrollTo(`section-${cat}`)}
              className={`flex items-center justify-between p-2 rounded-xl transition-all font-bold text-xs text-left group ${
                activeTab === `section-${cat}` || (index === 0 && activeTab === 'all-packages')
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-[#00B4FF] border border-blue-200/60 dark:border-blue-700/40 shadow-xs'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs">
                  {firstPkg?.image ? (
                    <Image src={firstPkg.image} alt={cat} fill className="object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <ClientIcon icon="ph:sparkle-duotone" className="w-4 h-4 text-[#00B4FF]" />
                  )}
                </div>
                <span className="truncate">{cat}</span>
              </div>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                {packageCategories[cat]?.length || 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
