"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { usePolling } from "@/hooks/usePolling";
import { getMyOrderDetailAction, type CustomerOrderDetail, type OrderDisplayStatus } from "@/actions/livecall.actions";
import { getUnreadMessageCountAction } from "@/actions/chat.actions";
import { OrderProgressStepper } from "./OrderProgressStepper";
import { StarRating } from "@/components/shared/StarRating";
import { describeTimeUntil, formatScheduledFor } from "@/lib/jobSchedule";

// Every one of these pulls in weight that most order views never need — a
// completed order shows no map, an unassigned one has nobody to chat with.
const JobTrackingMap = dynamic(() => import("@/components/shared/JobTrackingMap").then((m) => m.JobTrackingMap), {
  ssr: false,
  loading: () => <div className="rounded-2xl h-[300px] bg-slate-100 dark:bg-slate-800 animate-pulse" />,
});
const ChatModal = dynamic(() => import("@/components/shared/ChatModal").then((m) => m.ChatModal));
const SupportContactModal = dynamic(() =>
  import("@/components/shared/SupportContactModal").then((m) => m.SupportContactModal)
);
const TechnicianDetailModal = dynamic(() =>
  import("@/components/shared/TechnicianDetailModal").then((m) => m.TechnicianDetailModal)
);
const RateJobModal = dynamic(() => import("./RateJobModal").then((m) => m.RateJobModal));

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

// The one line at the top of the screen that answers "what's happening?" —
// the Blinkit/Zomato headline, not a status enum.
const STATUS_HEADLINES: Record<OrderDisplayStatus, string> = {
  FINDING_PROFESSIONAL: "Finding a professional near you",
  ASSIGNED: "Your technician is booked in",
  EN_ROUTE: "Your technician is on the way",
  IN_PROGRESS: "Work is under way",
  COMPLETED: "Job completed",
  CANCELLED: "Order cancelled",
  EXPIRED: "Order expired",
};

const STATUS_SUBLINES: Record<OrderDisplayStatus, string> = {
  FINDING_PROFESSIONAL: "We're matching you with the closest available expert.",
  ASSIGNED: "You'll be able to track them live once they set off.",
  EN_ROUTE: "Keep your start PIN handy for when they arrive.",
  IN_PROGRESS: "Share your completion PIN once you're happy with the work.",
  COMPLETED: "Thanks for booking with us.",
  CANCELLED: "This order is no longer active.",
  EXPIRED: "No vendor picked this up in time.",
};

