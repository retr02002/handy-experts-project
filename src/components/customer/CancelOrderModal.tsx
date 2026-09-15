"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/shared/Modal";
import { cancelMyOrderAction } from "@/actions/livecall.actions";

const QUICK_REASONS = [
  "Taking too long — no one has accepted yet",
  "Booked by mistake",
  "Found another provider",
  "Changed my mind",
  "Other",
];

export function CancelOrderModal({
  orderId,
  onClose,
  onCancelled,
}: {
  orderId: string;
  onClose: () => void;
  onCancelled: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOther = selected === "Other";
  const reason = isOther ? detail.trim() : (selected ?? "");
  const canSubmit = isOther ? reason.length >= 3 : !!selected;

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const res = await cancelMyOrderAction({ liveCallId: orderId, reason });
      if (!res.success) {
        toast.error(res.error || "Couldn't cancel your order. Please try again.");
        return;
      }
      toast.success("Order cancelled");
      onCancelled();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Cancel this order?"
      onClose={onClose}
      footer={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold cursor-pointer"
          >
            Keep Order
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || isSubmitting}
            className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold cursor-pointer transition-colors"
          >
            {isSubmitting ? "Cancelling..." : "Cancel Order"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tell us why you&apos;re cancelling — if you paid online, this starts your refund.
        </p>

        <div className="flex flex-col gap-2">
          {QUICK_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelected(r)}
              className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                selected === r
                  ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {isOther && (
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="What went wrong?"
            rows={3}
            maxLength={300}
            className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 resize-none"
          />
        )}
      </div>
    </Modal>
  );
}
