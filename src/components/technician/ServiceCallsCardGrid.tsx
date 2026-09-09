"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { updateServiceCallStatusAction, type ServiceCallSummary } from "@/actions/servicecall.actions";
import { NEXT_STEP, JOB_STATUS_COLORS, jobStatusLabel } from "@/lib/jobStatus";
import { canStartTravel } from "@/lib/jobSchedule";
import { ClientIcon } from "@/components/ui/ClientIcon";

function Card({ call, onUpdated, onView }: { call: ServiceCallSummary; onUpdated: () => void; onView: (c: ServiceCallSummary) => void }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const step = NEXT_STEP[call.status];
  // Same rule the server enforces: a scheduled job can't be set off days early.
  const travelLocked = call.status === "ASSIGNED" && !canStartTravel(call.scheduledFor);

  const handleAdvance = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!step) return;
    // Start/complete need the customer's PIN — hand off to the job panel
    // rather than trying to advance straight from a list row.
    if (step.gated) {
      onView(call);
      return;
    }
    setIsUpdating(true);
    try {
      const res = await updateServiceCallStatusAction(call.id, step.next);
      if (!res.success) {
        toast.error(res.error || "Failed to update status");
        return;
      }
      toast.success(`Marked as ${jobStatusLabel(step.next)}`);
      onUpdated();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    // A div rather than a button: this card contains its own action button,
    // and a button inside a button is invalid HTML (React throws a hydration
    // error). role/tabIndex/onKeyDown keep it keyboard-operable.
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(call)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(call);
        }
      }}
      className="text-left flex flex-col gap-2 p-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B4FF] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{call.itemSummary}</h3>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${JOB_STATUS_COLORS[call.status] ?? ""}`}>
          {jobStatusLabel(call.status)}
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
            type="button"
            onClick={handleAdvance}
            disabled={isUpdating || travelLocked}
            className="h-8 px-3 rounded-lg bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer"
          >
            {isUpdating ? "..." : travelLocked ? "Not yet" : step.label}
          </button>
        )}
      </div>
    </div>
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
