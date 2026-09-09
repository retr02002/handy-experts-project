"use client";

import React, { useCallback, useState } from "react";
import { getMyServiceCallsForVendorAction, type ServiceCallSummary } from "@/actions/servicecall.actions";
import { usePolling } from "@/hooks/usePolling";
import { ServiceCallsTable } from "./ServiceCallsTable";
import { ServiceCallsCardGrid } from "./ServiceCallsCardGrid";
import { ServiceCallDetailModal } from "./ServiceCallDetailModal";
import { ViewToggle, type ViewMode } from "@/components/ui/ViewToggle";

const CALLS_POLL_INTERVAL_MS = 15000;

export function VendorServiceCallsClient({ initialCalls }: { initialCalls: ServiceCallSummary[] }) {
  const [calls, setCalls] = useState(initialCalls);
  const [view, setView] = useState<ViewMode>("cards");
  const [detailCall, setDetailCall] = useState<ServiceCallSummary | null>(null);

  const load = useCallback(async () => {
    const res = await getMyServiceCallsForVendorAction();
    if (res.success && res.data) setCalls(res.data);
  }, []);

  usePolling(load, CALLS_POLL_INTERVAL_MS);

  const unassignedCount = calls.filter((c) => c.status === "UNASSIGNED").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Service Calls</h1>
          {unassignedCount > 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1 font-semibold">
              {unassignedCount} job{unassignedCount === 1 ? "" : "s"} waiting for a technician
            </p>
          )}
        </div>
        {calls.length > 0 && <ViewToggle view={view} onChange={setView} />}
      </div>

      {calls.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-sm text-slate-400">No service calls yet — accept a live call to get started.</p>
        </div>
      ) : view === "table" ? (
        <ServiceCallsTable data={calls} onManage={setDetailCall} />
      ) : (
        <ServiceCallsCardGrid data={calls} onManage={setDetailCall} />
      )}

      {detailCall && (
        <ServiceCallDetailModal call={detailCall} onClose={() => setDetailCall(null)} onChanged={load} />
      )}
    </div>
  );
}
