"use client";

import React, { useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export interface TabDef {
  id: string;
  label: string;
  icon: string;
  badge?: string | number;
  content: React.ReactNode;
}

interface TabShellProps {
  tabs: TabDef[];
  defaultTabId?: string;
  /** Rendered once, above the tab strip — title/status/back-link, shared across every tab. */
  header?: React.ReactNode;
}

/**
 * Client-side, instant-switching tab shell for a detail page — one URL, no
 * reload, no per-tab loading spinner (the page above fetches every tab's
 * data up front in parallel and passes it down as already-rendered
 * content). Deliberately NOT synced to a ?tab= query param: that would risk
 * Next.js treating a tab click as a real navigation and re-running the
 * server component, which fights the whole point of instant switching.
 * Every panel stays mounted (toggled via `hidden`, never unmounted) so
 * in-panel form state survives tabbing away and back.
 */
export function TabShell({ tabs, defaultTabId, header }: TabShellProps) {
  const [active, setActive] = useState(defaultTabId ?? tabs[0]?.id);

  return (
    <div className="flex flex-col gap-4 sm:gap-5 w-full">
      {header}

      {/* Segmented, pill-style tab strip — a rounded card of its own so it
          reads as one touch-friendly control on mobile rather than an
          underlined desktop-web tab bar. */}
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-sm w-full">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 h-10 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              active === t.id
                ? "bg-[#00B4FF] text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <ClientIcon icon={t.icon} className="w-4 h-4 shrink-0" />
            {t.label}
            {t.badge !== undefined && (
              <span
                className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] leading-none ${
                  active === t.id ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tabs.map((t) => (
        <div key={t.id} hidden={active !== t.id}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
