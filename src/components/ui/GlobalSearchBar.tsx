"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";

export interface GlobalSearchBarProps {
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function GlobalSearchBar({
  placeholder = "Search for a service...",
  className = "",
  debounceMs = 300,
}: GlobalSearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");

  // Debounce the URL update
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      
      // Only push if it actually changed to avoid unnecessary renders/history states
      if (searchParams.get("q") !== query && !(searchParams.get("q") === null && query === "")) {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [query, router, pathname, searchParams, debounceMs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <ClientIcon icon="ph:magnifying-glass" className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="block w-full pl-11 pr-10 py-3.5 bg-slate-50 dark:bg-[#131B2C]/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/50 transition-all shadow-sm"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <ClientIcon icon="ph:x-circle-fill" className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
