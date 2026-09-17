"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { GlobalSearchBar } from "@/components/ui/GlobalSearchBar";
import { ServicesFilterMenu } from "@/components/ui/ServicesFilterMenu";
import { ServicesList } from "@/components/services/ServicesList";
import { CategorySidebar } from "@/components/ui/CategorySidebar";
import { resolveServiceRating } from "@/lib/serviceRating";
import type { Service } from "@/types/service";
import type { Category } from "@/types/category";

interface Props {
  allServices: Service[];
  categories: Category[];
}

/**
 * All the filtering that used to live in page.tsx, moved here so switching
 * categories/filters is a client-side recompute over data already in memory
 * instead of a full server round trip. page.tsx no longer reads
 * searchParams at all, so it's not forced into dynamic rendering — a
 * category click just updates the URL and re-renders this component
 * in-browser, no network request involved.
 */
export function ServicesPageClient({ allServices, categories }: Props) {
  const searchParams = useSearchParams();

  const query = (searchParams.get("q") || "").toLowerCase();
  const viewType = searchParams.get("type") === "packages" ? "packages" : "services";
  const selectedCategories = searchParams.getAll("category");
  const selectedTags = searchParams.getAll("tag");
  const selectedDurations = searchParams.getAll("duration");
  const ratingParam = parseFloat(searchParams.get("rating") || "0") || 0;
  const minPrice = parseInt(searchParams.get("minPrice") || "0", 10) || 0;
  const maxPrice = parseInt(searchParams.get("maxPrice") || "10000", 10) || 10000;
  const sortParam = searchParams.get("sort") || "recommended";

  const filteredServices = useMemo(() => {
    const filtered = allServices.filter((service) => {
      // 1. Search Query
      if (query && !service.title.toLowerCase().includes(query) && !service.description.toLowerCase().includes(query)) {
        return false;
      }
      // 2. Categories. Matched on slug, but the name is accepted too so links
      // shared before categories moved to the DB don't silently return nothing.
      if (selectedCategories.length > 0) {
        const cat = service.category;
        if (!cat || !selectedCategories.some((sel) => sel === cat.slug || sel === cat.name)) {
          return false;
        }
      }
      // 3. Ratings
      if (ratingParam > 0) {
        const serviceRating = resolveServiceRating(service).value;
        if (serviceRating === null || serviceRating < ratingParam) {
          return false;
        }
      }
      // 4. Price (check if any package is within range — services with no packages yet aren't excluded by this)
      if (service.packages.length > 0) {
        const hasPackagesInPriceRange = service.packages.some((pkg) => pkg.price >= minPrice && pkg.price <= maxPrice);
        if (!hasPackagesInPriceRange) {
          return false;
        }
      }
      // 5. Popularity (Tags)
      if (selectedTags.length > 0) {
        if (!service.badge || !selectedTags.some((tag) => service.badge!.toLowerCase().includes(tag.toLowerCase()))) {
          return false;
        }
      }
      // 6. Duration
      if (selectedDurations.length > 0) {
        let minutes = 0;
        if (service.time.includes("hr") || service.time.includes("hour")) {
          minutes = parseFloat(service.time) * 60;
        } else if (service.time.includes("min")) {
          minutes = parseFloat(service.time);
        }

        const match = selectedDurations.some((dur) => {
          if (dur === "Under 1 Hour" && minutes < 60) return true;
          if (dur === "1-3 Hours" && minutes >= 60 && minutes <= 180) return true;
          if (dur === "Over 3 Hours" && minutes > 180) return true;
          return false;
        });

        if (!match) return false;
      }

      return true;
    });

    // Sort logic (Mock implementation based on price of first package or rating)
    if (sortParam === "price_asc") {
      filtered.sort((a, b) => (a.packages[0]?.price || 0) - (b.packages[0]?.price || 0));
    } else if (sortParam === "price_desc") {
      filtered.sort((a, b) => (b.packages[0]?.price || 0) - (a.packages[0]?.price || 0));
    }

    return filtered;
  }, [allServices, query, selectedCategories, ratingParam, minPrice, maxPrice, selectedTags, selectedDurations, sortParam]);

  const heading =
    selectedCategories.length > 0 && selectedCategories[0] !== "All"
      ? categories.find((c) => c.slug === selectedCategories[0] || c.name === selectedCategories[0])?.name || "Services"
      : "All Services";

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#020813] pt-20 md:pt-24">
      {/* Main Container - Full Width on Mobile, Max Width on Desktop */}
      <div className="w-full h-[calc(100vh-80px)] md:h-[calc(100vh-96px)] max-w-7xl mx-auto md:px-3 lg:px-6 pb-2 md:pb-4 flex flex-col">
        <div className="flex-1 flex overflow-hidden bg-white dark:bg-[#020813] md:rounded-3xl md:border border-slate-100 dark:border-slate-800 shadow-sm">
          {/* Left Sidebar (Category Menu) */}
          <div className="w-20 sm:w-24 md:w-28 shrink-0 h-full border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060C18]">
            <CategorySidebar categories={categories} variant="large" />
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0 h-full flex flex-col relative overflow-hidden bg-white dark:bg-[#020813]">
            {/* Top Header Bar in Right Pane (Sticky) */}
            <div className="flex items-center gap-3 p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#020813] z-20 shrink-0 shadow-sm">
              <div className="flex-1 min-w-0">
                <GlobalSearchBar placeholder="Search services..." />
              </div>

              <ServicesFilterMenu />
            </div>

            {/* Results Grid - Scrollable independent of sidebar */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 pb-24">
              <div className="mb-4 sm:mb-6 flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{heading}</h2>
              </div>

              <ServicesList services={filteredServices} viewType={viewType} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
