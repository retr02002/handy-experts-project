"use client";

import React from "react";
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

interface LiveCallCardProps {
  call: NearbyLiveCall;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onAccept?: (call: NearbyLiveCall) => void;
}

export function LiveCallCard({ call, isSelected, onSelect, onAccept }: LiveCallCardProps) {
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
          {call.customerName}
        </div>
        <div className="flex items-start gap-1.5">
          <ClientIcon icon="ph:map-pin" className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="truncate">
            {call.city}, {call.pincode}
          </span>
        </div>
      </div>

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
    </div>
  );
}
