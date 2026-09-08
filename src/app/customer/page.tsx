import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMyOrdersAction, type OrderDisplayStatus } from "@/actions/livecall.actions";
import { RevenueTrendChart } from "@/components/shared/charts/RevenueTrendChart";
import { StatusBreakdownChart } from "@/components/shared/charts/StatusBreakdownChart";
import { buildDailyTrend } from "@/lib/chartAggregation";

const ACTIVE_STATUSES: OrderDisplayStatus[] = ["FINDING_PROFESSIONAL", "ASSIGNED", "EN_ROUTE", "IN_PROGRESS"];

const STATUS_LABELS: Record<OrderDisplayStatus, string> = {
  FINDING_PROFESSIONAL: "Finding a professional",
  ASSIGNED: "Technician assigned",
  EN_ROUTE: "On the way",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions);
  const fullName = session?.user?.name || "Customer";

  const res = await getMyOrdersAction();
  const orders = res.success ? res.data ?? [] : [];

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED" || o.status === "EXPIRED");
  const totalSpend = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const recentOrders = orders.slice(0, 3);

  const spendTrend = buildDailyTrend(
    completedOrders,
    14,
    (o) => o.createdAt,
    (o) => o.total
  );

  const statusBreakdown = [
    { label: "Active", count: activeOrders.length, color: "#00B4FF" },
    { label: "Completed", count: completedOrders.length, color: "#10B981" },
    { label: "Cancelled/Expired", count: cancelledOrders.length, color: "#94A3B8" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-5xl mx-auto pb-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-5 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ClientIcon icon="ph:house-fill" className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, {fullName}!</h1>
          <p className="text-blue-100 mt-1.5 sm:mt-2 text-sm sm:text-base max-w-md leading-relaxed">
            Your home maintenance is in good hands. Book a new service or manage your appointments.
          </p>
          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:max-w-sm">
            <Link href="/services" className="flex-1 bg-white text-blue-700 hover:bg-blue-50 px-3 py-3 sm:px-4 rounded-2xl text-[13px] sm:text-sm font-bold shadow-md shadow-black/10 transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
              <ClientIcon icon="ph:plus-circle-fill" className="w-5 h-5" />
              <span className="whitespace-nowrap">Book Service</span>
            </Link>
            <Link href="/customer/orders" className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 px-3 py-3 sm:px-4 rounded-2xl text-[13px] sm:text-sm font-bold shadow-md shadow-black/10 transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
              <ClientIcon icon="ph:receipt-fill" className="w-5 h-5" />
              <span className="whitespace-nowrap">Your Orders</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bento Stat Tiles */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center sm:items-start text-center sm:text-left transition-transform hover:-translate-y-0.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center mb-2 sm:mb-3">
            <ClientIcon icon="ph:wrench-fill" className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-full">Active</p>
          <p className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{activeOrders.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center sm:items-start text-center sm:text-left transition-transform hover:-translate-y-0.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center mb-2 sm:mb-3">
            <ClientIcon icon="ph:check-circle-fill" className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-full">Completed</p>
          <p className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{completedOrders.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center sm:items-start text-center sm:text-left transition-transform hover:-translate-y-0.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center mb-2 sm:mb-3">
            <ClientIcon icon="ph:wallet-fill" className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-full">Total Spent</p>
          <p className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">₹{totalSpend.toFixed(0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content Area (Active Orders + Trend) */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          
          <div className="bg-white dark:bg-[#0F172A] rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Active Services <span className="flex h-2.5 w-2.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span></span>
              </h2>
              <Link href="/customer/orders" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full transition-colors active:scale-95">View All</Link>
            </div>

            <div className="space-y-3">
              {activeOrders.length === 0 ? (
                <div className="text-center py-10 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <ClientIcon icon="ph:coffee" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium text-sm">No active service requests.</p>
                </div>
              ) : (
                activeOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/customer/orders/${order.id}`}
                    className="block p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1E293B] shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all active:scale-[0.98] group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/50 group-hover:scale-110 transition-transform">
                          <ClientIcon icon="ph:wrench-fill" className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-[15px] sm:text-base text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{order.itemSummary}</h3>
                          <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                            <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">₹{order.total.toFixed(0)}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            <span className="text-xs font-medium text-slate-400 truncate">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
                          {STATUS_LABELS[order.status]}
                        </span>
                        <ClientIcon icon="ph:caret-right-bold" className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Spending Trend</h2>
            <div className="h-[200px] w-full">
               <RevenueTrendChart data={spendTrend} />
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Order Status</h2>
            <StatusBreakdownChart data={statusBreakdown} height={180} />
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Quick Links</h2>
            <div className="space-y-2">
              <Link href="/customer/orders" className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 transition-all active:scale-[0.98] group">
                <div className="flex items-center gap-3 font-semibold text-sm">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm group-hover:text-blue-600">
                    <ClientIcon icon="ph:clock-counter-clockwise-fill" className="w-4 h-4" />
                  </div>
                  Order History
                </div>
                <ClientIcon icon="ph:caret-right-bold" className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link href="/customer/bills" className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 transition-all active:scale-[0.98] group">
                <div className="flex items-center gap-3 font-semibold text-sm">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm group-hover:text-blue-600">
                    <ClientIcon icon="ph:receipt-fill" className="w-4 h-4" />
                  </div>
                  Invoices & Bills
                </div>
                <ClientIcon icon="ph:caret-right-bold" className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link href="/customer/rewards" className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 transition-all active:scale-[0.98] group">
                <div className="flex items-center gap-3 font-semibold text-sm">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm group-hover:text-blue-600">
                    <ClientIcon icon="ph:gift-fill" className="w-4 h-4" />
                  </div>
                  My Rewards
                </div>
                <ClientIcon icon="ph:caret-right-bold" className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          {recentOrders.length > 0 && (
            <div className="bg-white dark:bg-[#0F172A] rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Recent Orders</h2>
              <div className="flex flex-col gap-1.5">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/customer/orders/${order.id}`}
                    className="flex items-center justify-between gap-3 text-[13px] sm:text-sm p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate min-w-0 group-hover:text-blue-600 dark:group-hover:text-blue-400">{order.itemSummary}</span>
                    <span className="font-bold text-slate-900 dark:text-white shrink-0">₹{order.total.toFixed(0)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
