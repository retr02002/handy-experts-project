import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function WorkInProgress({ title, description }: { title: string; description?: string }) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
      
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 flex flex-col items-center justify-center text-center mt-8">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-6">
          <ClientIcon icon="ph:wrench-bold" className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          {description || "This feature is currently under construction and will be available in a future update."}
        </p>
      </div>
    </div>
  );
}
