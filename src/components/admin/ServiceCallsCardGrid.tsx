"use client";

import React from "react";
import type { AdminServiceCallSummary } from "@/actions/servicecall.actions";
import { ClientIcon } from "@/components/ui/ClientIcon";

const statusColors: Record<string, string> = {
  ASSIGNED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  EN_ROUTE: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  IN_PROGRESS: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function ServiceCallsCardGrid({ data }: { data: AdminServiceCallSummary[] }) {
  if (data.length === 0) {
    return (
      <div className="p-10 text-center bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl">
        <p className="text-sm text-slate-400">No service calls yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {data.map((call) => (
        <div
          key={call.id}
          className="flex flex-col gap-3 p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{call.itemSummary}</h3>
            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusColors[call.status] ?? ""}`}>
              {call.status.replace("_", " ").toLowerCase()}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <ClientIcon icon="ph:user" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {call.customerName} &middot; {call.siteContactPhone || call.customerPhone}
            </div>
            <div className="flex items-center gap-1.5">
              <ClientIcon icon="ph:map-pin" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {call.city}, {call.pincode}
            </div>
            <div className="flex items-center gap-1.5">
              <ClientIcon icon="ph:buildings" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {call.vendorName}
            </div>
            <div className="flex items-center gap-1.5">
              <ClientIcon icon="ph:wrench" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {call.technicianName}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">
              {new Date(call.assignedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">₹{call.total.toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
