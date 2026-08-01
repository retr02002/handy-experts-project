import React from "react";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getProfileDetails } from "@/actions/profile.actions";
import { getAdminDashboardStatsAction } from "@/actions/admin.actions";

const STATUS_COLORS: Record<string, string> = {
  ASSIGNED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  EN_ROUTE: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  IN_PROGRESS: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function StatTile({ icon, iconBg, iconColor, label, value, sub }: { icon: string; iconBg: string; iconColor: string; label: string; value: number; sub: string }) {
  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
          <ClientIcon icon={icon} className={`w-4 h-4 ${iconColor}`} />
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-slate-900 dark:text-white">{value.toLocaleString("en-IN")}</div>
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{sub}</div>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [profile, statsRes] = await Promise.all([getProfileDetails(), getAdminDashboardStatsAction()]);
  const greetingName = profile?.name || "Admin";
  const stats = statsRes.success ? statsRes.data : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#1E1B4B] dark:to-[#312E81] rounded-2xl p-8 shadow-sm dark:shadow-lg border border-blue-100 dark:border-indigo-900/50 transition-colors">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          Welcome back, {greetingName} <span className="text-4xl">👋</span>
        </h1>
        <p className="text-slate-600 dark:text-indigo-200">
          Here is the real-time overview of your service infrastructure and call metrics.
        </p>
      </div>

      {!stats ? (
        <div className="p-8 text-center text-slate-400 text-sm">Failed to load stats.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatTile icon="ph:phone-call" iconBg="bg-blue-500/10" iconColor="text-blue-500" label="Total Live Calls" value={stats.totalLiveCalls} sub="All time" />
            <StatTile icon="ph:phone-incoming" iconBg="bg-amber-500/10" iconColor="text-amber-500" label="Broadcasting" value={stats.broadcastingLiveCalls} sub="Awaiting a vendor" />
            <StatTile icon="ph:wrench" iconBg="bg-purple-500/10" iconColor="text-purple-500" label="Active Jobs" value={stats.activeServiceCalls} sub="In progress" />
            <StatTile icon="ph:check-circle" iconBg="bg-emerald-500/10" iconColor="text-emerald-500" label="Completed" value={stats.completedServiceCalls} sub="All time" />
            <StatTile icon="ph:buildings" iconBg="bg-rose-500/10" iconColor="text-rose-500" label="Vendors" value={stats.totalVendors} sub={`${stats.activeVendors} active`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 min-h-[300px] flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Service Calls</h2>
                <Link href="/admin/service-calls" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto pr-2 max-h-[500px]">
                {stats.recentServiceCalls.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No service calls yet.</p>
                ) : (
                  stats.recentServiceCalls.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${STATUS_COLORS[call.status] ?? ""}`}>
                            {call.status.replace("_", " ").toLowerCase()}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{call.itemSummary}</h3>
                        <p className="text-xs text-slate-500 truncate">{call.customerName} &middot; {call.vendorName}</p>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white shrink-0">₹{call.total.toFixed(0)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 min-h-[300px] flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top Vendors</h2>
                <Link href="/admin/vendors" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
              </div>
              <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[500px]">
                {stats.topVendors.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No vendors yet.</p>
                ) : (
                  stats.topVendors.map((vendor) => (
                    <div key={vendor.companyName} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{vendor.companyName}</h3>
                        <p className="text-xs text-slate-500 mt-1">{vendor.technicianCount} technicians</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{vendor.serviceCallCount}</div>
                        <div className="text-xs text-slate-500">Service Calls</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
