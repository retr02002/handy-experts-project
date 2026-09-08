"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { acceptLiveCallAction } from "@/actions/servicecall.actions";
import type { NearbyLiveCall } from "@/actions/livecall.actions";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface AcceptCallModalProps {
  call: NearbyLiveCall;
  onClose: () => void;
  onAccepted: () => void;
}

export function AcceptCallModal({ call, onClose, onAccepted }: AcceptCallModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemSummary = call.items.map((i) => `${i.packageName}${i.quantity > 1 ? ` x${i.quantity}` : ""}`).join(", ");

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      const res = await acceptLiveCallAction(call.id);
      if (!res.success) {
        toast.error(res.error || "Failed to accept this call");
        return;
      }
      toast.success(
        res.data?.offerCount
          ? `Notified ${res.data.offerCount} nearby technician${res.data.offerCount > 1 ? "s" : ""}`
          : "Call accepted"
      );
      onAccepted();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
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

        <div className="w-12 h-12 rounded-full bg-[#00B4FF]/10 text-[#00B4FF] flex items-center justify-center mb-3">
          <ClientIcon icon="ph:broadcast-bold" className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white pr-8">Accept this call?</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          We&apos;ll notify every on-duty technician of yours whose service area covers this location. Whoever accepts
          first gets the job.
        </p>

        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 mt-4 mb-5 border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{itemSummary}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {call.customerName} &middot; {call.city}, {call.pincode} &middot; ₹{call.total}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAccept}
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-50 text-white text-sm font-bold transition-colors cursor-pointer"
        >
          {isSubmitting ? "Notifying technicians..." : "Notify Nearby Technicians"}
        </button>
      </div>
    </div>,
    document.body
  );
}
