import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function TechnicianServiceCallsPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Service Calls</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your assigned service calls and tasks.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <ClientIcon icon="ph:funnel" className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm">
        <div className="flex items-center justify-center py-10 md:py-16 text-slate-500">
          <div className="flex flex-col items-center gap-2 md:gap-3">
            <ClientIcon icon="ph:wrench" className="w-10 h-10 md:w-12 md:h-12 text-slate-300 dark:text-slate-700" />
            <p className="text-sm">No active service calls assigned yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
