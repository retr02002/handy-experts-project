"use client";

import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { OrderDisplayStatus } from "@/actions/livecall.actions";

const HAPPY_PATH: { key: OrderDisplayStatus; label: string; icon: string }[] = [
  { key: "FINDING_PROFESSIONAL", label: "Booking Confirmed", icon: "ph:check-circle-bold" },
  { key: "ASSIGNED", label: "Technician Assigned", icon: "ph:user-circle-bold" },
  { key: "EN_ROUTE", label: "On the Way", icon: "ph:car-bold" },
  { key: "IN_PROGRESS", label: "Service in Progress", icon: "ph:wrench-bold" },
  { key: "COMPLETED", label: "Completed", icon: "ph:confetti-bold" },
];

export function OrderProgressStepper({ status }: { status: OrderDisplayStatus }) {
  if (status === "CANCELLED" || status === "EXPIRED") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <div className="w-9 h-9 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
          <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {status === "CANCELLED" ? "This order was cancelled" : "This order expired before a vendor accepted it"}
        </p>
      </div>
    );
  }

  const currentIndex = HAPPY_PATH.findIndex((s) => s.key === status);

  return (
    <div className="flex flex-col">
      {HAPPY_PATH.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isActive = idx === currentIndex;
        const isLast = idx === HAPPY_PATH.length - 1;
        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                  isDone
                    ? "bg-slate-900 border-slate-900 dark:bg-white dark:border-white text-white dark:text-slate-900"
                    : isActive
                    ? "border-[#00B4FF] text-[#00B4FF] bg-[#00B4FF]/5"
                    : "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 bg-white dark:bg-[#0B1221]"
                }`}
              >
                {isDone ? (
                  <ClientIcon icon="ph:check-bold" className="w-4 h-4" />
                ) : (
                  <ClientIcon icon={step.icon} className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
                )}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-8 my-1 rounded-full ${idx < currentIndex ? "bg-slate-900 dark:bg-white" : "bg-slate-200 dark:bg-slate-800"}`} />
              )}
            </div>
            <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
              <p className={`text-sm font-bold ${isActive || isDone ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-600"}`}>
                {step.label}
              </p>
              {isActive && (
                <p className="text-xs text-[#00B4FF] font-medium mt-0.5">In progress&hellip;</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
