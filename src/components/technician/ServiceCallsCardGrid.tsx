"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { updateServiceCallStatusAction, type ServiceCallSummary, type ServiceCallStatusValue } from "@/actions/servicecall.actions";
import { ClientIcon } from "@/components/ui/ClientIcon";

const statusColors: Record<string, string> = {
  ASSIGNED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  EN_ROUTE: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  IN_PROGRESS: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const NEXT_STATUS: Partial<Record<string, { label: string; next: ServiceCallStatusValue }>> = {
  ASSIGNED: { label: "Start", next: "EN_ROUTE" },
  EN_ROUTE: { label: "Begin Job", next: "IN_PROGRESS" },
  IN_PROGRESS: { label: "Complete", next: "COMPLETED" },
};

function Card({ call, onUpdated, onView }: { call: ServiceCallSummary; onUpdated: () => void; onView: (c: ServiceCallSummary) => void }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const step = NEXT_STATUS[call.status];

  const handleAdvance = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!step) return;
    setIsUpdating(true);
    try {
      const res = await updateServiceCallStatusAction(call.id, step.next);
      if (!res.success) {
        toast.error(res.error || "Failed to update status");
        return;
      }
      toast.success(`Marked as ${step.next.replace("_", " ").toLowerCase()}`);
      onUpdated();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={() => onView(call)}
      className="text-left flex flex-col gap-2 p-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{call.itemSummary}</h3>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusColors[call.status] ?? ""}`}>
          {call.status.replace("_", " ").toLowerCase()}
        </span>
      </div>
      <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <ClientIcon icon="ph:user" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {call.customerName} &middot; {call.siteContactPhone || call.customerPhone}
        </div>
        <div className="flex items-start gap-1.5">
          <ClientIcon icon="ph:map-pin" className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="truncate">{call.address}, {call.city}</span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-sm font-bold text-slate-900 dark:text-white">₹{call.total.toFixed(0)}</span>
        {step && (
          <button
            onClick={handleAdvance}
            disabled={isUpdating}
            className="h-8 px-3 rounded-lg bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-60 text-white text-xs font-bold cursor-pointer"
          >
            {isUpdating ? "..." : step.label}
          </button>
        )}
      </div>
    </button>
  );
}

export function ServiceCallsCardGrid({
  data,
  onUpdated,
  onView,
}: {
  data: ServiceCallSummary[];
  onUpdated: () => void;
  onView: (call: ServiceCallSummary) => void;
}) {
  if (data.length === 0) {
    return (
      <div className="p-10 text-center bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl">
        <p className="text-sm text-slate-400">No assigned calls match your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {data.map((call) => (
        <Card key={call.id} call={call} onUpdated={onUpdated} onView={onView} />
      ))}
    </div>
  );
}
