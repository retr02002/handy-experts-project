"use client";

import React from "react";
import type { VendorTechnician } from "@/actions/technician.actions";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function TechniciansCardGrid({ data, onView }: { data: VendorTechnician[]; onView: (tech: VendorTechnician) => void }) {
  if (data.length === 0) {
    return (
      <div className="p-10 text-center bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl">
        <p className="text-sm text-slate-400">No technicians match your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {data.map((tech) => (
        <button
          key={tech.id}
          onClick={() => onView(tech)}
          className="text-left flex flex-col gap-3 p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                {tech.name.charAt(0).toUpperCase() || "T"}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{tech.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tech.email}</p>
              </div>
            </div>
            <span
              className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                tech.isOnDuty
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              <ClientIcon icon="ph:circle-fill" className="w-1.5 h-1.5" />
              {tech.isOnDuty ? "On Duty" : "Off Duty"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center gap-1.5">
              <ClientIcon icon="ph:wrench" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {tech.skillCategory}
            </div>
            <div className="flex items-center gap-1.5">
              <ClientIcon icon="ph:briefcase" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {tech.experienceYears} yrs exp
            </div>
            <div className="flex items-center gap-1.5">
              <ClientIcon icon="ph:phone" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {tech.phone}
            </div>
            <div className="flex items-center gap-1.5">
              <ClientIcon icon="ph:map-pin" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {tech.servicePincode}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Added {new Date(tech.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="text-xs font-bold text-[#00B4FF]">Manage →</span>
          </div>
        </button>
      ))}
    </div>
  );
}
