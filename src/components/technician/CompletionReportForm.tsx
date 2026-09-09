"use client";

import React from "react";
import { HOLD_REASONS, type ServiceReportInput } from "@/lib/validations/servicereport.schema";

const COMPLETION_STATUSES: { value: ServiceReportInput["completionStatus"]; label: string }[] = [
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On hold" },
  { value: "REVISIT_REQUIRED", label: "Revisit required" },
];

export interface ReportDraft {
  completionStatus: ServiceReportInput["completionStatus"];
  holdReason: string;
  newVisitDate: string;
  newVisitTime: string;
  remarks: string;
}

export const emptyReportDraft: ReportDraft = {
  completionStatus: "COMPLETED",
  holdReason: "",
  newVisitDate: "",
  newVisitTime: "",
  remarks: "",
};

/**
 * Folds the two separate date/time inputs back into the single ISO instant
 * the server stores, and does the same required-field checks the zod schema
 * enforces so the technician gets the error inline rather than after a
 * round trip.
 */
export function draftToInput(draft: ReportDraft): { ok: true; value: ServiceReportInput } | { ok: false; error: string } {
  const needsFollowUp = draft.completionStatus !== "COMPLETED";
  if (draft.remarks.trim().length < 3) return { ok: false, error: "Add a short note about the work done." };
  if (needsFollowUp && !draft.holdReason) return { ok: false, error: "Pick a reason for holding this job." };
  if (needsFollowUp && (!draft.newVisitDate || !draft.newVisitTime)) {
    return { ok: false, error: "Pick a date and time for the next visit." };
  }

  return {
    ok: true,
    value: {
      completionStatus: draft.completionStatus,
      holdReason: needsFollowUp ? draft.holdReason : undefined,
      newVisitAt: needsFollowUp ? new Date(`${draft.newVisitDate}T${draft.newVisitTime}:00`).toISOString() : null,
      remarks: draft.remarks.trim(),
    },
  };
}

const fieldClass =
  "w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all";
const labelClass = "text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider";

export function CompletionReportForm({
  draft,
  onChange,
}: {
  draft: ReportDraft;
  onChange: (draft: ReportDraft) => void;
}) {
  const set = <K extends keyof ReportDraft>(key: K, value: ReportDraft[K]) => onChange({ ...draft, [key]: value });
  const needsFollowUp = draft.completionStatus !== "COMPLETED";
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
      <p className="text-sm font-bold text-slate-900 dark:text-white">Submit report</p>

      <div>
        <label className={labelClass}>Complaint status *</label>
        <select
          value={draft.completionStatus}
          onChange={(e) => set("completionStatus", e.target.value as ReportDraft["completionStatus"])}
          className={`${fieldClass} cursor-pointer`}
        >
          {COMPLETION_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {needsFollowUp && (
        <>
          <div>
            <label className={labelClass}>Hold reason *</label>
            <select
              value={draft.holdReason}
              onChange={(e) => set("holdReason", e.target.value)}
              className={`${fieldClass} cursor-pointer`}
            >
              <option value="">Select a reason</option>
              {HOLD_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className={labelClass}>New visit date *</label>
              <input
                type="date"
                min={todayIso}
                value={draft.newVisitDate}
                onChange={(e) => set("newVisitDate", e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="min-w-0">
              <label className={labelClass}>New visit time *</label>
              <input
                type="time"
                value={draft.newVisitTime}
                onChange={(e) => set("newVisitTime", e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
        </>
      )}

      <div>
        <label className={labelClass}>Remarks *</label>
        <textarea
          value={draft.remarks}
          onChange={(e) => set("remarks", e.target.value)}
          placeholder="What did you do on site?"
          className={`${fieldClass} resize-none h-24`}
        />
      </div>
    </div>
  );
}