const STATUS_ACCENTS: Record<OrderDisplayStatus, string> = {
  FINDING_PROFESSIONAL: "from-amber-500 to-orange-500",
  ASSIGNED: "from-[#00B4FF] to-blue-600",
  EN_ROUTE: "from-[#00B4FF] to-blue-600",
  IN_PROGRESS: "from-violet-500 to-purple-600",
  COMPLETED: "from-emerald-500 to-green-600",
  CANCELLED: "from-slate-500 to-slate-600",
  EXPIRED: "from-slate-500 to-slate-600",
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

// Live-tracking stops mattering once the order reaches a terminal state.
const LIVE_STATUSES: OrderDisplayStatus[] = ["FINDING_PROFESSIONAL", "ASSIGNED", "EN_ROUTE", "IN_PROGRESS"];
// Tracking starts when the technician sets off, not when the job is
// accepted — a scheduled booking sits in ASSIGNED for days. Mirrored in
// tracking.actions.ts, which is what actually enforces it.
const TRACKABLE_STATUSES: OrderDisplayStatus[] = ["EN_ROUTE", "IN_PROGRESS"];

const UNREAD_POLL_INTERVAL_MS = 10000;

export function OrderDetailClient({ orderId, initialOrder }: { orderId: string; initialOrder: CustomerOrderDetail }) {
  const [order, setOrder] = useState(initialOrder);
  const [unread, setUnread] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [techOpen, setTechOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);

  const refresh = useCallback(async () => {
    const res = await getMyOrderDetailAction(orderId);
    if (res.success && res.data) setOrder(res.data);
  }, [orderId]);

  usePolling(
    async () => {
      if (!LIVE_STATUSES.includes(order.status)) return;
      await refresh();
    },
    5000,
    [orderId, order.status, refresh]
  );

  const serviceCallId = order.serviceCallId;
  const canChat = !!serviceCallId && !!order.technicianName;

  usePolling(
    async () => {
      if (!canChat || !serviceCallId || chatOpen) return;
      const res = await getUnreadMessageCountAction(serviceCallId);
      if (res.success && res.data) setUnread(res.data.count);
    },
    UNREAD_POLL_INTERVAL_MS,
    [serviceCallId, canChat, chatOpen]
  );

  const isTrackable = TRACKABLE_STATUSES.includes(order.status) && !!serviceCallId;
  const isLive = LIVE_STATUSES.includes(order.status);
  const scheduledLabel = formatScheduledFor(order.scheduledFor);
  // Before the technician sets off there is nothing to track, so the slot
  // itself is the headline — "getting ready" would be a lie two days out.
  const awaitingSlot = order.status === "ASSIGNED";
  const headline =
    awaitingSlot && scheduledLabel ? `Booked for ${scheduledLabel}` : STATUS_HEADLINES[order.status];
  const subline =
    awaitingSlot && scheduledLabel
      ? "Your technician will set off closer to the time — you can track them live from then."
      : STATUS_SUBLINES[order.status];
  const showPins = order.startPin || order.completionPin ? isLive && order.status !== "FINDING_PROFESSIONAL" : false;

  return (
    <div className="w-full max-w-3xl mx-auto pb-10">
      {/* App-style top bar */}
      <div className="sticky top-0 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 bg-slate-50/90 dark:bg-[#0B1221]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/customer/orders"
            className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
          >
            <ClientIcon icon="ph:arrow-left-bold" className="w-4 h-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              Order #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{STATUS_LABELS[order.status]}</p>
          </div>
          <button
            type="button"
            onClick={() => setSupportOpen(true)}
            className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-[#00B4FF] transition-colors shrink-0 cursor-pointer"
            aria-label="Contact support"
          >
            <ClientIcon icon="ph:headset-fill" className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 mt-1">
        {/* Status hero */}
        <div
          className={`rounded-2xl p-5 bg-gradient-to-br ${STATUS_ACCENTS[order.status]} text-white shadow-lg shadow-slate-900/5`}
        >
          <div className="flex items-center gap-2 mb-1">
            {isLive && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
              {STATUS_LABELS[order.status]}
            </p>
          </div>
          <p className="text-lg font-bold leading-snug">{headline}</p>
          <p className="text-xs text-white/85 mt-1">{subline}</p>
        </div>

        {/* Scheduled: the "when", in place of a map that would have nothing
            honest to show until the technician actually sets off. */}
        {awaitingSlot && (
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#00B4FF]/10 text-[#00B4FF] flex items-center justify-center shrink-0">
                <ClientIcon icon={order.scheduledFor ? "ph:calendar-check-fill" : "ph:lightning-fill"} className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {order.scheduledFor ? "Scheduled visit" : "Instant service"}
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {scheduledLabel ?? "As soon as your technician is free"}
                </p>
                {describeTimeUntil(order.scheduledFor) && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{describeTimeUntil(order.scheduledFor)}</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <ClientIcon icon="ph:navigation-arrow-fill" className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Live tracking turns on the moment your technician sets off. You&apos;ll see them move on a map, with
                distance and arrival time.
              </p>
            </div>
          </div>
        )}

        {/* Live tracking */}
        {isTrackable && serviceCallId && (
          <JobTrackingMap
            serviceCallId={serviceCallId}
            customerLatitude={order.latitude}
            customerLongitude={order.longitude}
            customerLabel="Your location"
            technicianLabel={order.technicianName ?? "Technician"}
            viewer="customer"
            height="300px"
            onSite={order.status === "IN_PROGRESS"}
          />
        )}

        {/* Technician card — Rapido-style rider strip */}
        {order.technicianName && (
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-base font-bold text-slate-600 dark:text-slate-200 shrink-0">
                {order.technicianName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{order.technicianName}</p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {order.technicianRatingCount > 0 ? (
                    <>
                      <StarRating value={order.technicianRatingAvg ?? 0} />
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        {(order.technicianRatingAvg ?? 0).toFixed(1)}
                      </span>
                      <span className="text-[11px] text-slate-400">({order.technicianRatingCount})</span>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-400">New on the platform</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {order.technicianSkill ?? "Technician"}
                  {order.technicianExperienceYears != null && ` · ${order.technicianExperienceYears} yrs experience`}
                </p>
              </div>
              {order.technicianId && (
                <button
                  type="button"
                  onClick={() => setTechOpen(true)}
                  className="shrink-0 text-[11px] font-bold text-[#00B4FF] hover:underline cursor-pointer"
                >
                  Details
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 border-t border-slate-100 dark:border-slate-800 divide-x divide-slate-100 dark:divide-slate-800">
              {order.technicianPhone ? (
                <a
                  href={`tel:${order.technicianPhone}`}
                  className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <ClientIcon icon="ph:phone-fill" className="w-4 h-4 text-emerald-500" /> Call
                </a>
              ) : (
                <span className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-slate-300 dark:text-slate-600">
                  <ClientIcon icon="ph:phone-fill" className="w-4 h-4" /> Call
                </span>
              )}

              <button
                type="button"
                disabled={!canChat}
                onClick={() => {
                  setChatOpen(true);
                  setUnread(0);
                }}
                className="relative flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <ClientIcon icon="ph:chat-circle-fill" className="w-4 h-4 text-[#00B4FF]" /> Message
                {unread > 0 && (
                  <span className="absolute top-2 right-1/4 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSupportOpen(true)}
                className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <ClientIcon icon="ph:dots-three-circle-fill" className="w-4 h-4 text-slate-400" /> Help
              </button>
            </div>
          </div>
        )}

        {/* Rate the job */}
        {order.status === "COMPLETED" && serviceCallId && !order.hasReview && (
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-amber-300/60 dark:border-amber-500/30 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                <ClientIcon icon="ph:star-fill" className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">How did it go?</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rate your technician and the service — it helps the next customer.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRateOpen(true)}
              className="w-full h-11 mt-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-colors cursor-pointer"
            >
              Rate this job
            </button>
          </div>
        )}

        {order.status === "COMPLETED" && order.hasReview && (
          <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25">
            <ClientIcon icon="ph:check-circle-fill" className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
              Thanks — your rating is in. You can see it under Reviews.
            </p>
          </div>
        )}

        {/* Service PINs — the customer reads these out to their technician */}
        {showPins && (
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#00B4FF]/40 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <ClientIcon icon="ph:lock-key-fill" className="w-5 h-5 text-[#00B4FF] shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Your service PINs</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Share the matching PIN when your technician asks.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "To start", pin: order.startPin, active: order.status !== "IN_PROGRESS" },
                { label: "To complete", pin: order.completionPin, active: order.status === "IN_PROGRESS" },
              ].map((p) => (
                <div
                  key={p.label}
                  className={`rounded-xl p-3 text-center border transition-colors ${
                    p.active
                      ? "bg-[#00B4FF]/5 border-[#00B4FF]/40"
                      : "bg-slate-50 dark:bg-slate-900/50 border-transparent"
                  }`}
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.label}</p>
                  <p className="text-xl font-black tracking-[0.2em] text-slate-900 dark:text-white mt-1">
                    {p.pin ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Order progress</h2>
          <OrderProgressStepper
            status={order.status}
            timestamps={{
              FINDING_PROFESSIONAL: order.createdAt,
              ASSIGNED: order.assignedAt ?? order.acceptedAt,
              EN_ROUTE: order.assignedAt,
              IN_PROGRESS: order.startedAt,
              COMPLETED: order.completedAt,
            }}
          />
        </div>

        {/* Items */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Order summary</h2>
          <div className="flex flex-col gap-2 text-sm">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3 text-slate-700 dark:text-slate-300">
                <span className="min-w-0 truncate">
                  {item.packageName} {item.quantity > 1 ? `x${item.quantity}` : ""}
                </span>
                <span className="font-medium shrink-0">₹{(item.unitPrice * item.quantity).toFixed(0)}</span>
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
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-3 text-sm">
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
            <ClientIcon icon="ph:map-pin-line" className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="min-w-0 break-words">
              {order.address}, {order.city}, {order.state} {order.pincode}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <ClientIcon icon="ph:device-mobile-camera" className="w-4 h-4 shrink-0" />
            <span className="min-w-0 truncate">
              {PAYMENT_MODE_LABELS[order.paymentMode] ?? order.paymentMode} &middot; {order.upiRef}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <ClientIcon icon={order.scheduledFor ? "ph:calendar-blank" : "ph:lightning"} className="w-4 h-4 shrink-0" />
            <span>{order.scheduledFor ? `Scheduled for ${formatDateTime(order.scheduledFor)}` : "Instant service"}</span>
          </div>
        </div>

        {/* Vendor support */}
        {order.vendorName && (
          <button
            type="button"
            onClick={() => setSupportOpen(true)}
            className="w-full bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex items-center gap-3 text-left hover:border-[#00B4FF]/50 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#00B4FF]/10 text-[#00B4FF] flex items-center justify-center shrink-0">
              <ClientIcon icon="ph:headset-fill" className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Need help with this order?</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Contact {order.vendorName} directly
              </p>
            </div>
            <ClientIcon icon="ph:caret-right-bold" className="w-4 h-4 text-slate-300 shrink-0" />
          </button>
        )}
      </div>

      {chatOpen && serviceCallId && order.technicianName && (
        <ChatModal
          serviceCallId={serviceCallId}
          counterpartName={order.technicianName}
          onClose={() => setChatOpen(false)}
        />
      )}

      {supportOpen && (
        <SupportContactModal
          vendorName={order.vendorName}
          vendorPhone={order.vendorPhone}
          vendorEmail={order.vendorEmail}
          onClose={() => setSupportOpen(false)}
        />
      )}

      {techOpen && order.technicianId && (
        <TechnicianDetailModal
          technicianId={order.technicianId}
          onClose={() => setTechOpen(false)}
          onCall={order.technicianPhone ? () => window.open(`tel:${order.technicianPhone}`) : undefined}
        />
      )}

      {rateOpen && serviceCallId && (
        <RateJobModal
          serviceCallId={serviceCallId}
          technicianName={order.technicianName}
          onClose={() => setRateOpen(false)}
          onSubmitted={() => {
            setRateOpen(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
