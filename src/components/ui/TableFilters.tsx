"use client";

import React, { useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDefinition {
  id: string;
  label: string;
  options: FilterOption[];
}

interface TableFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters?: FilterDefinition[];
  activeFilters: Record<string, string>;
  onFilterChange: (filterId: string, value: string) => void;
  searchPlaceholder?: string;
}

export function TableFilters({
  searchQuery,
  onSearchChange,
  filters = [],
  activeFilters,
  onFilterChange,
  searchPlaceholder = "Search...",
}: TableFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 rounded-t-xl">
      <div className="relative w-full sm:max-w-xs">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <ClientIcon icon="heroicons:magnifying-glass" className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder={searchPlaceholder}
        />
      </div>

      {filters.length > 0 && (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="sm:hidden flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <ClientIcon icon="heroicons:funnel" className="h-5 w-5 mr-2" />
            Filters
          </button>

          {/* Desktop & Mobile Expanded Filters */}
          <div className={`${isFilterOpen ? "flex" : "hidden"} sm:flex flex-col sm:flex-row gap-3 w-full sm:w-auto`}>
            {filters.map((filter) => (
              <select
                key={filter.id}
                value={activeFilters[filter.id] || ""}
                onChange={(e) => onFilterChange(filter.id, e.target.value)}
                className="block w-full sm:w-40 py-2 pl-3 pr-10 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">All {filter.label}</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
