"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getMyServiceCallsForTechnicianAction } from "@/actions/servicecall.actions";
import type { ServiceCallSummary } from "@/actions/servicecall.actions";
import { ServiceCallsTable } from "@/components/technician/ServiceCallsTable";

export default function TechnicianServiceCallsPage() {
  const [calls, setCalls] = useState<ServiceCallSummary[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const res = await getMyServiceCallsForTechnicianAction();
    if (res.success && res.data) setCalls(res.data);
    setLoaded(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Service Calls</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your assigned service calls and tasks.</p>
        </div>
      </div>

      {!loaded ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
      ) : (
        <ServiceCallsTable data={calls} onUpdated={load} />
      )}
    </div>
  );
}
