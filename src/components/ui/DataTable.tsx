"use client";

import React, { useState, useMemo } from "react";
import { TableFilters, FilterDefinition } from "./TableFilters";
import { Pagination } from "./Pagination";
import { ClientIcon } from "@/components/ui/ClientIcon";

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  filters?: FilterDefinition[];
  searchPlaceholder?: string;
  searchableFields?: (keyof T)[];
  defaultPageSize?: number;
}

export function DataTable<T>({
  data,
  columns,
  filters = [],
  searchPlaceholder = "Search...",
  searchableFields = [],
  defaultPageSize = 10,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: "asc" | "desc" } | null>(null);

  const handleFilterChange = (filterId: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  };

  const filteredAndSortedData = useMemo(() => {
    let processedData = [...data];

    // Search
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      processedData = processedData.filter((item) => {
        return searchableFields.some((field) => {
          const val = item[field];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(lowerQuery);
        });
      });
    }

    // Filter
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value !== "") {
        processedData = processedData.filter((item) => String(item[key as keyof T]) === value);
      }
    });

    // Sort
    if (sortConfig) {
      processedData.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return processedData;
  }, [data, searchQuery, activeFilters, sortConfig, searchableFields]);

  // Pagination
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 shadow rounded-xl border border-slate-200 dark:border-slate-700">
      <TableFilters
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        searchPlaceholder={searchPlaceholder}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider ${
                    col.sortable ? "cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" : ""
                  }`}
                  onClick={() => col.sortable && col.accessorKey && handleSort(col.accessorKey)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && col.accessorKey && (
                      <span className="inline-flex text-slate-400">
                        {sortConfig?.key === col.accessorKey ? (
                          <ClientIcon 
                            icon={sortConfig.direction === "asc" ? "heroicons:chevron-up" : "heroicons:chevron-down"} 
                            className="w-4 h-4" 
                          />
                        ) : (
                          <ClientIcon icon="heroicons:chevron-up-down" className="w-4 h-4 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300"
                    >
                      {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey]) : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
