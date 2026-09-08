"use client";

import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { CheckoutStep } from "./checkoutTypes";

const STEPS: { key: Exclude<CheckoutStep, "success">; label: string; icon: string }[] = [
  { key: "cart", label: "Cart & Discount", icon: "ph:shopping-cart-bold" },
  { key: "details", label: "Your Details", icon: "ph:user-bold" },
  { key: "slot", label: "Slot", icon: "ph:calendar-blank-bold" },
  { key: "payment", label: "Payment", icon: "ph:qr-code-bold" },
];

export function CheckoutStepper({ current }: { current: CheckoutStep }) {
  const currentIndex = current === "success" ? STEPS.length : STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-start w-full max-w-2xl">
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isActive = idx === currentIndex;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isDone
                    ? "bg-slate-900 border-slate-900 dark:bg-white dark:border-white text-white dark:text-slate-900"
                    : isActive
                    ? "border-slate-900 dark:border-white text-slate-900 dark:text-white bg-white dark:bg-[#0B1221]"
                    : "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 bg-white dark:bg-[#0B1221]"
                }`}
              >
                {isDone ? (
                  <ClientIcon icon="ph:check-bold" className="w-4 h-4" />
                ) : (
                  <ClientIcon icon={step.icon} className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-bold text-center whitespace-nowrap ${
                  isActive || isDone ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-600"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 sm:mx-3 mt-4 sm:mt-5 rounded-full transition-all ${
                  idx < currentIndex ? "bg-slate-900 dark:bg-white" : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
