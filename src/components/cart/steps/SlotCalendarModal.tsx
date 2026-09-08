"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { ClientIcon } from "@/components/ui/ClientIcon";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

interface Props {
  selectedIso: string;
  onSelect: (iso: string) => void;
  onClose: () => void;
}

export function SlotCalendarModal({ selectedIso, onSelect, onClose }: Props) {
  const today = startOfDay(new Date());
  const initialSelected = selectedIso ? new Date(`${selectedIso}T00:00:00`) : today;
  const [viewDate, setViewDate] = useState(new Date(initialSelected.getFullYear(), initialSelected.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const isCurrentMonthView = year === today.getFullYear() && month === today.getMonth();

  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const goPrevMonth = () => {
    if (isCurrentMonthView) return;
    setViewDate(new Date(year, month - 1, 1));
  };
  const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#0F172A] w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
        <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={goPrevMonth}
            disabled={isCurrentMonthView}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <ClientIcon icon="ph:caret-left-bold" className="w-4 h-4" />
          </button>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate min-w-0">{monthLabel}</h3>
          <button
            type="button"
            onClick={goNextMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <ClientIcon icon="ph:caret-right-bold" className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAY_LABELS.map((w, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`b-${idx}`} />;
            const cellDate = startOfDay(new Date(year, month, day));
            const iso = toIso(cellDate);
            const isPast = cellDate < today;
            const isToday = cellDate.getTime() === today.getTime();
            const isSelected = iso === selectedIso;
            return (
              <button
                key={iso}
                type="button"
                disabled={isPast}
                onClick={() => onSelect(iso)}
                className={`aspect-square rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center transition-all relative ${
                  isPast
                    ? "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                    : isSelected
                    ? "bg-[#00B4FF] text-white"
                    : "text-slate-700 dark:text-slate-300 hover:bg-[#00B4FF]/10"
                }`}
              >
                {day}
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#00B4FF]" />
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-slate-400 text-center mt-4">Past dates aren&apos;t available for booking.</p>
      </div>
    </div>,
    document.body
  );
}
