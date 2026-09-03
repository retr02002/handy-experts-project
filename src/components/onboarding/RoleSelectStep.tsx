"use client";

import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export type OnboardingRole = "CUSTOMER" | "VENDOR" | "TECHNICIAN";

const ROLE_OPTIONS: { role: OnboardingRole; icon: string; title: string; description: string; accent: string }[] = [
  {
    role: "VENDOR",
    icon: "ph:buildings-fill",
    title: "Company / Vendor",
    description: "Register your company & manage technicians",
    accent: "from-indigo-500 to-purple-600",
  },
  {
    role: "TECHNICIAN",
    icon: "ph:wrench-fill",
    title: "Technician",
    description: "Work independently & accept nearby jobs",
    accent: "from-amber-500 to-orange-600",
  },
];

export function RoleSelectStep({ onSelect }: { onSelect: (role: OnboardingRole) => void }) {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col justify-center px-5 sm:px-8 lg:px-9 py-6 sm:py-8 lg:py-9">
      <div className="mb-6 text-center">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
          How will you use Handyzo?
        </h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
          Pick one to set up your account.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {ROLE_OPTIONS.map((opt) => (
          <button
            key={opt.role}
            type="button"
            onClick={() => onSelect(opt.role)}
            className="group flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 active:scale-[0.98] hover:border-transparent hover:shadow-lg bg-white dark:bg-slate-900/40 transition-all text-left cursor-pointer"
          >
            <div
              className={`w-11 h-11 shrink-0 rounded-full bg-gradient-to-br ${opt.accent} flex items-center justify-center text-white shadow-md`}
            >
              <ClientIcon icon={opt.icon} className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{opt.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{opt.description}</p>
            </div>
            <ClientIcon
              icon="ph:caret-right-bold"
              className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[#00B4FF] group-hover:translate-x-1 transition-all shrink-0"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
