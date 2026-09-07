"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { AdminLiveCall } from "@/actions/livecall.actions";

const STATUS_COLORS: Record<string, string> = {
  BROADCASTING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  ACCEPTED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  CONVERTED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  EXPIRED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const PAYMENT_MODE_LABELS: Record<string, string> = {
  gpay: "Google Pay",
  phonepe: "PhonePe",
  paytm: "Paytm",
  amazonpay: "Amazon Pay",
  bhim: "BHIM UPI",
  "other-upi": "Other UPI",
};

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function AdminLiveCallCard({ call }: { call: AdminLiveCall }) {
  const [expanded, setExpanded] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between gap-2">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[call.status] ?? ""}`}>{call.status}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white">₹{call.total}</span>
          <span className="text-xs text-slate-400">{timeAgo(call.createdAt)}</span>
        </div>
      </div>

      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{call.customerName} &middot; {call.siteContactPhone || call.customerPhone}</p>
      <p className="text-xs text-slate-500">{call.city}, {call.pincode}</p>
      {call.acceptedByVendorName && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Accepted by {call.acceptedByVendorName}</p>
      )}

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-xs font-bold text-[#00B4FF] hover:text-blue-600 cursor-pointer self-start"
      >
        {expanded ? "Hide details" : "View full details"}
        <ClientIcon icon={expanded ? "ph:caret-up-bold" : "ph:caret-down-bold"} className="w-3 h-3" />
      </button>

      {expanded && (
        <div className="flex flex-col gap-2.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-3 mt-0.5">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <ClientIcon icon="ph:envelope-simple" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {call.customerEmail}
          </div>
          <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400">
            <ClientIcon icon="ph:map-pin-line" className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>{call.address}, {call.city}, {call.state} {call.pincode}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 flex flex-col gap-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Items</p>
            {call.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>{item.packageName} {item.quantity > 1 ? `x${item.quantity}` : ""}</span>
                <span className="font-medium">₹{(item.unitPrice * item.quantity).toFixed(0)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-slate-500 pt-1.5 border-t border-slate-200 dark:border-slate-700">
              <span>Subtotal</span>
              <span>₹{call.subtotal.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>GST</span>
              <span>₹{call.tax.toFixed(0)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <ClientIcon icon="ph:device-mobile-camera" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {PAYMENT_MODE_LABELS[call.paymentMode] ?? call.paymentMode} &middot; {call.upiRef}
            </div>
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="text-[#00B4FF] font-bold underline underline-offset-2 cursor-pointer"
            >
              View screenshot
            </button>
          </div>
        </div>
      )}

      {zoomOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
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
    </div>
  );
}
