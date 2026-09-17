"use client";

import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { AdminContactQuery } from "@/actions/contactquery.actions";
import { REASON_LABELS, REASON_STYLES, STATUS_LABELS, STATUS_STYLES } from "./contactQueryStyles";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

interface Props {
  data: AdminContactQuery[];
  onView: (query: AdminContactQuery) => void;
  onDelete: (id: string) => void;
  busyId: string | null;
}

export function ContactQueriesCardGrid({ data, onView, onDelete, busyId }: Props) {
  if (data.length === 0) {
    return (
      <div className="p-10 text-center bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl">
        <p className="text-sm text-slate-400">No queries match your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {data.map((query) => (
        <div
          key={query.id}
          className="flex flex-col gap-3 p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-[#00B4FF] to-blue-600 flex items-center justify-center text-white font-bold">
                {query.firstName.charAt(0).toUpperCase()}
                {query.lastName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {query.firstName} {query.lastName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{query.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDelete(query.id)}
              disabled={busyId === query.id}
              aria-label={`Delete query from ${query.firstName} ${query.lastName}`}
              className="w-7 h-7 shrink-0 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center disabled:opacity-50 cursor-pointer transition-colors"
            >
              <ClientIcon icon="ph:trash-bold" className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${REASON_STYLES[query.reason]}`}>
              {REASON_LABELS[query.reason]}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[query.status]}`}>
              {STATUS_LABELS[query.status]}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            {query.message}
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ClientIcon icon="ph:calendar-blank" className="w-3.5 h-3.5" />
              {formatDate(query.createdAt)}
            </span>
            <button
              type="button"
              onClick={() => onView(query)}
              className="text-xs font-bold text-[#00B4FF] cursor-pointer"
            >
              View →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
