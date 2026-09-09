"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { startJobAction, completeJobAction } from "@/actions/servicejob.actions";
import { CompletionReportForm, type ReportDraft, emptyReportDraft, draftToInput } from "./CompletionReportForm";
import type { ServiceCallSummary } from "@/actions/servicecall.actions";

interface Props {
  call: ServiceCallSummary;
  gate: "start" | "complete";
  onClose: () => void;
  onDone: () => void;
}

/**
 * The customer reads their fixed 4-digit PIN out loud; the technician types
 * it here. Verification is entirely server-side — the PIN is never sent to
 * this device, so there's nothing to read out of the client bundle.
 */
export function JobPinDialog({ call, gate, onClose, onDone }: Props) {
  const [mounted, setMounted] = useState(false);
  const [pin, setPin] = useState("");
  const [draft, setDraft] = useState<ReportDraft>(emptyReportDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pin.length !== 4) {
      setError("Enter the customer's 4-digit PIN.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (gate === "start") {
        const res = await startJobAction(call.id, pin);
        if (!res.success) {
          setError(res.error || "Couldn't start the job");
          return;
        }
        toast.success("Job started");
      } else {
        const input = draftToInput(draft);
        if (!input.ok) {
          setError(input.error);
          return;
        }
        const res = await completeJobAction(call.id, pin, input.value);
        if (!res.success) {
          setError(res.error || "Couldn't complete the job");
          return;
        }
        toast.success("Job completed and report submitted");
      }
      onDone();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center sm:p-6 bg-slate-900/70 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white dark:bg-[#0F172A] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between gap-3">
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full absolute left-1/2 -translate-x-1/2 top-2 sm:hidden" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {gate === "start" ? "Start this job" : "Complete this job"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full transition-colors shrink-0"
          >
            <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
          <div>
            <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Customer&apos;s service PIN
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
              Ask {call.siteContactName || call.customerName} for their 4-digit PIN — it&apos;s on their order screen.
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              className="w-full text-center text-2xl font-black tracking-[0.5em] bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all"
            />
            {call.pinAttempts > 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5">
                {call.pinAttempts} failed attempt{call.pinAttempts === 1 ? "" : "s"} so far.
              </p>
            )}
          </div>

          {gate === "complete" && <CompletionReportForm draft={draft} onChange={setDraft} />}

          {error && (
            <p className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 h-11 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-bold transition-colors cursor-pointer"
          >
            {isSubmitting ? "Verifying..." : gate === "start" ? "Verify & Start" : "Verify & Complete"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
