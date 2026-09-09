"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { NEXT_STEP, JOB_STATUS_COLORS, jobStatusLabel, DECLINE_REASONS } from "@/lib/jobStatus";
import {
  updateServiceCallStatusAction,
  declineJobAction,
  type ServiceCallSummary,
} from "@/actions/servicecall.actions";
import { getMyLastKnownLocationAction } from "@/actions/technician.actions";
import { getUnreadMessageCountAction } from "@/actions/chat.actions";
import { usePolling } from "@/hooks/usePolling";
import { canStartTravel, describeTimeUntil, formatScheduledFor, TRAVEL_WINDOW_MINUTES } from "@/lib/jobSchedule";

const JobTrackingMap = dynamic(() => import("@/components/shared/JobTrackingMap").then((m) => m.JobTrackingMap), {
  ssr: false,
  loading: () => <div className="w-full h-[220px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />,
});
const ChatModal = dynamic(() => import("@/components/shared/ChatModal").then((m) => m.ChatModal));
const SupportContactModal = dynamic(() =>
  import("@/components/shared/SupportContactModal").then((m) => m.SupportContactModal)
);

const PRE_START_STATUSES = ["ASSIGNED", "EN_ROUTE"];
const UNREAD_POLL_INTERVAL_MS = 10000;

const PAYMENT_MODE_LABELS: Record<string, string> = {
  gpay: "Google Pay",
  phonepe: "PhonePe",
  paytm: "Paytm",
  amazonpay: "Amazon Pay",
  bhim: "BHIM UPI",
  "other-upi": "Other UPI",
};

/** wa.me needs a country-coded number with no punctuation. */
function whatsappUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const withCountry = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

interface Props {
  call: ServiceCallSummary;
  onClose: () => void;
  onChanged: () => void;
  /** Opens the PIN gate for the two protected transitions. */
  onGatedStep: (call: ServiceCallSummary, gate: "start" | "complete") => void;
}

