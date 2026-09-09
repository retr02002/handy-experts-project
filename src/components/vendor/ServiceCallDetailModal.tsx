"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  updateServiceCallStatusAction,
  reassignServiceCallAction,
  getReassignCandidatesAction,
  type ServiceCallSummary,
  type ServiceCallStatusValue,
  type ReassignCandidate,
} from "@/actions/servicecall.actions";
import { resetJobPinAttemptsAction, getServiceReportAction, type ServiceReportSummary } from "@/actions/servicejob.actions";
import Image from "next/image";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { jobStatusLabel } from "@/lib/jobStatus";

/**
 * What a vendor may set by hand. The PIN-gated hops (starting and
 * completing) are missing on purpose — only the technician on site, with
 * the customer's PIN, can make those moves.
 */
const VENDOR_STATUS_OPTIONS: ServiceCallStatusValue[] = ["EN_ROUTE", "CANCELLED"];

/** Once work has started the job stays with whoever is doing it. */
const REASSIGNABLE_STATUSES = ["UNASSIGNED", "ASSIGNED", "EN_ROUTE"];

const PIN_MAX_ATTEMPTS = 5;

const PAYMENT_MODE_LABELS: Record<string, string> = {
  gpay: "Google Pay",
  phonepe: "PhonePe",
  paytm: "Paytm",
  amazonpay: "Amazon Pay",
  bhim: "BHIM UPI",
  "other-upi": "Other UPI",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

interface ServiceCallDetailModalProps {
  call: ServiceCallSummary;
  onClose: () => void;
  onChanged: () => void;
}

export function ServiceCallDetailModal({ call, onClose, onChanged }: ServiceCallDetailModalProps) {
  const [candidates, setCandidates] = useState<ReassignCandidate[]>([]);
  const [report, setReport] = useState<ServiceReportSummary | null>(null);
  const [reassignMode, setReassignMode] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    getReassignCandidatesAction(call.id).then((res) => {
      if (res.success && res.data) setCandidates(res.data);
    });
    if (call.hasReport) {
      getServiceReportAction(call.id).then((res) => {
        if (res.success && res.data) setReport(res.data);
      });
    }
  }, [call.id, call.hasReport]);

  const handleUnlockPin = async () => {
    setIsSubmitting(true);
    try {
      const res = await resetJobPinAttemptsAction(call.id);
      if (!res.success) {
        toast.error(res.error || "Failed to unlock");
        return;
      }
      toast.success("PIN attempts reset");
      onChanged();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (status: ServiceCallStatusValue) => {
    setIsSubmitting(true);
    try {
      const res = await updateServiceCallStatusAction(call.id, status);
      if (!res.success) {
        toast.error(res.error || "Failed to update status");
        return;
      }
      toast.success(`Status updated to ${jobStatusLabel(status)}`);
      onChanged();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedTechId) return;
    setIsSubmitting(true);
    try {
      const res = await reassignServiceCallAction(call.id, selectedTechId);
      if (!res.success) {
        toast.error(res.error || "Failed to reassign");
        return;
      }
      toast.success("Call reassigned");
      onChanged();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setIsSubmitting(true);
    try {
      const res = await updateServiceCallStatusAction(call.id, "CANCELLED");
      if (!res.success) {
        toast.error(res.error || "Failed to cancel");
        return;
      }
      toast.success("Service call cancelled");
      onChanged();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#0F172A] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white pr-8">{call.itemSummary}</h3>

        <div className="flex flex-col gap-3 mt-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
              <p className="font-semibold text-slate-900 dark:text-white">{call.customerName}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
              <p className="font-semibold text-slate-900 dark:text-white">{call.customerPhone}</p>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{call.customerEmail}</p>
          </div>
          {call.siteContactPhone && (
            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3">
              <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Site Contact</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {call.siteContactName || "—"} &middot; {call.siteContactPhone}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Call this number when you arrive — it may differ from the customer above.
              </p>
            </div>
          )}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Address</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {call.address}, {call.city}, {call.state} {call.pincode}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 flex flex-col gap-1.5 text-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Items</p>
            {call.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>{item.packageName} {item.quantity > 1 ? `x${item.quantity}` : ""}</span>
                <span className="font-medium">₹{(item.unitPrice * item.quantity).toFixed(0)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-slate-500 pt-1.5 border-t border-slate-200 dark:border-slate-700 text-xs">
              <span>Subtotal</span><span>₹{call.subtotal.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>GST</span><span>₹{call.tax.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pt-1">
              <span>Total</span><span>₹{call.total.toFixed(0)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <ClientIcon icon="ph:device-mobile-camera" className="w-4 h-4 text-slate-400 shrink-0" />
              {PAYMENT_MODE_LABELS[call.paymentMode] ?? call.paymentMode} &middot; {call.upiRef}
            </div>
            {call.paymentScreenshotUrl && (
              <button type="button" onClick={() => setZoomOpen(true)} className="text-[#00B4FF] font-bold underline underline-offset-2 cursor-pointer text-xs">
                View screenshot
              </button>
            )}
          </div>

          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Technician</p>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">
              {call.technicianName ?? (
                <span className="text-amber-600 dark:text-amber-400">Unassigned — waiting for a technician</span>
              )}
            </p>
            {call.pinAttempts >= PIN_MAX_ATTEMPTS && (
              <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center justify-between gap-2">
                <p className="text-xs text-rose-700 dark:text-rose-300 min-w-0">
                  PIN locked after {call.pinAttempts} failed attempts.
                </p>
                <button
                  onClick={handleUnlockPin}
                  disabled={isSubmitting}
                  className="shrink-0 text-xs font-bold text-rose-700 dark:text-rose-300 underline disabled:opacity-50 cursor-pointer"
                >
                  Unlock
                </button>
              </div>
            )}
            {report && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completion Report</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                  {report.completionStatus.replace(/_/g, " ").toLowerCase()}
                </p>
                {report.holdReason && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">Reason: {report.holdReason}</p>
                )}
                {report.newVisitAt && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">Next visit: {formatDate(report.newVisitAt)}</p>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-300 break-words mt-1">{report.remarks}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div>
              <p className="font-bold uppercase tracking-wider mb-0.5">Assigned</p>
              <p>{formatDate(call.assignedAt)}</p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-wider mb-0.5">Started</p>
              <p>{formatDate(call.startedAt)}</p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-wider mb-0.5">Completed</p>
              <p>{formatDate(call.completedAt)}</p>
            </div>
          </div>
        </div>

        {confirmingCancel ? (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex flex-col gap-3 mt-4">
            <p className="text-sm text-red-700 dark:text-red-400">Cancel this service call?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmingCancel(false)}
                className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold cursor-pointer"
              >
                {isSubmitting ? "Cancelling..." : "Cancel Call"}
              </button>
            </div>
          </div>
        ) : reassignMode ? (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Reassign to</p>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {candidates.map((tech) => (
                  <button
                    key={tech.technicianId}
                    type="button"
                    onClick={() => setSelectedTechId(tech.technicianId)}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedTechId === tech.technicianId
                        ? "border-[#00B4FF] ring-2 ring-[#00B4FF]/20 bg-blue-50/50 dark:bg-blue-500/5"
                        : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {tech.name}
                        {tech.isFreelance && (
                          <span className="ml-1.5 text-[9px] font-bold text-violet-600 bg-violet-100 dark:bg-violet-500/20 dark:text-violet-400 px-1.5 py-0.5 rounded-full align-middle">
                            FREELANCE
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {tech.skillCategory}
                        {tech.distanceKm !== null && ` · ${tech.distanceKm.toFixed(1)} km away`}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tech.isOnDuty
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {tech.isOnDuty ? "On Duty" : "Off Duty"}
                    </span>
                  </button>
                ))}
              {candidates.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No other technicians available.</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setReassignMode(false)}
                className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleReassign}
                disabled={!selectedTechId || isSubmitting}
                className="flex-1 h-10 rounded-lg bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-50 text-white text-sm font-bold cursor-pointer"
              >
                {isSubmitting ? "Reassigning..." : "Confirm Reassign"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-5">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Change Status</p>
              <div className="flex flex-wrap gap-1.5">
                {VENDOR_STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={isSubmitting || s === call.status}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer disabled:cursor-default ${
                      s === call.status
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
            {REASSIGNABLE_STATUSES.includes(call.status) ? (
              <button
                onClick={() => setReassignMode(true)}
                className="w-full h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <ClientIcon icon="ph:arrows-left-right-bold" className="w-4 h-4" />
                {call.technicianId ? "Reassign Technician" : "Assign Technician"}
              </button>
            ) : (
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Work has started — this job can no longer be reassigned.
              </p>
            )}
            <button
              onClick={() => setConfirmingCancel(true)}
              className="w-full h-11 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
            >
              <ClientIcon icon="ph:x-circle-bold" className="w-4 h-4" /> Cancel Service Call
            </button>
          </div>
        )}
      </div>

      {zoomOpen && call.paymentScreenshotUrl && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
          onClick={() => setZoomOpen(false)}
        >
          <div className="relative bg-white rounded-2xl p-4 max-w-xs w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setZoomOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg cursor-pointer"
            >
              <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
            </button>
            <div className="relative w-full aspect-square">
              <Image src={call.paymentScreenshotUrl} alt="Payment screenshot" fill className="object-contain rounded-lg" unoptimized />
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
