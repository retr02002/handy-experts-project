"use client";

import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { usePolling } from "@/hooks/usePolling";
import {
  getMyServiceCallsForTechnicianAction,
  getMyAvailableJobsAction,
  claimServiceCallAction,
  type ServiceCallSummary,
  type TechnicianJobOffer,
} from "@/actions/servicecall.actions";
import { ServiceCallsTable } from "./ServiceCallsTable";
import { ServiceCallsCardGrid } from "./ServiceCallsCardGrid";
import { TechnicianJobHost } from "./TechnicianJobHost";
import { ViewToggle, type ViewMode } from "@/components/ui/ViewToggle";

const CALLS_POLL_INTERVAL_MS = 12000;
const JOBS_POLL_INTERVAL_MS = 12000;

export function TechnicianServiceCallsClient({
  initialCalls,
  initialAvailableJobs,
}: {
  initialCalls: ServiceCallSummary[];
  initialAvailableJobs: TechnicianJobOffer[];
}) {
  const [calls, setCalls] = useState(initialCalls);
  const [availableJobs, setAvailableJobs] = useState(initialAvailableJobs);
  const [view, setView] = useState<ViewMode>("cards");
  const [detailCall, setDetailCall] = useState<ServiceCallSummary | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await getMyServiceCallsForTechnicianAction();
    if (res.success && res.data) setCalls(res.data);
  }, []);

  const loadJobs = useCallback(async () => {
    const res = await getMyAvailableJobsAction();
    if (res.success && res.data) setAvailableJobs(res.data);
  }, []);

  usePolling(load, CALLS_POLL_INTERVAL_MS);
  usePolling(loadJobs, JOBS_POLL_INTERVAL_MS);

  const claim = async (serviceCallId: string) => {
    setClaimingId(serviceCallId);
    try {
      const res = await claimServiceCallAction(serviceCallId);
      if (!res.success) {
        toast.error(res.error || "Couldn't take this job");
      } else {
        toast.success("Job accepted — it's yours");
      }
      await Promise.all([load(), loadJobs()]);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Service Calls</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your assigned service calls and pick up new work.
          </p>
        </div>
        {calls.length > 0 && <ViewToggle view={view} onChange={setView} />}
      </div>

      {availableJobs.length > 0 && (
        <div className="bg-amber-50/60 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <ClientIcon icon="ph:hand-waving-fill" className="w-4 h-4" />
            Available Jobs ({availableJobs.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableJobs.map((job) => (
              <div
                key={job.serviceCallId}
                className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate min-w-0">{job.itemSummary}</h3>
                  <span className="text-sm font-bold text-slate-900 dark:text-white shrink-0">₹{job.total}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {job.city}, {job.pincode}
                  {job.distanceKm !== null && ` · ${job.distanceKm.toFixed(1)} km away`}
                </p>
                <button
                  type="button"
                  onClick={() => claim(job.serviceCallId)}
                  disabled={claimingId === job.serviceCallId}
                  className="mt-1 w-full h-9 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {claimingId === job.serviceCallId ? "Taking..." : "Accept Job"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {calls.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-sm text-slate-400">
            No service calls yet — accept a job above, or go on duty to start receiving them.
          </p>
        </div>
      ) : view === "table" ? (
        <ServiceCallsTable data={calls} onUpdated={load} onView={setDetailCall} />
      ) : (
        <ServiceCallsCardGrid data={calls} onUpdated={load} onView={setDetailCall} />
      )}

      {detailCall && (
        <TechnicianJobHost
          call={detailCall}
          onClose={() => setDetailCall(null)}
          onChanged={() => {
            load();
            loadJobs();
          }}
        />
      )}
    </div>
  );
}
