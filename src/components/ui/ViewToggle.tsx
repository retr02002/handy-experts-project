"use client";

import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export type ViewMode = "table" | "cards";

export function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (view: ViewMode) => void }) {
  return (
    <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
      <button
        type="button"
        onClick={() => onChange("table")}
        aria-label="Table view"
        className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
          view === "table"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        }`}
      >
        <ClientIcon icon="ph:list-bold" className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("cards")}
        aria-label="Card view"
        className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
          view === "cards"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        }`}
      >
        <ClientIcon icon="ph:squares-four-bold" className="w-4 h-4" />
      </button>
    </div>
  );
}
