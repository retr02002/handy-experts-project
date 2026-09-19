"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getMyServiceCallsForVendorAction, type ServiceCallSummary } from "@/actions/servicecall.actions";
import { usePolling } from "@/hooks/usePolling";
import { ServiceCallsTable } from "./ServiceCallsTable";
import { ServiceCallsCardGrid } from "./ServiceCallsCardGrid";
import { ServiceCallDetailModal } from "./ServiceCallDetailModal";
import { ViewToggle, type ViewMode } from "@/components/ui/ViewToggle";

// Short enough that a technician accepting/starting/completing a job shows
// up on the vendor's dashboard within a handful of seconds instead of up to
// 15s — there's no push/websocket mechanism in this app, so this poll
// cadence is the whole mechanism. Not pushed down to 3s: with several
// vendor dashboards open at once, that was found to create enough
// concurrent DB load to queue out the technician's own job actions behind
// this polling traffic — 5s is the safer middle ground at real scale.
const CALLS_POLL_INTERVAL_MS = 5000;

export function VendorServiceCallsClient({ initialCalls }: { initialCalls: ServiceCallSummary[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Deep link from the "Awaiting Technician" list (LiveCallsPanel) — lands
  // straight in the existing assign-a-technician flow instead of making the
  // vendor find the call and click "Manage" themselves. Read once on mount,
  // from the server-provided initialCalls, so opening the modal doesn't need
  // a setState-in-effect round trip.
  const assignId = searchParams.get("assign");

  const [calls, setCalls] = useState(initialCalls);
  const [view, setView] = useState<ViewMode>("cards");
  const [detailCall, setDetailCall] = useState<ServiceCallSummary | null>(
    () => initialCalls.find((c) => c.id === assignId) ?? null
  );
  const [autoOpenAssign, setAutoOpenAssign] = useState(() => initialCalls.some((c) => c.id === assignId));

  const load = useCallback(async () => {
    const res = await getMyServiceCallsForVendorAction();
    if (res.success && res.data) setCalls(res.data);
  }, []);

  usePolling(load, CALLS_POLL_INTERVAL_MS);

  useEffect(() => {
    if (assignId) router.replace(pathname);
  }, [assignId, router, pathname]);

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
        <ServiceCallDetailModal
          call={detailCall}
          onClose={() => {
            setDetailCall(null);
            setAutoOpenAssign(false);
          }}
          onChanged={load}
          autoOpenAssign={autoOpenAssign}
        />
      )}
    </div>
  );
}
