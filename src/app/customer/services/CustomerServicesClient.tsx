"use client";

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GlobalSearchBar } from '@/components/ui/GlobalSearchBar';
import { ServicesFilterMenu } from '@/components/ui/ServicesFilterMenu';
import { ServicesList } from '@/components/services/ServicesList';
import { CategorySidebar } from '@/components/ui/CategorySidebar';
import { ClientIcon } from '@/components/ui/ClientIcon';
import { resolveServiceRating } from '@/lib/serviceRating';
import type { Service } from '@/types/service';
import type { Category } from '@/types/category';

interface Props {
  categories: Category[];
  allServices: Service[];
}

/**
 * All the filtering that used to live in page.tsx, moved here so switching
 * categories/filters is a client-side recompute over data already in memory
 * instead of a full server round trip — same fix already applied to the
 * public /services page (see ServicesPageClient.tsx), applied here too
 * since this page gets clicked through repeatedly per customer visit.
 */
export function CustomerServicesClient({ categories, allServices }: Props) {
  // Default to closed to maximize space, especially on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchParams = useSearchParams();

  const query = (searchParams.get('q') || '').toLowerCase();
  const viewType = searchParams.get('type') === 'packages' ? 'packages' : 'services';
  const selectedCategories = searchParams.getAll('category');
  const selectedTags = searchParams.getAll('tag');
  const selectedDurations = searchParams.getAll('duration');
  const ratingParam = parseFloat(searchParams.get('rating') || '0') || 0;
  const minPrice = parseInt(searchParams.get('minPrice') || '0', 10) || 0;
  const maxPrice = parseInt(searchParams.get('maxPrice') || '10000', 10) || 10000;
  const sortParam = searchParams.get('sort') || 'recommended';

  const filteredServices = useMemo(() => {
    const filtered = allServices.filter((service) => {
      // 1. Search Query
      if (query && !service.title.toLowerCase().includes(query) && !service.description.toLowerCase().includes(query)) {
        return false;
      }
      // 2. Categories
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
      // 4. Price
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
        if (service.time.includes('hr') || service.time.includes('hour')) {
          minutes = parseFloat(service.time) * 60;
        } else if (service.time.includes('min')) {
          minutes = parseFloat(service.time);
        }

        const match = selectedDurations.some((dur) => {
          if (dur === 'Under 1 Hour' && minutes < 60) return true;
          if (dur === '1-3 Hours' && minutes >= 60 && minutes <= 180) return true;
          if (dur === 'Over 3 Hours' && minutes > 180) return true;
          return false;
        });

        if (!match) return false;
      }

      return true;
    });

    if (sortParam === 'price_asc') {
      filtered.sort((a, b) => (a.packages[0]?.price || 0) - (b.packages[0]?.price || 0));
    } else if (sortParam === 'price_desc') {
      filtered.sort((a, b) => (b.packages[0]?.price || 0) - (a.packages[0]?.price || 0));
    }

    return filtered;
  }, [allServices, query, selectedCategories, ratingParam, minPrice, maxPrice, selectedTags, selectedDurations, sortParam]);

  const selectedCategoryName =
    selectedCategories.length > 0 && selectedCategories[0] !== 'All'
      ? categories.find((c) => c.slug === selectedCategories[0] || c.name === selectedCategories[0])?.name || 'Services'
      : 'All Services';

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-white dark:bg-[#020813] overflow-hidden">
      <div className="flex-1 flex h-full">
        {/* Collapsable Left Sidebar (Category Menu) */}
        <div
          className={`shrink-0 h-full bg-slate-50/50 dark:bg-[#060C18] transition-all duration-300 ease-in-out overflow-hidden ${
            isSidebarOpen
              ? "w-[64px] sm:w-[72px] md:w-20 opacity-100 border-r border-slate-100 dark:border-slate-800"
              : "w-0 opacity-0 border-r-0"
          }`}
        >
          <div className="w-[64px] sm:w-[72px] md:w-20 h-full">
            <CategorySidebar categories={categories} />
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0 h-full flex flex-col relative overflow-hidden bg-white dark:bg-[#020813]">

          {/* Top Header Bar in Right Pane (Sticky) */}
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#020813] z-20 shrink-0 shadow-sm transition-all">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`w-10 h-10 flex items-center justify-center shrink-0 rounded-xl transition-colors ${
                isSidebarOpen
                  ? "bg-[#00B4FF]/10 text-[#00B4FF] dark:bg-[#00B4FF]/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
              aria-label="Toggle Categories"
            >
              <ClientIcon icon="ph:list-dashes-bold" className="w-5 h-5" />
            </button>

            <div className="flex-1 min-w-0">
              <GlobalSearchBar placeholder="Search services..." />
            </div>

            <ServicesFilterMenu />
          </div>

          {/* Results Grid - Scrollable independent of sidebar */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-4 pb-24">
            <div className="mb-3 sm:mb-4 px-2 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {selectedCategoryName}
              </h2>
            </div>

            <ServicesList services={filteredServices} viewType={viewType} />
          </div>

        </div>
      </div>
    </div>
  );
}
