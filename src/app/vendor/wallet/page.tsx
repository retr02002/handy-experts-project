import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getMyServiceCallsForVendorAction } from "@/actions/servicecall.actions";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function VendorWalletPage() {
  const res = await getMyServiceCallsForVendorAction();
  const calls = res.success ? res.data ?? [] : [];

  const completedCalls = calls
    .filter((c) => c.status === "COMPLETED" && c.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
  const pendingCalls = calls.filter((c) => ["ASSIGNED", "EN_ROUTE", "IN_PROGRESS"].includes(c.status));

  const totalEarnings = completedCalls.reduce((sum, c) => sum + c.total, 0);
  const pendingValue = pendingCalls.reduce((sum, c) => sum + c.total, 0);
  const thisMonthEarnings = completedCalls
    .filter((c) => new Date(c.completedAt!).getMonth() === new Date().getMonth() && new Date(c.completedAt!).getFullYear() === new Date().getFullYear())
    .reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wallet</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Earnings computed from your completed service calls.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20 flex flex-col justify-between min-h-[160px] relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <span className="text-blue-100 font-medium">Total Earnings</span>
            <ClientIcon icon="ph:wallet" className="w-6 h-6 text-blue-200" />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold">₹{totalEarnings.toFixed(0)}</h2>
            <p className="text-sm text-blue-200 mt-2">Lifetime, from completed jobs</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 dark:text-slate-400 font-medium">In Progress</span>
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <ClientIcon icon="ph:clock-counter-clockwise" className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">₹{pendingValue.toFixed(0)}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {pendingCalls.length} job{pendingCalls.length === 1 ? "" : "s"} not yet completed
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 dark:text-slate-400 font-medium">This Month</span>
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <ClientIcon icon="ph:chart-line-up" className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">₹{thisMonthEarnings.toFixed(0)}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Completed this calendar month</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col mt-2">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Completed Service Calls</h2>
        </div>
        {completedCalls.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No completed service calls yet.</p>
        ) : (
          <div className="flex flex-col">
            {completedCalls.slice(0, 20).map((call, index) => (
              <div
                key={call.id}
                className={`p-6 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                  index !== Math.min(completedCalls.length, 20) - 1 ? "border-b border-slate-100 dark:border-slate-800/50" : ""
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500">
                    <ClientIcon icon="ph:arrow-down-left" className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">{call.itemSummary}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>{formatDate(call.completedAt!)}</span>
                      <span>&middot;</span>
                      <span className="truncate">{call.customerName}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right font-bold text-emerald-600 dark:text-emerald-500 shrink-0">+₹{call.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
