"use client";

import React, { useMemo, useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { TicketBadge } from "@/components/shared/TicketBadge";
import { JOB_STATUS_COLORS, jobStatusLabel } from "@/lib/jobStatus";
import type { AdminServiceCallSummary } from "@/actions/servicecall.actions";

const FILTERS = ["ALL", "UNASSIGNED", "ASSIGNED", "EN_ROUTE", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Card list rather than a table: seven columns of order data on a 375px
 * phone is a horizontal-scroll trap, and this page is used on mobile.
 * Filtering happens in memory — all rows are already loaded by the parent
 * page, so a round trip per keystroke would be pure latency.
 */
export function VendorOrdersTab({ orders }: { orders: AdminServiceCallSummary[] }) {
  const [status, setStatus] = useState<(typeof FILTERS)[number]>("ALL");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "ALL" && o.status !== status) return false;
      if (!q) return true;
      return (
        o.ticketNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.technicianName ?? "").toLowerCase().includes(q) ||
        o.itemSummary.toLowerCase().includes(q)
      );
    });
  }, [orders, status, query]);

  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;
  const revenue = orders.filter((o) => o.status === "COMPLETED").reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: "Orders", value: String(orders.length), icon: "ph:receipt-fill" },
          { label: "Completed", value: String(completedCount), icon: "ph:check-circle-fill" },
          { label: "Revenue", value: `₹${revenue.toFixed(0)}`, icon: "ph:currency-inr" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 px-2.5 py-2.5 sm:px-4 sm:py-3 shadow-sm min-w-0"
          >
            <ClientIcon icon={s.icon} className="w-4 h-4 text-[#00B4FF] mb-1" />
            <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">{s.value}</p>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <ClientIcon icon="ph:magnifying-glass" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ticket, customer, technician or service"
          className="w-full h-11 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatus(f)}
            className={`h-10 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              status === f
                ? "bg-[#00B4FF] text-white"
                : "bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
            }`}
          >
            {f === "ALL" ? "All" : jobStatusLabel(f)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 text-center">
          <ClientIcon icon="ph:receipt" className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">
            {orders.length === 0 ? "This vendor has no orders yet." : "No orders match that filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {visible.map((o) => {
            const isCompleted = o.status === "COMPLETED";
            return (
              <div
                key={o.id}
                className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-3.5 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <TicketBadge ticketNumber={o.ticketNumber} />
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${JOB_STATUS_COLORS[o.status] ?? ""}`}
                  >
                    {jobStatusLabel(o.status)}
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{o.customerName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{o.itemSummary}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {formatDate(o.createdAt)}
                    {o.technicianName ? ` · ${o.technicianName}` : ""}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-base font-black text-slate-900 dark:text-white">₹{o.total.toFixed(0)}</span>
                  {isCompleted ? (
                    <a
                      href={`/api/service-calls/${o.id}/document?audience=vendor`}
                      className="h-11 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <ClientIcon icon="ph:download-simple-bold" className="w-3.5 h-3.5" /> Invoice
                    </a>
                  ) : (
                    <span
                      title="Available once the job is completed"
                      className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 text-xs font-bold flex items-center gap-1.5 shrink-0"
                    >
                      <ClientIcon icon="ph:download-simple-bold" className="w-3.5 h-3.5" /> Invoice
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
