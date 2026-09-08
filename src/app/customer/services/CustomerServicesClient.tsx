"use client";

import React, { useState, Suspense } from 'react';
import { GlobalSearchBar } from '@/components/ui/GlobalSearchBar';
import { ServicesFilterMenu } from '@/components/ui/ServicesFilterMenu';
import { ServicesList } from '@/components/services/ServicesList';
import { CategorySidebar } from '@/components/ui/CategorySidebar';
import { ClientIcon } from '@/components/ui/ClientIcon';
import type { Service } from '@/types/service';
import type { Category } from '@/types/category';

interface Props {
  categories: Category[];
  filteredServices: Service[];
  viewType: 'services' | 'packages';
  selectedCategoryName: string;
}

export function CustomerServicesClient({ 
  categories, 
  filteredServices, 
  viewType,
  selectedCategoryName
}: Props) {
  // Default to closed to maximize space, especially on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            <Suspense fallback={<div className="h-full bg-slate-100 dark:bg-slate-800 animate-pulse"></div>}>
              <CategorySidebar categories={categories} />
            </Suspense>
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
              <Suspense fallback={<div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>}>
                <GlobalSearchBar placeholder="Search services..." />
              </Suspense>
            </div>
            
            <Suspense fallback={<div className="w-24 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>}>
              <ServicesFilterMenu />
            </Suspense>
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
