"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";

const CATEGORIES = [
  "Home Improvement",
  "Maintenance",
  "Tips & Tricks",
  "DIY Repairs",
  "Design",
  "Gardening",
];

const READ_TIMES = [
  "Under 5 min",
  "5-10 min",
  "Over 10 min",
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Popularity", value: "popularity" },
];

export function BlogFilterMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategories = searchParams.getAll("category");
  const selectedReadTimes = searchParams.getAll("readTime");
  const sortBy = searchParams.get("sort") || "newest";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const updateURL = (params: Record<string, string | string[] | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") {
        current.delete(key);
      } else if (Array.isArray(value)) {
        current.delete(key);
        value.forEach((v) => current.append(key, v));
      } else {
        current.set(key, value);
      }
    });

    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const handleCategoryToggle = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    updateURL({ category: updated });
  };

  const handleReadTimeToggle = (time: string) => {
    const updated = selectedReadTimes.includes(time)
      ? selectedReadTimes.filter((t) => t !== time)
      : [...selectedReadTimes, time];
    updateURL({ readTime: updated });
  };

  const handleClearAll = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete("category");
    current.delete("readTime");
    current.delete("sort");
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  // Header component used in both mobile and desktop
  const HeaderContent = (
    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 lg:border-none lg:pb-0 shrink-0">
      <h3 className="font-bold text-lg text-slate-900 dark:text-white">Filters</h3>
      <button
        onClick={handleClearAll}
        className="text-sm font-bold text-[#00B4FF] hover:text-[#009EE0] transition-colors"
      >
        Clear All
      </button>
    </div>
  );

  // The scrollable body of filters
  const FilterBody = (
    <div className="flex flex-col gap-6 w-full">
      {/* Categories */}
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Categories</h4>
        <div className="flex flex-col gap-2.5">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="hidden"
                checked={selectedCategories.includes(cat)}
                onChange={() => handleCategoryToggle(cat)}
              />
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedCategories.includes(cat)
                ? "bg-[#00B4FF] border-[#00B4FF]"
                : "bg-white dark:bg-[#131B2C] border-slate-300 dark:border-slate-700 group-hover:border-[#00B4FF]"
                }`}>
                {selectedCategories.includes(cat) && <ClientIcon icon="ph:check-bold" className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`text-sm transition-colors ${selectedCategories.includes(cat) ? "text-slate-900 dark:text-white font-bold" : "text-slate-600 dark:text-slate-400 font-medium"
                }`}>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>

      {/* Read Time */}
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Read Time</h4>
        <div className="flex flex-col gap-2.5">
          {READ_TIMES.map((time) => (
            <label key={time} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="hidden"
                checked={selectedReadTimes.includes(time)}
                onChange={() => handleReadTimeToggle(time)}
              />
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedReadTimes.includes(time)
                ? "bg-[#00B4FF] border-[#00B4FF]"
                : "bg-white dark:bg-[#131B2C] border-slate-300 dark:border-slate-700 group-hover:border-[#00B4FF]"
                }`}>
                {selectedReadTimes.includes(time) && <ClientIcon icon="ph:check-bold" className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`text-sm transition-colors ${selectedReadTimes.includes(time) ? "text-slate-900 dark:text-white font-bold" : "text-slate-600 dark:text-slate-400 font-medium"
                }`}>{time}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>

      {/* Sort By */}
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Sort By</h4>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => {
              updateURL({ sort: e.target.value });
            }}
            className="w-full appearance-none bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white py-2.5 pl-4 pr-10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/50"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ClientIcon icon="ph:caret-down-bold" className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden w-full mb-4">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-[#131B2C] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-bold shadow-sm"
        >
          <ClientIcon icon="ph:faders-horizontal" className="w-5 h-5 text-[#00B4FF]" />
          Filter & Sort Options
        </button>
      </div>

      {/* Mobile Modal Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end lg:hidden bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1221] w-full max-h-[90vh] rounded-t-3xl flex flex-col animate-in slide-in-from-bottom-4 duration-300 shadow-2xl overflow-hidden mt-auto">
            {/* Drag Handle Indicator */}
            <div className="w-full flex justify-center pt-3 pb-1 bg-white dark:bg-[#0B1221] shrink-0">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#0B1221] z-10 shrink-0">
              {HeaderContent}
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto px-6 py-5 custom-scrollbar flex-1 bg-slate-50/50 dark:bg-[#0B1221]">
              {FilterBody}
            </div>

            {/* Sticky Footer */}
            <div className="p-5 pb-8 border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#0B1221] shrink-0 z-10">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full h-14 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-sm font-bold rounded-2xl transition-all flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full h-14 bg-[#00B4FF] hover:bg-[#009EE0] text-white text-sm font-bold rounded-2xl shadow-lg shadow-[#00B4FF]/25 transition-all flex items-center justify-center"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-full bg-white dark:bg-[#131B2C] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        {HeaderContent}
        <div className="mt-6">
          {FilterBody}
        </div>
      </div>
    </>
  );
}
