"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getMyServiceCallsForVendorAction, type ServiceCallSummary } from "@/actions/servicecall.actions";
import { ServiceCallsTable } from "@/components/vendor/ServiceCallsTable";
import { ServiceCallsCardGrid } from "@/components/vendor/ServiceCallsCardGrid";
import { ServiceCallDetailModal } from "@/components/vendor/ServiceCallDetailModal";
import { ViewToggle, type ViewMode } from "@/components/ui/ViewToggle";

export default function VendorServiceCallsPage() {
  const [calls, setCalls] = useState<ServiceCallSummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<ViewMode>("cards");
  const [detailCall, setDetailCall] = useState<ServiceCallSummary | null>(null);

  const load = useCallback(async () => {
    const res = await getMyServiceCallsForVendorAction();
    if (res.success && res.data) setCalls(res.data);
    setLoaded(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Service Calls</h1>
        {calls.length > 0 && <ViewToggle view={view} onChange={setView} />}
      </div>

      {!loaded ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
      ) : calls.length === 0 ? (
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
