"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { toast } from "sonner";
import { updateServiceCallStatusAction, type ServiceCallSummary, type ServiceCallStatusValue } from "@/actions/servicecall.actions";
import { ClientIcon } from "@/components/ui/ClientIcon";

const PAYMENT_MODE_LABELS: Record<string, string> = {
  gpay: "Google Pay",
  phonepe: "PhonePe",
  paytm: "Paytm",
  amazonpay: "Amazon Pay",
  bhim: "BHIM UPI",
  "other-upi": "Other UPI",
};

const NEXT_STATUS: Partial<Record<string, { label: string; next: ServiceCallStatusValue }>> = {
  ASSIGNED: { label: "Start", next: "EN_ROUTE" },
  EN_ROUTE: { label: "Begin Job", next: "IN_PROGRESS" },
  IN_PROGRESS: { label: "Complete", next: "COMPLETED" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

interface ServiceCallDetailModalProps {
  call: ServiceCallSummary;
  onClose: () => void;
  onChanged: () => void;
}

export function ServiceCallDetailModal({ call, onClose, onChanged }: ServiceCallDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const step = NEXT_STATUS[call.status];

  const handleAdvance = async () => {
    if (!step) return;
    setIsUpdating(true);
    try {
      const res = await updateServiceCallStatusAction(call.id, step.next);
      if (!res.success) {
        toast.error(res.error || "Failed to update status");
        return;
      }
      toast.success(`Marked as ${step.next.replace("_", " ").toLowerCase()}`);
      onChanged();
    } finally {
      setIsUpdating(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#0F172A] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white pr-8">{call.itemSummary}</h3>

        <div className="flex flex-col gap-3 mt-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
              <p className="font-semibold text-slate-900 dark:text-white">{call.customerName}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
              <p className="font-semibold text-slate-900 dark:text-white">{call.customerPhone}</p>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{call.customerEmail}</p>
          </div>
          {call.siteContactPhone && (
            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3">
              <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Site Contact</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {call.siteContactName || "—"} &middot; {call.siteContactPhone}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Call this number when you arrive — it may differ from the customer above.
              </p>
            </div>
          )}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Address</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{call.address}, {call.city}, {call.state} {call.pincode}</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 flex flex-col gap-1.5 text-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Items</p>
            {call.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>{item.packageName} {item.quantity > 1 ? `x${item.quantity}` : ""}</span>
                <span className="font-medium">₹{(item.unitPrice * item.quantity).toFixed(0)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-slate-500 pt-1.5 border-t border-slate-200 dark:border-slate-700 text-xs">
              <span>Subtotal</span><span>₹{call.subtotal.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>GST</span><span>₹{call.tax.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pt-1">
              <span>Total</span><span>₹{call.total.toFixed(0)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <ClientIcon icon="ph:device-mobile-camera" className="w-4 h-4 text-slate-400 shrink-0" />
              {PAYMENT_MODE_LABELS[call.paymentMode] ?? call.paymentMode} &middot; {call.upiRef}
            </div>
            {call.paymentScreenshotUrl && (
              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                className="text-[#00B4FF] font-bold underline underline-offset-2 cursor-pointer text-xs"
              >
                View screenshot
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div><p className="font-bold uppercase tracking-wider mb-0.5">Assigned</p><p>{formatDate(call.assignedAt)}</p></div>
            <div><p className="font-bold uppercase tracking-wider mb-0.5">Started</p><p>{formatDate(call.startedAt)}</p></div>
            <div><p className="font-bold uppercase tracking-wider mb-0.5">Completed</p><p>{formatDate(call.completedAt)}</p></div>
          </div>
        </div>

        {step && (
          <button
            onClick={handleAdvance}
            disabled={isUpdating}
            className="w-full h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-60 text-white text-sm font-bold mt-5 cursor-pointer"
          >
            {isUpdating ? "Updating..." : step.label}
          </button>
        )}
      </div>

      {zoomOpen && call.paymentScreenshotUrl && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
          onClick={() => setZoomOpen(false)}
        >
          <div className="relative bg-white rounded-2xl p-4 max-w-xs w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setZoomOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg cursor-pointer"
            >
              <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
            </button>
            <div className="relative w-full aspect-square">
              <Image src={call.paymentScreenshotUrl} alt="Payment screenshot" fill className="object-contain rounded-lg" unoptimized />
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
