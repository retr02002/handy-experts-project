"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { claimServiceCallAction, declineJobAction, type TechnicianJobOffer } from "@/actions/servicecall.actions";
import { DECLINE_REASONS } from "@/lib/jobStatus";

interface Props {
  offer: TechnicianJobOffer;
  onResolved: () => void;
  /** Lets the technician dismiss an open job without recording a decline. */
  onDismiss?: () => void;
}

export function IncomingOfferModal({ offer, onResolved, onDismiss }: Props) {
  const [mounted, setMounted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(offer.expiresInSeconds);
  const [isResponding, setIsResponding] = useState(false);
  const [decliningStep, setDecliningStep] = useState(false);
  const [reason, setReason] = useState<string>(DECLINE_REASONS[0]);
  const [otherReason, setOtherReason] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setSecondsLeft(offer.expiresInSeconds);
    setDecliningStep(false);
  }, [offer.serviceCallId, offer.expiresInSeconds]);

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => (s === null ? null : Math.max(0, s - 1))), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const accept = async () => {
    setIsResponding(true);
    try {
      const res = await claimServiceCallAction(offer.serviceCallId);
      if (!res.success) {
        toast.error(res.error || "Couldn't take this job");
        onResolved();
        return;
      }
      toast.success("Job accepted — it's yours");
      onResolved();
    } finally {
      setIsResponding(false);
    }
  };

  const decline = async () => {
    const finalReason = reason === "Other" ? otherReason.trim() : reason;
    if (finalReason.length < 3) {
      toast.error("Please say why you're declining.");
      return;
    }
    setIsResponding(true);
    try {
      const res = await declineJobAction(offer.serviceCallId, finalReason);
      if (!res.success) {
        toast.error(res.error || "Couldn't decline this job");
      } else {
        toast("Job declined");
      }
      onResolved();
    } finally {
      setIsResponding(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-[#0F172A] w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 mb-[104px] sm:mb-0">
        {decliningStep ? (
          <>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Why are you declining?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Your vendor sees this, so the job can be sent to someone else quickly.
            </p>
            <div className="flex flex-col gap-2 mb-4">
              {DECLINE_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`text-left px-3.5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    reason === r
                      ? "border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {r}
                </button>
              ))}
              {reason === "Other" && (
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Tell your vendor what's up"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white resize-none h-20 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecliningStep(false)}
                disabled={isResponding}
                className="h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm disabled:opacity-50 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={decline}
                disabled={isResponding}
                className="h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isResponding ? "..." : "Confirm Decline"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center text-center gap-1 mb-5">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 animate-pulse">
                <ClientIcon icon="ph:bell-ringing-fill" className="w-7 h-7" />
              </div>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                {offer.offerId ? "New Job Offer" : "Job Available Near You"}
              </p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{offer.itemSummary}</h3>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 flex flex-col gap-2.5 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Payout</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">₹{offer.total}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">Location</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white text-right">
                  {offer.city}, {offer.pincode}
                </span>
              </div>
              {offer.distanceKm !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Distance</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {offer.distanceKm.toFixed(1)} km away
                  </span>
                </div>
              )}
              {offer.scheduledFor && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Scheduled</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {new Date(offer.scheduledFor).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>

            {secondsLeft !== null && offer.expiresInSeconds !== null && (
              <>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${Math.min(100, (secondsLeft / Math.max(offer.expiresInSeconds, 1)) * 100)}%` }}
                  />
                </div>
                <p className="text-center text-xs text-slate-400 mb-5">
                  {secondsLeft > 0 ? `Ping expires in ${secondsLeft}s — the job stays open` : "Ping expired — job still open"}
                </p>
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecliningStep(true)}
                disabled={isResponding}
                className="h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm disabled:opacity-50 cursor-pointer"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={accept}
                disabled={isResponding}
                className="h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isResponding ? "..." : "Accept"}
              </button>
            </div>

            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                disabled={isResponding}
                className="w-full mt-3 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                Not now — remind me later
              </button>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
