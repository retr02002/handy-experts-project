import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getAdminWalletOverviewAction } from "@/actions/wallet.actions";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

const TYPE_LABELS: Record<string, string> = {
  DEPOSIT: "Wallet top-up",
  DEBIT: "Bought a call",
};

export default async function AdminWalletPage() {
  const res = await getAdminWalletOverviewAction();
  const overview =
    res.success && res.data
      ? res.data
      : { totalDeposited: 0, totalSpentOnLeads: 0, currentBalanceAcrossVendors: 0, activeVendorCount: 0, recentTransactions: [] };

  const stats = [
    { label: "Total Deposited", value: `₹${overview.totalDeposited.toFixed(0)}`, icon: "ph:arrow-down-left", accent: "text-emerald-500" },
    { label: "Spent on Calls", value: `₹${overview.totalSpentOnLeads.toFixed(0)}`, icon: "ph:tag-chevron", accent: "text-blue-500" },
    { label: "Balance Across Vendors", value: `₹${overview.currentBalanceAcrossVendors.toFixed(0)}`, icon: "ph:wallet", accent: "text-amber-500" },
    { label: "Active Vendors", value: String(overview.activeVendorCount), icon: "ph:buildings", accent: "text-slate-500" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vendor Wallets</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Deposits, call spend, and standing balances across every vendor wallet.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                <ClientIcon icon={stat.icon} className={`w-5 h-5 ${stat.accent}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Wallet Activity</h2>
        </div>
        {overview.recentTransactions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No wallet activity yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {overview.recentTransactions.map((t) => {
              const isDeposit = t.type === "DEPOSIT";
              return (
                <div key={t.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isDeposit ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                      }`}
                    >
                      <ClientIcon icon={isDeposit ? "ph:arrow-down-left" : "ph:tag-chevron"} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{t.vendorName}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {TYPE_LABELS[t.type] ?? t.type} &middot; {formatDateTime(t.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ${isDeposit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                    {isDeposit ? "+" : "-"}₹{t.amount.toFixed(0)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
