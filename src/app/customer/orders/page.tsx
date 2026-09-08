import React from "react";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getMyOrdersAction, type OrderDisplayStatus } from "@/actions/livecall.actions";

const STATUS_LABELS: Record<OrderDisplayStatus, string> = {
  FINDING_PROFESSIONAL: "Finding a professional",
  ASSIGNED: "Technician assigned",
  EN_ROUTE: "On the way",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

const STATUS_STYLES: Record<OrderDisplayStatus, string> = {
  FINDING_PROFESSIONAL: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  ASSIGNED: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  EN_ROUTE: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  IN_PROGRESS: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  CANCELLED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  EXPIRED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function CustomerOrdersPage() {
  const res = await getMyOrdersAction();
  const orders = res.success ? res.data ?? [] : [];

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Orders</h1>
        <Link
          href="/services"
          className="bg-blue-600 text-white px-4 py-3 sm:py-2 w-full sm:w-auto rounded-xl text-sm font-medium hover:bg-blue-700 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
        >
          <ClientIcon icon="ph:plus" className="w-4 h-4" />
          Book New Service
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
            <ClientIcon icon="ph:package" className="w-7 h-7" />
          </div>
          <p className="font-semibold text-slate-900 dark:text-white">No orders yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Once you book a service, it&apos;ll show up here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/customer/orders/${order.id}`}
                className="block p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center shrink-0">
                      <ClientIcon icon="ph:wrench" className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">{order.itemSummary}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Order #{order.id.slice(-8).toUpperCase()} &middot; {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">₹{order.total.toFixed(2)}</div>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <div className="p-2 text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <ClientIcon icon="ph:caret-right" className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
