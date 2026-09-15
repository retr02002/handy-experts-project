import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { StarRating } from "@/components/shared/StarRating";
import type { VendorPerformance } from "@/actions/admin.actions";
import { buildDailyTrend } from "@/lib/chartAggregation";
import { RevenueTrendChart } from "@/components/shared/charts/RevenueTrendChart";
import { StatusBreakdownChart } from "@/components/shared/charts/StatusBreakdownChart";
import { jobStatusLabel } from "@/lib/jobStatus";

const TREND_DAYS = 30;

const STATUS_COLORS: Record<string, string> = {
  UNASSIGNED: "#f59e0b",
  ASSIGNED: "#3b82f6",
  EN_ROUTE: "#6366f1",
  IN_PROGRESS: "#a855f7",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
};

/** Body of the former standalone /admin/vendors/[id]/performance page, lifted as a prop-driven tab panel. */
export function VendorPerformanceTab({ v }: { v: VendorPerformance }) {
  const trend = buildDailyTrend(
    v.revenueTrend,
    TREND_DAYS,
    (r) => r.date,
    (r) => r.total
  );

  const slices = v.statusBreakdown.map((s) => ({
    label: jobStatusLabel(s.status),
    count: s.count,
    color: STATUS_COLORS[s.status] ?? "#94a3b8",
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Revenue", value: `₹${v.revenue.toFixed(0)}`, icon: "ph:currency-inr", tone: "text-emerald-500" },
          { label: "Jobs completed", value: `${v.jobsCompleted}/${v.jobsTotal}`, icon: "ph:check-circle-fill", tone: "text-blue-500" },
          { label: "Completion rate", value: `${v.completionRate}%`, icon: "ph:chart-line-up-fill", tone: "text-violet-500" },
          { label: "Technicians", value: String(v.technicianCount), icon: "ph:users-three-fill", tone: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
            <ClientIcon icon={s.icon} className={`w-4 h-4 mb-1.5 ${s.tone}`} />
            <p className="text-lg font-black text-slate-900 dark:text-white truncate">{s.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {v.ratingCount > 0 ? (v.ratingAvg ?? 0).toFixed(1) : "—"}
          </span>
          <StarRating value={v.ratingAvg ?? 0} />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 min-w-0 flex-1">
          {v.ratingCount > 0
            ? `Across ${v.ratingCount} customer review${v.ratingCount === 1 ? "" : "s"} of this vendor's jobs.`
            : "No customer reviews for this vendor yet."}
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>{v.jobsActive} active</span>
          <span>{v.jobsCancelled} cancelled</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Revenue · last {TREND_DAYS} days</h2>
          <RevenueTrendChart data={trend} valuePrefix="₹" color="#22c55e" />
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Jobs by status</h2>
          {slices.length === 0 ? <p className="text-sm text-slate-400 text-center py-12">No jobs yet.</p> : <StatusBreakdownChart data={slices} />}
        </div>
      </div>
    </div>
  );
}