export function TechnicianJobPanel({ call, onClose, onChanged, onGatedStep }: Props) {
  const [mounted, setMounted] = useState(false);
  const [myPosition, setMyPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [positionSource, setPositionSource] = useState<"live" | "stored" | null>(null);
  const [locating, setLocating] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [decliningStep, setDecliningStep] = useState(false);
  const [reason, setReason] = useState<string>(DECLINE_REASONS[0]);
  const [otherReason, setOtherReason] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => setMounted(true), []);

  /**
   * Live GPS first, last-known stored position second. Previously this was a
   * single getCurrentPosition with an empty error handler, so a denied or
   * slow fix silently became "Distance unavailable" even though the server
   * already knew roughly where the technician was.
   */
  const locate = useCallback(async () => {
    setLocating(true);

    const fromStored = async () => {
      const res = await getMyLastKnownLocationAction();
      if (res.success && res.data) {
        setMyPosition({ lat: res.data.latitude, lng: res.data.longitude });
        setPositionSource("stored");
      }
      setLocating(false);
    };

    if (!navigator.geolocation) {
      await fromStored();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setPositionSource("live");
        setLocating(false);
      },
      () => {
        void fromStored();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    void locate();
  }, [locate]);

  usePolling(
    async () => {
      if (chatOpen) return;
      const res = await getUnreadMessageCountAction(call.id);
      if (res.success && res.data) setUnread(res.data.count);
    },
    UNREAD_POLL_INTERVAL_MS,
    [call.id, chatOpen]
  );

  const contactPhone = call.siteContactPhone || call.customerPhone;
  const contactName = call.siteContactName || call.customerName;
  const step = NEXT_STEP[call.status];
  const canDecline = PRE_START_STATUSES.includes(call.status);

  // A scheduled job can be accepted days ahead. Setting off is what flips the
  // customer into live tracking, so it stays locked until the slot is close;
  // the same rule is enforced in updateServiceCallStatusAction.
  const scheduledLabel = formatScheduledFor(call.scheduledFor);
  const travelLocked = call.status === "ASSIGNED" && !canStartTravel(call.scheduledFor);
  // Tracking only means something once they're actually moving.
  const showTracking = call.status === "EN_ROUTE" || call.status === "IN_PROGRESS";

  const whatsappTemplate = `Hi ${contactName}, this is your Handyzo technician for "${call.itemSummary}". I'm on my way to ${call.address}, ${call.city}. Please keep your service PIN handy — I'll need it to start the job.`;
  const smsTemplate = `Hi ${contactName}, your Handyzo technician here for "${call.itemSummary}". On my way to ${call.address}.`;

  const handleAdvance = async () => {
    if (!step) return;
    if (step.gated) {
      onGatedStep(call, step.gated);
      return;
    }
    setIsUpdating(true);
    try {
      const res = await updateServiceCallStatusAction(call.id, step.next);
      if (!res.success) {
        toast.error(res.error || "Failed to update status");
        return;
      }
      toast.success(`Marked as ${jobStatusLabel(step.next)}`);
      onChanged();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecline = async () => {
    const finalReason = reason === "Other" ? otherReason.trim() : reason;
    if (finalReason.length < 3) {
      toast.error("Please say why you're declining.");
      return;
    }
    setIsUpdating(true);
    try {
      const res = await declineJobAction(call.id, finalReason);
      if (!res.success) {
        toast.error(res.error || "Failed to decline this job");
        return;
      }
      toast("Job returned to your vendor");
      onChanged();
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  if (!mounted) return null;

  // The modals live outside this portal on purpose: React events bubble
  // through the component tree, not the DOM, so a click inside a nested
  // modal would otherwise reach this overlay's onClick and close the panel
  // underneath it.
  return (
    <>
      {createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        >
      <div
        className="relative bg-white dark:bg-[#0F172A] w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">{call.itemSummary}</h2>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                  JOB_STATUS_COLORS[call.status] ?? ""
                }`}
              >
                {jobStatusLabel(call.status)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full transition-colors shrink-0"
            >
              <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
          {decliningStep ? (
            <>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Why are you declining?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  The job goes back to your vendor so someone else can pick it up.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {DECLINE_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`text-left px-3.5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      reason === r
                        ? "border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
                {reason === "Other" && (
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Tell your vendor what's up"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white resize-none h-20 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                )}
              </div>
            </>
          ) : (
            <>
              {/* Before departure the job is a diary entry, not a journey. */}
              {!showTracking && (
                <div className="shrink-0 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <ClientIcon
                        icon={call.scheduledFor ? "ph:calendar-check-fill" : "ph:lightning-fill"}
                        className="w-5 h-5"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {call.scheduledFor ? "Scheduled for" : "Instant job"}
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {scheduledLabel ?? "Start whenever you're ready"}
                      </p>
                      {describeTimeUntil(call.scheduledFor) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {describeTimeUntil(call.scheduledFor)}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {travelLocked
                      ? `You can set off from ${TRAVEL_WINDOW_MINUTES / 60} hours before the slot. Navigation and live tracking turn on then.`
                      : "Tap Start when you set off — that turns on navigation here and live tracking for the customer."}
                  </p>
                </div>
              )}

              {/* Live route to the customer, with a way out to a nav app */}
              {showTracking && (
              <JobTrackingMap
                serviceCallId={call.id}
                customerLatitude={call.latitude}
                customerLongitude={call.longitude}
                customerLabel={`${call.customerName} — ₹${call.total}`}
                viewer="technician"
                height="220px"
                viewerPosition={myPosition}
                locating={locating}
                onRetryLocation={() => void locate()}
                onSite={call.status === "IN_PROGRESS"}
              />
              )}
              {showTracking && positionSource === "stored" && !locating && (
                <p className="-mt-2 text-[10px] text-slate-400 px-1">
                  Using your last known position — turn on location for a live fix.
                </p>
              )}

              {/* Customer + contact actions */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{contactName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 break-words">
                    {call.address}, {call.city}, {call.state} {call.pincode}
                  </p>
                  {call.siteContactName && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                      Site contact — booked by {call.customerName}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <a
                    href={`tel:${contactPhone}`}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-400 transition-colors"
                  >
                    <ClientIcon icon="ph:phone-fill" className="w-4 h-4 text-emerald-500" />
                    <span className="text-[11px] font-bold">Call</span>
                  </a>
                  <a
                    href={`sms:${contactPhone}?&body=${encodeURIComponent(smsTemplate)}`}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400 transition-colors"
                  >
                    <ClientIcon icon="ph:chat-teardrop-text-fill" className="w-4 h-4 text-blue-500" />
                    <span className="text-[11px] font-bold">SMS</span>
                  </a>
                  <a
                    href={whatsappUrl(contactPhone, whatsappTemplate)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-green-400 transition-colors"
                  >
                    <ClientIcon icon="ph:whatsapp-logo-fill" className="w-4 h-4 text-green-500" />
                    <span className="text-[11px] font-bold">WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setChatOpen(true);
                      setUnread(0);
                    }}
                    className="relative flex flex-col items-center gap-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#00B4FF] transition-colors cursor-pointer"
                  >
                    <ClientIcon icon="ph:chat-circle-fill" className="w-4 h-4 text-[#00B4FF]" />
                    <span className="text-[11px] font-bold">Chat</span>
                    {unread > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Order summary */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5 text-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Order Summary</p>
                {call.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="min-w-0 truncate">
                      {item.packageName} {item.quantity > 1 ? `x${item.quantity}` : ""}
                    </span>
                    <span className="font-medium shrink-0">₹{(item.unitPrice * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                  <span>Subtotal</span>
                  <span>₹{call.subtotal.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>GST</span>
                  <span>₹{call.tax.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pt-1">
                  <span>Total</span>
                  <span>₹{call.total.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                  <span>Paid via</span>
                  <span className="truncate ml-2">
                    {PAYMENT_MODE_LABELS[call.paymentMode] ?? call.paymentMode} &middot; {call.upiRef}
                  </span>
                </div>
                {call.scheduledFor && (
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Scheduled</span>
                    <span>
                      {new Date(call.scheduledFor).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Vendor support — the technician's escalation path on site */}
              <button
                type="button"
                onClick={() => setSupportOpen(true)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-left hover:border-amber-400 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <ClientIcon icon="ph:headset-fill" className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Need help on this job?</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Call or email {call.vendorName}</p>
                </div>
                <ClientIcon icon="ph:caret-right-bold" className="w-4 h-4 text-slate-300 shrink-0" />
              </button>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center gap-2">
          {decliningStep ? (
            <>
              <button
                type="button"
                onClick={() => setDecliningStep(false)}
                disabled={isUpdating}
                className="flex-1 h-11 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold disabled:opacity-50 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleDecline}
                disabled={isUpdating}
                className="flex-1 h-11 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isUpdating ? "..." : "Confirm Decline"}
              </button>
            </>
          ) : (
            <>
              {canDecline && (
                <button
                  type="button"
                  onClick={() => setDecliningStep(true)}
                  disabled={isUpdating}
                  className="h-11 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold disabled:opacity-50 cursor-pointer shrink-0"
                >
                  Decline
                </button>
              )}
              {step ? (
                <button
                  type="button"
                  onClick={handleAdvance}
                  disabled={isUpdating || travelLocked}
                  title={travelLocked && scheduledLabel ? `Scheduled for ${scheduledLabel}` : undefined}
                  className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors cursor-pointer flex flex-col items-center justify-center leading-tight"
                >
                  {isUpdating ? (
                    "Updating..."
                  ) : travelLocked ? (
                    <>
                      <span>Starts {scheduledLabel}</span>
                      <span className="text-[10px] font-semibold text-white/80">Too early to set off</span>
                    </>
                  ) : (
                    step.label
                  )}
                </button>
              ) : (
                <p className="flex-1 text-center text-xs text-slate-400 py-3">No further action for this job.</p>
              )}
            </>
          )}
        </div>
          </div>
        </div>,
        document.body
      )}

      {chatOpen && (
        <ChatModal serviceCallId={call.id} counterpartName={call.customerName} onClose={() => setChatOpen(false)} />
      )}

      {supportOpen && (
        <SupportContactModal
          vendorName={call.vendorName}
          vendorPhone={call.vendorPhone}
          vendorEmail={call.vendorEmail}
          onClose={() => setSupportOpen(false)}
        />
      )}
    </>
  );
}
