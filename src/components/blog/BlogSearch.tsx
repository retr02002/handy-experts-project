"use client";

import React, { useState, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function BlogSearch({ placeholder = "Search articles..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [prevQ, setPrevQ] = useState(searchParams.get("q") || "");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  if ((searchParams.get("q") || "") !== prevQ) {
    const newQ = searchParams.get("q") || "";
    setPrevQ(newQ);
    setQuery(newQ);
  }

  const handleSearch = (val: string) => {
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (val.trim()) {
        current.set("q", val);
      } else {
        current.delete("q");
      }
      router.push(`${pathname}?${current.toString()}`, { scroll: false });
    }, 400); // 400ms debounce
  };

  const clearSearch = () => {
    handleSearch("");
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <ClientIcon icon="ph:magnifying-glass-bold" className="w-5 h-5 text-slate-400" />
      </div>
      <input
        type="text"
        className="w-full bg-white dark:bg-[#131B2C] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/50 transition-all shadow-sm placeholder:text-slate-400 font-medium"
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {query && (
        <button
          onClick={clearSearch}
          className="absolute inset-y-0 right-0 pr-4 flex items-center"
        >
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <ClientIcon icon="ph:x-bold" className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </button>
      )}
    </div>
  );
}
