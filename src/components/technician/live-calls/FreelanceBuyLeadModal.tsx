"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { buyLiveCallAsFreelancerAction } from "@/actions/servicecall.actions";
import type { NearbyLiveCall } from "@/actions/livecall.actions";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { PurchasedLiveCallDetail } from "@/actions/servicecall.actions";

interface FreelanceBuyCallModalProps {
  call: NearbyLiveCall;
  onClose: () => void;
  onBought: () => void;
}

export function FreelanceBuyCallModal({ call, onClose, onBought }: FreelanceBuyCallModalProps) {
  const [isPending, startTransition] = React.useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchased, setPurchased] = useState<PurchasedLiveCallDetail | null>(null);

  const itemSummary = call.items.map((i) => `${i.packageName}${i.quantity > 1 ? ` x${i.quantity}` : ""}`).join(", ");

  const handleBuy = () => {
    setIsSubmitting(true);
    startTransition(async () => {
      try {
        const res = await buyLiveCallAsFreelancerAction(call.id);
        if (!res.success || !res.data) {
          toast.error((res.success ? undefined : res.error) || "Failed to accept this call");
          return;
        }
        setPurchased(res.data.liveCall);
        toast.success("Call assigned to you!");
        onBought();
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#0F172A] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
        </button>

        {!purchased ? (
          <>
            <div className="w-12 h-12 rounded-full bg-[#00B4FF]/10 text-[#00B4FF] flex items-center justify-center mb-3">
              <ClientIcon icon="ph:lock-key-open-bold" className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white pr-8">Accept this job?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ₹{call.leadPrice} will be deducted from your wallet. You&apos;ll be assigned to this job instantly and can see the customer&apos;s full name, phone, and address.
            </p>

            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 mt-4 mb-5 border border-slate-200 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{itemSummary}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {call.customerFirstName} &middot; {call.city}, {call.pincode} &middot; ₹{call.total}
              </p>
            </div>

            <button
              type="button"
              onClick={handleBuy}
              disabled={isSubmitting || isPending}
              className="w-full h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-50 text-white text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting || isPending ? "Accepting..." : `Accept & Pay ₹${call.leadPrice}`}
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
              <ClientIcon icon="ph:check-circle-bold" className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white pr-8">Job assigned to you</h3>
            <div className="flex flex-col gap-2 mt-3 text-sm text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-2">
                <ClientIcon icon="ph:user-fill" className="w-4 h-4 text-slate-400 shrink-0" />
                {purchased.customerName} &middot; {purchased.siteContactPhone || purchased.customerPhone}
              </div>
              <div className="flex items-start gap-2">
                <ClientIcon icon="ph:map-pin-fill" className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {purchased.address}, {purchased.city}, {purchased.state} {purchased.pincode}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Find this job with its full details any time under Service Calls.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 mt-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold cursor-pointer"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
