"use client";

import React, { useCallback, useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { usePolling } from "@/hooks/usePolling";
import { getMyServiceCallsForTechnicianAction, type ServiceCallSummary } from "@/actions/servicecall.actions";
import { getMyDutyStatusAction } from "@/actions/technician.actions";
import { ServiceCallsCardGrid } from "./ServiceCallsCardGrid";
import { jobStatusLabel } from "@/lib/jobStatus";
import { TechnicianJobHost } from "./TechnicianJobHost";
import { RevenueTrendChart } from "@/components/shared/charts/RevenueTrendChart";
import { StatusBreakdownChart } from "@/components/shared/charts/StatusBreakdownChart";
import { buildDailyTrend } from "@/lib/chartAggregation";

const CALLS_POLL_INTERVAL_MS = 10000;
const DUTY_POLL_INTERVAL_MS = 15000;

const ACTIVE_STATUSES = ["ASSIGNED", "EN_ROUTE", "IN_PROGRESS"];

export function TechnicianDashboardClient({
  initialCalls,
  initialIsOnDuty,
  technicianName,
}: {
  initialCalls: ServiceCallSummary[];
  initialIsOnDuty: boolean;
  technicianName: string;
}) {
  const [calls, setCalls] = useState(initialCalls);
  const [isOnDuty, setIsOnDuty] = useState(initialIsOnDuty);
  const [detailCall, setDetailCall] = useState<ServiceCallSummary | null>(null);

  const refetchCalls = useCallback(async () => {
    const res = await getMyServiceCallsForTechnicianAction();
    if (res.success && res.data) setCalls(res.data);
  }, []);

  usePolling(refetchCalls, CALLS_POLL_INTERVAL_MS);

  // Keeps the "Available for Jobs" badge honest when duty is toggled from
  // the navbar (which owns its own copy of this state).
  usePolling(async () => {
    const res = await getMyDutyStatusAction();
    if (res.success && res.data) setIsOnDuty(res.data.isOnDuty);
  }, DUTY_POLL_INTERVAL_MS);

  const activeCalls = calls
    .filter((c) => ACTIVE_STATUSES.includes(c.status))
    .sort((a, b) => new Date(a.assignedAt ?? a.createdAt).getTime() - new Date(b.assignedAt ?? b.createdAt).getTime());
  const completedCalls = calls.filter((c) => c.status === "COMPLETED");
  const cancelledCalls = calls.filter((c) => c.status === "CANCELLED");
  const earnings = completedCalls.reduce((sum, c) => sum + c.total, 0);
  const upNext = activeCalls[0] ?? null;

  const earningsTrend = buildDailyTrend(
    completedCalls,
    14,
    (c) => c.completedAt ?? c.createdAt,
    (c) => c.total
  );
  const statusBreakdown = [
    { label: "Active", count: activeCalls.length, color: "#F59E0B" },
    { label: "Completed", count: completedCalls.length, color: "#10B981" },
    { label: "Cancelled", count: cancelledCalls.length, color: "#94A3B8" },
  ];

  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome, {technicianName}!</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Here is your dashboard overview for today.</p>
        </div>
        <div
          className={`flex items-center gap-2 border rounded-full px-4 py-2 shadow-sm w-fit ${
            isOnDuty
              ? "bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800"
              : "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isOnDuty ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isOnDuty ? "Available for Jobs" : "Off Duty"}
          </span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full mt-2">
        {/* Next Job Card (Hero) */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-amber-600 dark:to-orange-700 p-6 md:p-8 rounded-3xl text-white shadow-lg flex flex-col justify-between relative overflow-hidden group min-h-[220px]">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />

          {upNext ? (
            <div className="relative z-10 flex flex-col h-full gap-6">
              <div className="flex justify-between items-start">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Up Next
                </span>
                <span className="text-sm font-medium text-slate-200 dark:text-amber-100 flex items-center gap-1.5 capitalize">
                  <ClientIcon icon="ph:clock" className="w-4 h-4" /> {jobStatusLabel(upNext.status)}
                </span>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{upNext.itemSummary}</h2>
                <p className="text-slate-300 dark:text-amber-100 text-sm flex items-center gap-2">
                  <ClientIcon icon="ph:map-pin" className="w-4 h-4" /> {upNext.address}, {upNext.city}
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                    {upNext.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 dark:text-amber-200">Customer</p>
                    <p className="text-sm font-semibold">{upNext.customerName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailCall(upNext)}
                  className="bg-white text-slate-900 dark:text-amber-900 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-transform cursor-pointer"
                >
                  View Job
                </button>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3 text-center py-6">
              <ClientIcon icon="ph:coffee-fill" className="w-10 h-10 text-white/70" />
              <p className="font-bold">No upcoming jobs right now</p>
              <p className="text-sm text-slate-300 dark:text-amber-100">
                {isOnDuty ? "Stay on duty — new offers will pop up here." : "Go on duty from the top bar to start receiving offers."}
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats Stack */}
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4 hover:border-amber-500/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <ClientIcon icon="ph:wallet-fill" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Earnings</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{earnings.toFixed(0)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <ClientIcon icon="ph:wrench-fill" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jobs Done</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedCalls.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4 hover:border-purple-500/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <ClientIcon icon="ph:activity-fill" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Jobs</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeCalls.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Earnings — Last 14 Days</h2>
          <RevenueTrendChart data={earningsTrend} color="#F59E0B" />
        </div>
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Jobs Breakdown</h2>
          <StatusBreakdownChart data={statusBreakdown} />
        </div>
      </div>

      {/* Activity Timeline / Schedule */}
      <div className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm mt-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today&apos;s Schedule</h2>
        </div>

        {activeCalls.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No active jobs right now.</p>
        ) : (
          <ServiceCallsCardGrid data={activeCalls.slice(0, 6)} onUpdated={refetchCalls} onView={setDetailCall} />
        )}
      </div>

      {detailCall && (
        <TechnicianJobHost
          call={detailCall}
          onClose={() => setDetailCall(null)}
          onChanged={refetchCalls}
        />
      )}

    </div>
  );
}
