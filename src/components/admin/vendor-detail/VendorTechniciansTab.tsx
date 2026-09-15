import React from "react";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { VendorPerformance } from "@/actions/admin.actions";

/** Read-only roster — reuses the technician list already computed for the Performance tab's aggregate stats, no separate fetch. */
export function VendorTechniciansTab({ technicians }: { technicians: VendorPerformance["technicians"] }) {
  if (technicians.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 text-center w-full">
        <ClientIcon icon="ph:users-three" className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No technicians on this vendor&apos;s team.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 w-full">
      {technicians.map((t) => (
        <Link
          key={t.id}
          href={`/admin/technicians/${t.id}`}
          className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col gap-3 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">
              {t.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{t.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.skillCategory} · {t.experienceYears}y</p>
            </div>
            <span
              className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                t.isOnDuty
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {t.isOnDuty ? "On Duty" : "Off"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{t.jobsCompleted}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Jobs Done</p>
            </div>
            <div className="text-center">
              {t.ratingCount > 0 ? (
                <>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{(t.ratingAvg ?? 0).toFixed(1)} ★</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t.ratingCount} rated</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-slate-300 dark:text-slate-600">—</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">No ratings</p>
                </>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
