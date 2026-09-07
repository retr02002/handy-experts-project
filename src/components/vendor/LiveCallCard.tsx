"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { NearbyLiveCall } from "@/actions/livecall.actions";

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

const PAYMENT_MODE_LABELS: Record<string, string> = {
  gpay: "Google Pay",
  phonepe: "PhonePe",
  paytm: "Paytm",
  amazonpay: "Amazon Pay",
  bhim: "BHIM UPI",
  "other-upi": "Other UPI",
};

interface LiveCallCardProps {
  call: NearbyLiveCall;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onAccept?: (call: NearbyLiveCall) => void;
}

export function LiveCallCard({ call, isSelected, onSelect, onAccept }: LiveCallCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const itemSummary = call.items.map((i) => `${i.packageName}${i.quantity > 1 ? ` x${i.quantity}` : ""}`).join(", ");

  return (
    <div
      onClick={() => onSelect?.(call.id)}
      className={`w-full text-left flex flex-col gap-2 p-4 bg-white dark:bg-slate-900 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? "border-[#00B4FF] ring-2 ring-[#00B4FF]/20"
          : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          {call.distanceKm.toFixed(1)} km away
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(call.createdAt)}</span>
      </div>

      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{itemSummary}</h3>

      <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <ClientIcon icon="ph:user" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {call.customerName} &middot; {call.siteContactPhone || call.customerPhone}
        </div>
        <div className="flex items-start gap-1.5">
          <ClientIcon icon="ph:map-pin" className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="truncate">
            {call.city}, {call.pincode}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
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
              onClick={(e) => {
                e.stopPropagation();
                setZoomOpen(true);
              }}
              className="text-[#00B4FF] font-bold underline underline-offset-2 cursor-pointer"
            >
              View screenshot
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs text-slate-400">Order total</span>
        <span className="text-sm font-bold text-slate-900 dark:text-white">₹{call.total}</span>
      </div>

      {onAccept && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAccept(call);
          }}
          className="w-full h-9 rounded-lg bg-[#00B4FF] hover:bg-[#0096fa] text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Accept
        </button>
      )}

      {zoomOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
          onClick={(e) => {
            e.stopPropagation();
            setZoomOpen(false);
          }}
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
