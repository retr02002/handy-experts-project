"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import type { Category } from "@/types/category";

type Props = {
  categories: Category[];
};

export function CategorySidebar({ categories }: Props) {
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

  const isSelected = (cat: Category) => selectedCategories.includes(cat.slug) || selectedCategories.includes(cat.name);

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50 dark:bg-[#060C18] border-r border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar overflow-x-hidden">
      <button
        onClick={() => handleCategoryClick("All")}
        className={`relative w-full flex flex-col items-center justify-center p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 transition-colors ${
          isAllSelected
            ? "bg-white dark:bg-[#0B1221]"
            : "hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
        }`}
      >
        {isAllSelected && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00B4FF] rounded-r-full shadow-[0_0_8px_rgba(0,180,255,0.5)]"></div>
        )}
        <div className={`w-12 h-12 sm:w-16 sm:h-16 mb-2 rounded-xl flex items-center justify-center overflow-hidden transition-all ${
          isAllSelected 
            ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-[#00B4FF]/30" 
            : "bg-slate-100 dark:bg-slate-800"
        }`}>
          <div className={`text-[10px] font-bold ${isAllSelected ? 'text-[#00B4FF]' : 'text-slate-500'}`}>ALL</div>
        </div>
        <span className={`text-[10px] sm:text-xs text-center font-bold px-1 leading-tight ${
          isAllSelected ? "text-[#00B4FF]" : "text-slate-600 dark:text-slate-400"
        }`}>
          All Services
        </span>
      </button>

      {categories.map((cat) => {
        const selected = isSelected(cat);
        return (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.slug)}
            className={`relative w-full flex flex-col items-center justify-center p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 transition-colors ${
              selected
                ? "bg-white dark:bg-[#0B1221]"
                : "hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
            }`}
          >
            {selected && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00B4FF] rounded-r-full shadow-[0_0_8px_rgba(0,180,255,0.5)]"></div>
            )}
            <div className={`relative w-12 h-12 sm:w-16 sm:h-16 mb-2 rounded-xl overflow-hidden transition-all ${
              selected 
                ? "border-2 border-[#00B4FF]/30 shadow-[0_4px_12px_rgba(0,180,255,0.15)] scale-105" 
                : "border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
            }`}>
              <Image
                src={cat.image || "/placeholder.jpg"}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 48px, 64px"
                className="object-cover"
              />
            </div>
            <span className={`text-[10px] sm:text-xs text-center font-bold px-1 leading-tight ${
              selected ? "text-[#00B4FF]" : "text-slate-600 dark:text-slate-400"
            }`}>
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
