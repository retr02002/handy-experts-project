"use client";

import React, { useEffect, useState } from "react";
import { getAllServiceCallsAction, type AdminServiceCallSummary } from "@/actions/servicecall.actions";
import { ServiceCallsTable } from "@/components/admin/ServiceCallsTable";
import { ServiceCallsCardGrid } from "@/components/admin/ServiceCallsCardGrid";
import { ViewToggle, type ViewMode } from "@/components/ui/ViewToggle";

export default function ServiceCallsPage() {
  const [data, setData] = useState<AdminServiceCallSummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<ViewMode>("table");

  useEffect(() => {
    const timer = setTimeout(() => {
      getAllServiceCallsAction().then((res) => {
        if (res.success && res.data) setData(res.data);
        setLoaded(true);
      });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Service Calls</h1>
        {data.length > 0 && <ViewToggle view={view} onChange={setView} />}
      </div>

      {!loaded ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
      ) : view === "table" ? (
        <ServiceCallsTable data={data} />
      ) : (
        <ServiceCallsCardGrid data={data} />
      )}
    </div>
  );
}
