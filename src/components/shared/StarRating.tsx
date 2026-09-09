"use client";

import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

/** Read-only star row. `value` may be fractional — halves round to nearest. */
export function StarRating({ value, size = "w-3.5 h-3.5" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <ClientIcon
          key={n}
          icon={n <= Math.round(value) ? "ph:star-fill" : "ph:star"}
          className={`${size} ${n <= Math.round(value) ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
        />
      ))}
    </span>
  );
}

/** Interactive 1-5 picker. */
export function StarInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onClick={() => onChange(n)}
            className="p-0.5 cursor-pointer transition-transform active:scale-90"
          >
            <ClientIcon
              icon={n <= value ? "ph:star-fill" : "ph:star"}
              className={`w-7 h-7 ${n <= value ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
