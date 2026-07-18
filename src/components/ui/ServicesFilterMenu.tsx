"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";

const TAGS = ["Trending", "Most Booked", "Value", "New"];
const DURATIONS = ["Under 1 Hour", "1-3 Hours", "Over 3 Hours"];
const RATINGS = [
  { label: "4.5 & above", value: "4.5" },
  { label: "4.0 & above", value: "4.0" },
  { label: "3.5 & above", value: "3.5" },
];
const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Popularity", value: "popularity" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export function ServicesFilterMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const viewType = searchParams.get("type") || "services";
  const selectedTags = searchParams.getAll("tag");
  const selectedDurations = searchParams.getAll("duration");
  const selectedRating = searchParams.get("rating") || "";
  const sortBy = searchParams.get("sort") || "recommended";

  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "10000");
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

  const handleTagToggle = (tag: string) => {
    const updated = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    updateURL({ tag: updated });
  };

  const handleDurationToggle = (dur: string) => {
    const updated = selectedDurations.includes(dur)
      ? selectedDurations.filter((d) => d !== dur)
      : [...selectedDurations, dur];
    updateURL({ duration: updated });
  };

  const handleViewType = (type: string) => {
    updateURL({ type });
  };

  const handleClearAll = () => {
    setMaxPrice("10000");
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete("type");
    current.delete("tag");
    current.delete("duration");
    current.delete("rating");
    current.delete("sort");
    current.delete("maxPrice");
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  // Header component used in both mobile and desktop
  const HeaderContent = (
    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 lg:border-none lg:pb-0 shrink-0">
      <h3 className="font-bold text-lg text-slate-900 dark:text-white">Filter Options</h3>
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
    <div className="flex flex-col gap-5 w-full">
      {/* View Mode Toggle */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">View Mode</h4>
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
          <button
            onClick={() => handleViewType("services")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${viewType === "services"
              ? "bg-white dark:bg-slate-700 text-[#00B4FF] shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
          >
            Services
          </button>
          <button
            onClick={() => handleViewType("packages")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${viewType === "packages"
              ? "bg-white dark:bg-slate-700 text-[#00B4FF] shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
          >
            Packages
          </button>
        </div>
      </div>

      {/* Popularity (Tags) */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Popularity</h4>
        <div className="flex flex-col gap-2">
          {TAGS.map((tag) => (
            <label key={tag} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                className="hidden"
                checked={selectedTags.includes(tag)}
                onChange={() => handleTagToggle(tag)}
              />
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedTags.includes(tag)
                ? "bg-[#00B4FF] border-[#00B4FF]"
                : "bg-white dark:bg-[#131B2C] border-slate-300 dark:border-slate-700 group-hover:border-[#00B4FF]"
                }`}>
                {selectedTags.includes(tag) && <ClientIcon icon="ph:check-bold" className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`text-sm font-medium transition-colors ${selectedTags.includes(tag) ? "text-slate-900 dark:text-white font-bold" : "text-slate-600 dark:text-slate-400"
                }`}>{tag}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Duration</h4>
        <div className="flex flex-col gap-2">
          {DURATIONS.map((dur) => (
            <label key={dur} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                className="hidden"
                checked={selectedDurations.includes(dur)}
                onChange={() => handleDurationToggle(dur)}
              />
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedDurations.includes(dur)
                ? "bg-[#00B4FF] border-[#00B4FF]"
                : "bg-white dark:bg-[#131B2C] border-slate-300 dark:border-slate-700 group-hover:border-[#00B4FF]"
                }`}>
                {selectedDurations.includes(dur) && <ClientIcon icon="ph:check-bold" className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`text-sm font-medium transition-colors ${selectedDurations.includes(dur) ? "text-slate-900 dark:text-white font-bold" : "text-slate-600 dark:text-slate-400"
                }`}>{dur}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Price Range</h4>
          <span className="text-xs font-bold text-[#00B4FF]">Up to ₹{maxPrice}</span>
        </div>
        <input
          type="range"
          min="199"
          max="10000"
          step="100"
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(e.target.value);
            updateURL({ maxPrice: e.target.value });
          }}
          className="w-full accent-[#00B4FF]"
        />
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>₹199</span>
          <span>₹10,000+</span>
        </div>
      </div>

      {/* Ratings */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Ratings</h4>
        <div className="flex flex-wrap gap-2">
          {RATINGS.map((rating) => (
            <button
              key={rating.value}
              onClick={() => {
                const newVal = selectedRating === rating.value ? "" : rating.value;
                updateURL({ rating: newVal });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all ${selectedRating === rating.value
                ? "bg-orange-50 dark:bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-300"
                }`}
            >
              <ClientIcon icon="ph:star-fill" className={`w-3.5 h-3.5 ${selectedRating === rating.value ? "text-orange-500" : "text-slate-400"}`} />
              {rating.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sort By</h4>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => {
              updateURL({ sort: e.target.value });
            }}
            className="w-full appearance-none bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white py-2.5 pl-4 pr-10 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/50"
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
      <div className="hidden lg:block w-full">
        {HeaderContent}
        <div className="mt-5">
          {FilterBody}
        </div>
      </div>
    </>
  );
}
