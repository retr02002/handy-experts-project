"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { CustomerOrderSummary, OrderDisplayStatus } from "@/actions/livecall.actions";
import { formatScheduledFor } from "@/lib/jobSchedule";

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

const ACTIVE_STATUSES: OrderDisplayStatus[] = [
  "FINDING_PROFESSIONAL",
  "ASSIGNED",
  "EN_ROUTE",
  "IN_PROGRESS",
];
const CLOSED_STATUSES: OrderDisplayStatus[] = ["CANCELLED", "EXPIRED"];

type Tab = "active" | "completed" | "cancelled";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * The customer's order history. Splitting active from past matters because
 * the two are read for different reasons — an active order is something
 * you're waiting on right now, a past one is a receipt you're looking up.
 * A single reverse-chronological list buries the first behind the second.
 */
export function OrdersHistoryClient({ orders }: { orders: CustomerOrderSummary[] }) {
  const groups = useMemo(
    () => ({
      active: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)),
      completed: orders.filter((o) => o.status === "COMPLETED"),
      cancelled: orders.filter((o) => CLOSED_STATUSES.includes(o.status)),
    }),
    [orders]
  );

  // Land on whichever tab actually has something to show, so a customer with
  // nothing in flight doesn't open to an empty screen.
  const [tab, setTab] = useState<Tab>(groups.active.length > 0 ? "active" : "completed");

  const totalSpent = groups.completed.reduce((sum, o) => sum + o.total, 0);
  const visible = groups[tab];

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "active", label: "Active", count: groups.active.length },
    { key: "completed", label: "Completed", count: groups.completed.length },
    { key: "cancelled", label: "Cancelled", count: groups.cancelled.length },
  ];

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Orders</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Everything you&apos;ve booked, past and present.
          </p>
        </div>
        <Link
          href="/services"
          className="bg-blue-600 text-white px-4 py-3 sm:py-2 w-full sm:w-auto rounded-xl text-sm font-medium hover:bg-blue-700 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm shrink-0"
        >
          <ClientIcon icon="ph:plus" className="w-4 h-4" />
          Book New Service
        </Link>
      </div>

      {orders.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total orders", value: String(orders.length), icon: "ph:package-fill" },
            { label: "Completed", value: String(groups.completed.length), icon: "ph:check-circle-fill" },
            { label: "Total spent", value: `₹${totalSpent.toFixed(0)}`, icon: "ph:currency-inr" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4"
            >
              <ClientIcon icon={s.icon} className="w-4 h-4 text-[#00B4FF] mb-1.5" />
              <p className="text-lg font-black text-slate-900 dark:text-white truncate">{s.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {orders.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar -mx-1 px-1 pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer ${
                tab === t.key
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 ${tab === t.key ? "opacity-70" : "text-slate-400"}`}>{t.count}</span>
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
            <ClientIcon icon="ph:package" className="w-7 h-7" />
          </div>
          <p className="font-semibold text-slate-900 dark:text-white">
            {orders.length === 0 ? "No orders yet" : `No ${tab} orders`}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {orders.length === 0
              ? "Once you book a service, it'll show up here."
              : "Try another tab to see the rest of your orders."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {visible.map((order) => {
              const scheduled = formatScheduledFor(order.scheduledFor);
              return (
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
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
                          Order #{order.id.slice(-8).toUpperCase()} &middot; {formatDate(order.createdAt)}
                        </p>
                        {scheduled && (
                          <p className="text-xs text-[#00B4FF] font-medium mt-0.5 truncate">Scheduled for {scheduled}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full shrink-0">
                      <div className="text-left sm:text-right">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">₹{order.total.toFixed(2)}</div>
                        <span
                          className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}
                        >
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <div className="p-2 text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <ClientIcon icon="ph:caret-right" className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
