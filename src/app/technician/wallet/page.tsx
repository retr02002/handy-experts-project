import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getMyServiceCallsForTechnicianAction } from "@/actions/servicecall.actions";
import { RevenueTrendChart } from "@/components/shared/charts/RevenueTrendChart";
import { buildDailyTrend } from "@/lib/chartAggregation";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function TechnicianWalletPage() {
  const res = await getMyServiceCallsForTechnicianAction();
  const calls = res.success ? res.data ?? [] : [];

  const completedCalls = calls
    .filter((c) => c.status === "COMPLETED" && c.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
  const pendingCalls = calls.filter((c) => ["ASSIGNED", "EN_ROUTE", "IN_PROGRESS"].includes(c.status));

  const lifetimeEarnings = completedCalls.reduce((sum, c) => sum + c.total, 0);
  const pendingValue = pendingCalls.reduce((sum, c) => sum + c.total, 0);

  const earningsTrend = buildDailyTrend(
    completedCalls,
    14,
    (c) => c.completedAt!,
    (c) => c.total
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Wallet</h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Earnings computed from your completed jobs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 md:p-6 rounded-2xl md:rounded-3xl text-white shadow-sm flex flex-col justify-between h-36 md:h-40">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm md:text-base text-emerald-100">Lifetime Earnings</p>
            <ClientIcon icon="ph:wallet" className="w-5 h-5 md:w-6 md:h-6 text-emerald-200" />
          </div>
          <p className="text-3xl md:text-4xl font-bold">₹{lifetimeEarnings.toFixed(0)}</p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm flex flex-col justify-between h-36 md:h-40">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm md:text-base text-slate-500 dark:text-slate-400">In Progress</p>
            <ClientIcon icon="ph:clock-counter-clockwise" className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">₹{pendingValue.toFixed(0)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {pendingCalls.length} job{pendingCalls.length === 1 ? "" : "s"} not yet completed
            </p>
          </div>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm">
        <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-3 md:mb-4">Earnings — Last 14 Days</h2>
        <RevenueTrendChart data={earningsTrend} color="#10B981" />
      </div>

      <div className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm">
        <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-3 md:mb-4">Completed Jobs</h2>
        {completedCalls.length === 0 ? (
          <div className="flex items-center justify-center py-8 md:py-12 text-slate-500">
            <p className="text-sm">No completed jobs yet.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {completedCalls.slice(0, 20).map((call, index) => (
              <div
                key={call.id}
                className={`py-4 flex items-center justify-between gap-4 ${
                  index !== Math.min(completedCalls.length, 20) - 1 ? "border-b border-slate-100 dark:border-slate-800/50" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500">
                    <ClientIcon icon="ph:arrow-down-left" className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{call.itemSummary}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(call.completedAt!)} &middot; {call.customerName}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm font-bold text-emerald-600 dark:text-emerald-500 shrink-0">+₹{call.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
