"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { Category } from "@/types/category";

type Props = {
  categories: Category[];
};

export function CategoryTabs({ categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategories = searchParams.getAll("category");

  const handleCategoryClick = (slug: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete("category");
    if (slug !== "All") {
      current.append("category", slug);
    }
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const isAllSelected = selectedCategories.length === 0;

  // A category can be selected by name via a legacy link, so match on both.
  const isSelected = (cat: Category) => selectedCategories.includes(cat.slug) || selectedCategories.includes(cat.name);

  const selectedValue = categories.find(isSelected)?.slug ?? "All";

  return (
    <>
      {/* Mobile Dropdown */}
      <div className="md:hidden w-full mb-6 mt-2 px-4 sm:px-0">
        <div className="relative">
          <select
            value={selectedValue}
            onChange={(e) => handleCategoryClick(e.target.value)}
            className="w-full appearance-none bg-white dark:bg-[#131B2C] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white py-3.5 pl-4 pr-10 rounded-xl text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/50"
          >
            <option value="All">All Services</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <ClientIcon icon="ph:caret-down-bold" className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00B4FF] pointer-events-none" />
        </div>
      </div>

      {/* Desktop Horizontal Scroll */}
      <div className="hidden md:flex items-center gap-4 overflow-x-auto custom-scrollbar pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => handleCategoryClick("All")}
          className={`shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl border transition-all ${
            isAllSelected
              ? "bg-white border-[#00B4FF] shadow-[0_4px_16px_rgba(0,180,255,0.15)] text-[#00B4FF]"
              : "bg-white border-slate-100 hover:border-slate-300 text-slate-500 shadow-sm"
          }`}
        >
          <ClientIcon icon="ph:squares-four" className="w-8 h-8 mb-2" />
          <span className={`text-xs font-bold ${isAllSelected ? "text-[#00B4FF]" : "text-slate-600"}`}>
            All Services
          </span>
        </button>

        {categories.map((cat) => {
          const selected = isSelected(cat);
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl border transition-all ${
                selected
                  ? "bg-white border-[#00B4FF] shadow-[0_4px_16px_rgba(0,180,255,0.15)] text-[#00B4FF]"
                  : "bg-white border-slate-100 hover:border-slate-300 text-slate-500 shadow-sm"
              }`}
            >
              <ClientIcon icon={cat.icon || "ph:tag"} className="w-8 h-8 mb-2" />
              <span className={`text-xs font-bold text-center px-1 leading-tight ${selected ? "text-[#00B4FF]" : "text-slate-600"}`}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
