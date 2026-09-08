"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { usePolling } from "@/hooks/usePolling";
import { getMyOrderDetailAction, type CustomerOrderDetail, type OrderDisplayStatus } from "@/actions/livecall.actions";
import { OrderProgressStepper } from "./OrderProgressStepper";

const PAYMENT_MODE_LABELS: Record<string, string> = {
  gpay: "Google Pay",
  phonepe: "PhonePe",
  paytm: "Paytm",
  amazonpay: "Amazon Pay",
  bhim: "BHIM UPI",
  "other-upi": "Other UPI",
};

const STATUS_LABELS: Record<OrderDisplayStatus, string> = {
  FINDING_PROFESSIONAL: "Finding a professional",
  ASSIGNED: "Technician assigned",
  EN_ROUTE: "On the way",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

// Live-tracking stops mattering once the order reaches a terminal state.
const LIVE_STATUSES: OrderDisplayStatus[] = ["FINDING_PROFESSIONAL", "ASSIGNED", "EN_ROUTE", "IN_PROGRESS"];

export function OrderDetailClient({ orderId, initialOrder }: { orderId: string; initialOrder: CustomerOrderDetail }) {
  const [order, setOrder] = useState(initialOrder);

  usePolling(
    async () => {
      if (!LIVE_STATUSES.includes(order.status)) return;
      const res = await getMyOrderDetailAction(orderId);
      if (res.success && res.data) setOrder(res.data);
    },
    5000,
    [orderId, order.status]
  );

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <Link
          href="/customer/orders"
          className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
        >
          <ClientIcon icon="ph:arrow-left-bold" className="w-4 h-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{STATUS_LABELS[order.status]}</p>
        </div>
      </div>

      {/* Progress tracker */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Order Progress</h2>
        <OrderProgressStepper status={order.status} />
      </div>

      {/* Technician contact */}
      {order.technicianName && (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">
            {order.technicianName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{order.technicianName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your assigned technician</p>
          </div>
          {order.technicianPhone && (
            <a
              href={`tel:${order.technicianPhone}`}
              className="w-10 h-10 rounded-full bg-[#00B4FF]/10 text-[#00B4FF] flex items-center justify-center shrink-0"
            >
              <ClientIcon icon="ph:phone-fill" className="w-4 h-4" />
            </a>
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Items</h2>
        <div className="flex flex-col gap-2 text-sm">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span>
                {item.packageName} {item.quantity > 1 ? `x${item.quantity}` : ""}
              </span>
              <span className="font-medium">₹{(item.unitPrice * item.quantity).toFixed(0)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-slate-500 pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>GST</span>
            <span>₹{order.tax.toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pt-1">
            <span>Total</span>
            <span>₹{order.total.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Address & payment */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 flex flex-col gap-3 text-sm">
        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
          <ClientIcon icon="ph:map-pin-line" className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {order.address}, {order.city}, {order.state} {order.pincode}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <ClientIcon icon="ph:device-mobile-camera" className="w-4 h-4 shrink-0" />
          <span>
            {PAYMENT_MODE_LABELS[order.paymentMode] ?? order.paymentMode} &middot; {order.upiRef}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <ClientIcon icon={order.scheduledFor ? "ph:calendar-blank" : "ph:lightning"} className="w-4 h-4 shrink-0" />
          <span>{order.scheduledFor ? `Scheduled for ${formatDateTime(order.scheduledFor)}` : "Instant service"}</span>
        </div>
      </div>
    </div>
  );
}
