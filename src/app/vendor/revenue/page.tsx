import React from "react";
import { getMyServiceCallsForVendorAction } from "@/actions/servicecall.actions";
import { RevenueTrendChart } from "@/components/shared/charts/RevenueTrendChart";
import { buildDailyTrend } from "@/lib/chartAggregation";

const DAY_MS = 24 * 60 * 60 * 1000;

interface RevenueWindows {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
}

// Isolated from the page component on purpose — a Server Component's render
// body is treated as pure, and Date.now() would otherwise trip the
// "impure function during render" rule.
function computeRevenueWindows(completedCalls: { completedAt: string | null; total: number }[]): RevenueWindows {
  const now = Date.now();
  const sumSince = (msAgo: number) =>
    completedCalls
      .filter((c) => c.completedAt && now - new Date(c.completedAt).getTime() <= msAgo)
      .reduce((sum, c) => sum + c.total, 0);

  return {
    totalRevenue: completedCalls.reduce((sum, c) => sum + c.total, 0),
    todayRevenue: sumSince(DAY_MS),
    weekRevenue: sumSince(7 * DAY_MS),
    monthRevenue: sumSince(30 * DAY_MS),
  };
}

export default async function VendorRevenuePage() {
  const res = await getMyServiceCallsForVendorAction();
  const calls = res.success ? res.data ?? [] : [];
  const completedCalls = calls.filter((c) => c.status === "COMPLETED" && c.completedAt);

  const { totalRevenue, todayRevenue, weekRevenue, monthRevenue } = computeRevenueWindows(completedCalls);

  const revenueTrend = buildDailyTrend(
    completedCalls,
    14,
    (c) => c.completedAt!,
    (c) => c.total
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Revenue & Earnings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Computed from your completed service calls.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{totalRevenue.toFixed(0)}</h3>
        </div>
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{todayRevenue.toFixed(0)}</h3>
        </div>
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Last 7 Days</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{weekRevenue.toFixed(0)}</h3>
        </div>
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Last 30 Days</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{monthRevenue.toFixed(0)}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Revenue — Last 14 Days</h2>
        <RevenueTrendChart data={revenueTrend} height={300} />
      </div>
    </div>
  );
}
