"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";

const CATEGORIES = [
  { name: "Cleaning", icon: "ph:broom" },
  { name: "Electrical", icon: "ph:lightning" },
  { name: "Plumbing", icon: "ph:drop" },
  { name: "AC & Appliance", icon: "ph:fan" },
  { name: "Carpentry", icon: "ph:hammer" },
  { name: "Painting", icon: "ph:paint-roller" },
  { name: "Pest Control", icon: "ph:bug" },
];

export function CategoryTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategories = searchParams.getAll("category");

  const handleCategoryClick = (cat: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (cat === "All") {
      current.delete("category");
    } else {
      current.delete("category");
      current.append("category", cat);
    }
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const isAllSelected = selectedCategories.length === 0;

  return (
    <>
      {/* Mobile Dropdown */}
      <div className="md:hidden w-full mb-6 mt-2 px-4 sm:px-0">
        <div className="relative">
          <select
            value={isAllSelected ? "All" : selectedCategories[0] || "All"}
            onChange={(e) => handleCategoryClick(e.target.value)}
            className="w-full appearance-none bg-white dark:bg-[#131B2C] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white py-3.5 pl-4 pr-10 rounded-xl text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/50"
          >
            <option value="All">All Services</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name}>
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

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.includes(cat.name);
          return (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className={`shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl border transition-all ${
                isSelected
                  ? "bg-white border-[#00B4FF] shadow-[0_4px_16px_rgba(0,180,255,0.15)] text-[#00B4FF]"
                  : "bg-white border-slate-100 hover:border-slate-300 text-slate-500 shadow-sm"
              }`}
            >
              <ClientIcon icon={cat.icon} className="w-8 h-8 mb-2" />
              <span className={`text-xs font-bold ${isSelected ? "text-[#00B4FF]" : "text-slate-600"}`}>
                {cat.name.replace(" & Appliance", "")}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
