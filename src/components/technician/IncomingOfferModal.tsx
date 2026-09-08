"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { acceptJobOfferAction, rejectJobOfferAction, type TechnicianJobOffer } from "@/actions/servicecall.actions";

interface Props {
  offer: TechnicianJobOffer;
  onResolved: () => void;
}

export function IncomingOfferModal({ offer, onResolved }: Props) {
  const [mounted, setMounted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(offer.expiresInSeconds);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setSecondsLeft(offer.expiresInSeconds);
  }, [offer.id, offer.expiresInSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const respond = async (action: "accept" | "reject") => {
    setIsResponding(true);
    try {
      const res = action === "accept" ? await acceptJobOfferAction(offer.id) : await rejectJobOfferAction(offer.id);
      if (!res.success) {
        toast.error(res.error || "Something went wrong");
        onResolved();
        return;
      }
      toast.success(action === "accept" ? "Job accepted!" : "Job declined");
      onResolved();
    } finally {
      setIsResponding(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-[#0F172A] w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center gap-1 mb-5">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 animate-pulse">
            <ClientIcon icon="ph:bell-ringing-fill" className="w-7 h-7" />
          </div>
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">New Job Offer</p>
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
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{offer.distanceKm.toFixed(1)} km away</span>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
          <div
            className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
            style={{ width: `${Math.min(100, (secondsLeft / Math.max(offer.expiresInSeconds, 1)) * 100)}%` }}
          />
        </div>
        <p className="text-center text-xs text-slate-400 mb-5">Expires in {secondsLeft}s</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => respond("reject")}
            disabled={isResponding}
            className="h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm disabled:opacity-50 cursor-pointer"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => respond("accept")}
            disabled={isResponding}
            className="h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isResponding ? "..." : "Accept"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
