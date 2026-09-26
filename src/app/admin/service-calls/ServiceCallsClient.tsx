"use client";

import React, { useState } from "react";
import { type AdminServiceCallSummary } from "@/actions/servicecall.actions";
import { ServiceCallsTable } from "@/components/admin/ServiceCallsTable";
import { ServiceCallsCardGrid } from "@/components/admin/ServiceCallsCardGrid";
import { ViewToggle, type ViewMode } from "@/components/ui/ViewToggle";

export function ServiceCallsClient({ initialData }: { initialData: AdminServiceCallSummary[] }) {
  const [data] = useState<AdminServiceCallSummary[]>(initialData);
  const [view, setView] = useState<ViewMode>("cards");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Service Calls</h1>
        {data.length > 0 && <ViewToggle view={view} onChange={setView} />}
      </div>

      {data.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm">No service calls found.</div>
      ) : view === "table" ? (
        <ServiceCallsTable data={data} />
      ) : (
        <ServiceCallsCardGrid data={data} />
      )}
    </div>
  );
}
