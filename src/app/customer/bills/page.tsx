import React from "react";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getMyOrdersAction, type OrderDisplayStatus } from "@/actions/livecall.actions";

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

export default async function CustomerBillsPage() {
  const res = await getMyOrdersAction();
  const orders = res.success ? res.data ?? [] : [];
  const totalBilled = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bills & Invoices</h1>
        <div className="text-right">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Total Billed</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">₹{totalBilled.toFixed(2)}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
            <ClientIcon icon="ph:receipt" className="w-7 h-7" />
          </div>
          <p className="font-semibold text-slate-900 dark:text-white">No bills yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Invoices for your orders will show up here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invoice</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Service</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      INV-{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 max-w-[220px] truncate">{order.itemSummary}</td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="p-4 text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">₹{order.total.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLES[order.status]}`}>
                        {order.status.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/customer/orders/${order.id}`}
                        className="inline-flex p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <ClientIcon icon="ph:arrow-square-out" className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
