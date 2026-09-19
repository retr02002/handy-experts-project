"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { startJobAction, completeJobAction } from "@/actions/servicejob.actions";
import type { ReportDraft } from "./CompletionReportForm";
import { emptyReportDraft, draftToInput } from "./CompletionReportForm";
import { GeofenceGate } from "./GeofenceGate";
import type { ServiceCallSummary } from "@/actions/servicecall.actions";
import type { GeoFix } from "@/lib/geo";
import { GEOFENCE_POSITION_REQUIRED } from "@/lib/constants";
import dynamic from "next/dynamic";

const CompletionReportForm = dynamic(() => import("./CompletionReportForm").then((m) => m.CompletionReportForm), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />,
});

const JobPhotoUploader = dynamic(() => import("./JobPhotoUploader").then((m) => m.JobPhotoUploader), {
  ssr: false,
  loading: () => <div className="h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />,
});

const SignaturePad = dynamic(() => import("./SignaturePad").then((m) => m.SignaturePad), {
  ssr: false,
  loading: () => <div className="h-40 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />,
});

interface Props {
  call: ServiceCallSummary;
  gate: "start" | "complete";
  onClose: () => void;
  onDone: () => void;
}

class TimeoutError extends Error {}

/**
 * Guarantees this dialog can never sit on "Verifying..." forever, no matter
 * what's slow upstream (a stalled mobile connection, DB contention, a cold
 * server instance) — races the actual request against a hard ceiling and
 * surfaces a clear, retryable error if nothing comes back in time. The
 * in-flight request itself isn't cancelled (Server Actions don't expose an
 * AbortSignal), it just stops blocking the UI; every action this wraps is
 * safe to retry (PIN re-verification, conditional claim checks).
 */
const ACTION_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError("Action timed out")), ACTION_TIMEOUT_MS);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/**
 * The customer reads their fixed 4-digit PIN out loud; the technician types
 * it here. Verification is entirely server-side — the PIN is never sent to
 * this device, so there's nothing to read out of the client bundle.
 */
export function JobPinDialog({ call, gate, onClose, onDone }: Props) {
  const [isPending, startTransition] = React.useTransition();
  const [pin, setPin] = useState("");
  const [draft, setDraft] = useState<ReportDraft>(emptyReportDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fix, setFix] = useState<GeoFix | null>(null);

  // Only the raw fix is kept — the evaluated result is already rendered by
  // GeofenceGate itself, and the server re-evaluates authoritatively.
  const handleGeoChange = React.useCallback((nextFix: GeoFix | null) => {
    setFix(nextFix);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pin.length !== 4) {
      setError("Enter the customer's 4-digit PIN.");
      return;
    }

    setIsSubmitting(true);
    startTransition(async () => {
      try {
        if (gate === "start") {
          const res = await withTimeout(startJobAction(call.id, pin, fix));
          if (!res.success) {
            setError(
              res.error === GEOFENCE_POSITION_REQUIRED
                ? "We couldn't confirm where you are. Turn location on and try again."
                : res.error || "Couldn't start the job"
            );
            return;
          }
          toast.success("Job started");
        } else {
          const input = draftToInput(draft);
          if (!input.ok) {
            setError(input.error);
            return;
          }
          const res = await withTimeout(completeJobAction(call.id, pin, input.value, fix));
          if (!res.success) {
            setError(
              res.error === GEOFENCE_POSITION_REQUIRED
                ? "We couldn't confirm where you are. Turn location on and try again."
                : res.error || "Couldn't complete the job"
            );
            return;
          }
          toast.success("Job completed and report submitted");
        }
        onDone();
      } catch (err) {
        // Two things land here: (1) the request itself failing (a dropped
        // mobile connection) — the action never throws on its own, it
        // always resolves with {success:false} for server-side errors; (2)
        // the withTimeout race above firing because nothing came back at
        // all. Either way, this used to go unhandled and leave the button
        // stuck showing "Verifying..." forever with no way to retry.
        console.error("Job PIN submit error:", err);
        setError(
          err instanceof TimeoutError
            ? "This is taking longer than expected — check your connection and try again."
            : "Network error — please check your connection and try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  // This component is only mounted on the client after a user click,
  // so we can safely check for document without causing hydration mismatches.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center sm:p-6 bg-slate-900/70 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white dark:bg-[#0F172A] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92dvh] overflow-hidden"
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
          <GeofenceGate
            customerLat={call.latitude}
            customerLng={call.longitude}
            bypass={call.geofenceBypass}
            action={gate}
            onChange={handleGeoChange}
          />

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

          {/* Photos upload immediately and independently of this form, so
              anything already sent survives a failed PIN entry or a dropped
              connection at submit time. */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <JobPhotoUploader serviceCallId={call.id} phase={gate === "start" ? "BEFORE" : "AFTER"} />
          </div>

          {gate === "complete" && (
            <>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <SignaturePad serviceCallId={call.id} defaultSignerName={call.siteContactName || call.customerName} />
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <CompletionReportForm draft={draft} onChange={setDraft} />
              </div>
            </>
          )}

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
            disabled={isSubmitting || isPending}
            className="flex-1 h-11 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          {/* Deliberately NOT disabled when out of range. Whether the fence
              actually blocks is a server-side flag (GEOFENCE_ENFORCED) that
              a client bundle can't read, and mirroring it into a second
              NEXT_PUBLIC_ var would be two things to keep in sync. So the
              server stays the single authority: the gate card above warns
              prominently, and if enforcement is on the action returns the
              exact distance sentence. During the warn-only rollout this is
              also what keeps the fence genuinely non-blocking. */}
          <button
            type="submit"
            disabled={isSubmitting || isPending}
            className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-bold transition-colors cursor-pointer"
          >
            {isSubmitting || isPending ? "Verifying..." : gate === "start" ? "Verify & Start" : "Verify & Complete"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
