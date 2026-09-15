"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { StarRating } from "@/components/shared/StarRating";
import { ChatThread } from "@/components/shared/ChatThread";
import { JobItemsEditor } from "@/components/vendor/JobItemsEditor";
import { jobStatusLabel } from "@/lib/jobStatus";
import {
  getReassignCandidatesAction,
  reassignServiceCallAction,
  updateServiceCallStatusAction,
  type ServiceCallFullDetail,
  type ReassignCandidate,
} from "@/actions/servicecall.actions";
import { resetJobPinAttemptsAction } from "@/actions/servicejob.actions";

// Same three statuses ServiceCallDetailModal (vendor) gates reassignment and
// item-editing on — "work hasn't started yet."
const PRE_START_STATUSES = ["UNASSIGNED", "ASSIGNED", "EN_ROUTE"];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

/**
 * Admin's full-oversight view of one job: everything a vendor sees, plus the
 * completion report, the customer's review, and the decline history every
 * offer this job generated (captured since the start, never surfaced
 * anywhere until now) — and a read-only look at the customer↔technician
 * chat. Control is vendor-equivalent, reusing the same mutations a vendor
 * would call (now admin-aware) rather than a parallel action set.
 */
export function AdminServiceCallDetailClient({ initialDetail }: { initialDetail: ServiceCallFullDetail }) {
  const [detail, setDetail] = useState(initialDetail);
  const [editingItems, setEditingItems] = useState(false);
  const [reassigning, setReassigning] = useState(false);
  const [candidates, setCandidates] = useState<ReassignCandidate[] | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const { summary, report, review, offerHistory } = detail;
  const canModify = PRE_START_STATUSES.includes(summary.status);

  const openReassign = async () => {
    setReassigning(true);
    if (candidates === null) {
      const res = await getReassignCandidatesAction(summary.id);
      setCandidates(res.success && res.data ? res.data : []);
    }
  };

  const reassign = async (technicianId: string) => {
    setIsBusy(true);
    try {
      const res = await reassignServiceCallAction(summary.id, technicianId);
      if (!res.success) {
        toast.error(res.error || "Couldn't reassign this job");
        return;
      }
      toast.success("Job reassigned");
      setReassigning(false);
      setCandidates(null);
      window.location.reload();
    } finally {
      setIsBusy(false);
    }
  };

  const cancelJob = async () => {
    if (!confirm("Cancel this job? This can't be undone.")) return;
    setIsBusy(true);
    try {
      const res = await updateServiceCallStatusAction(summary.id, "CANCELLED");
      if (!res.success) {
        toast.error(res.error || "Couldn't cancel this job");
        return;
      }
      toast.success("Job cancelled");
      window.location.reload();
    } finally {
      setIsBusy(false);
    }
  };

  const resetPin = async () => {
    setIsBusy(true);
    try {
      const res = await resetJobPinAttemptsAction(summary.id);
      if (!res.success) {
        toast.error(res.error || "Couldn't reset PIN attempts");
        return;
      }
      toast.success("PIN attempts reset");
      setDetail((prev) => ({ ...prev, summary: { ...prev.summary, pinAttempts: 0 } }));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div className="flex items-start gap-3">
        <Link
          href="/admin/service-calls"
          className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
        >
          <ClientIcon icon="ph:arrow-left-bold" className="w-4 h-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">{summary.itemSummary}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
              {jobStatusLabel(summary.status)}
            </span>
            <span className="text-xs text-slate-400">{formatDate(summary.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Core details */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Customer</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{summary.customerName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{summary.customerPhone}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">
            {summary.address}, {summary.city}, {summary.state} {summary.pincode}
          </p>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vendor & Technician</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{summary.vendorName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{summary.vendorPhone ?? "—"}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {summary.technicianName ? `Technician: ${summary.technicianName}` : "Not yet assigned"}
          </p>
        </div>
      </div>

      {/* Items + PIN */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
        {editingItems ? (
          <JobItemsEditor
            serviceCallId={summary.id}
            items={summary.items}
            paidTotal={summary.total}
            onClose={() => setEditingItems(false)}
            onSaved={() => {
              setEditingItems(false);
              window.location.reload();
            }}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Items</p>
              {canModify && (
                <button
                  type="button"
                  onClick={() => setEditingItems(true)}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1 text-sm">
              {summary.items.map((i, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>
                    {i.packageName} {i.quantity > 1 ? `x${i.quantity}` : ""}
                  </span>
                  <span className="font-medium">₹{(i.unitPrice * i.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Total</span>
                <span>₹{summary.total.toFixed(0)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">PIN attempts: {summary.pinAttempts}/5</p>
              {summary.pinAttempts > 0 && (
                <button
                  type="button"
                  onClick={resetPin}
                  disabled={isBusy}
                  className="text-xs font-bold text-amber-600 hover:underline disabled:opacity-50 cursor-pointer"
                >
                  Reset attempts
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Report */}
      {report && (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Completion Report</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
            {report.completionStatus.replace(/_/g, " ").toLowerCase()}
          </p>
          {report.holdReason && <p className="text-xs text-amber-600 mt-1">Hold reason: {report.holdReason}</p>}
          {report.newVisitAt && <p className="text-xs text-slate-500 mt-1">Next visit: {formatDate(report.newVisitAt)}</p>}
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 break-words">{report.remarks}</p>
        </div>
      )}

      {/* Review */}
      {review && (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Review</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Technician</span>
                <StarRating value={review.technicianRating} />
              </div>
              {review.technicianComment && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 break-words">{review.technicianComment}</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Service</span>
                <StarRating value={review.serviceRating} />
              </div>
              {review.serviceComment && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 break-words">{review.serviceComment}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Offer / decline history — captured since day one, never shown anywhere until now */}
      {offerHistory.length > 0 && (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Offer History</p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {offerHistory.map((o, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{o.technicianName}</p>
                  {o.declineReason && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5 break-words">Declined: {o.declineReason}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 capitalize">{o.status.toLowerCase()}</p>
                  <p className="text-[10px] text-slate-400">{formatDate(o.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Read-only chat */}
      {summary.technicianName && (
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Conversation</p>
          <ChatThread serviceCallId={summary.id} counterpartName={summary.technicianName} readOnly hideHeader />
        </div>
      )}

      {/* Controls */}
      {canModify && (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col gap-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Controls</p>

          {reassigning ? (
            <div className="flex flex-col gap-2">
              {candidates === null ? (
                <p className="text-sm text-slate-400">Loading candidates...</p>
              ) : candidates.length === 0 ? (
                <p className="text-sm text-slate-400">No eligible technicians right now.</p>
              ) : (
                candidates.map((c) => (
                  <button
                    key={c.technicianId}
                    type="button"
                    onClick={() => reassign(c.technicianId)}
                    disabled={isBusy}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 disabled:opacity-50 text-left cursor-pointer transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{c.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {c.skillCategory} {c.isFreelance ? "· Freelance" : ""} {!c.matchesSkill ? "· different category" : ""}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold shrink-0 ${c.isOnDuty ? "text-emerald-600" : "text-slate-400"}`}
                    >
                      {c.isOnDuty ? "On duty" : "Off duty"}
                    </span>
                  </button>
                ))
              )}
              <button
                type="button"
                onClick={() => setReassigning(false)}
                className="text-xs font-bold text-slate-500 hover:underline self-start cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openReassign}
                disabled={isBusy}
                className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold cursor-pointer transition-colors"
              >
                Reassign
              </button>
              <button
                type="button"
                onClick={cancelJob}
                disabled={isBusy}
                className="h-10 px-4 rounded-xl border-2 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm font-bold disabled:opacity-60 cursor-pointer"
              >
                Cancel Job
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
