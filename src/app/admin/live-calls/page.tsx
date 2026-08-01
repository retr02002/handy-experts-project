import React from "react";
import { AdminLiveCallsPanel } from "@/components/admin/AdminLiveCallsPanel";

export default function LiveCallsPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Calls</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor every live call across the platform.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Tracking Active
        </div>
      </div>

      <AdminLiveCallsPanel />
    </div>
  );
}
