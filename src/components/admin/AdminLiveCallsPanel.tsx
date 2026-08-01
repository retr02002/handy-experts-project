"use client";

import React, { useState } from "react";
import { getAllLiveCallsAction, type AdminLiveCall } from "@/actions/livecall.actions";
import { getAllTechniciansForAdminAction, type AdminTechnician } from "@/actions/technician.actions";
import { usePolling } from "@/hooks/usePolling";
import { LiveMap } from "@/components/shared/LiveMap";

const CALLS_POLL_INTERVAL_MS = 15000;
const TECHNICIANS_POLL_INTERVAL_MS = 15000;
// Fallback map center (New Delhi) used only when there are no live calls yet.
const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

const STATUS_COLORS: Record<string, string> = {
  BROADCASTING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  ACCEPTED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  CONVERTED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  EXPIRED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function AdminLiveCallsPanel() {
  const [calls, setCalls] = useState<AdminLiveCall[]>([]);
  const [technicians, setTechnicians] = useState<AdminTechnician[]>([]);
  const [loaded, setLoaded] = useState(false);

  usePolling(async () => {
    const res = await getAllLiveCallsAction();
    if (res.success && res.data) setCalls(res.data);
    setLoaded(true);
  }, CALLS_POLL_INTERVAL_MS);

  usePolling(async () => {
    const res = await getAllTechniciansForAdminAction();
    if (res.success && res.data) setTechnicians(res.data);
  }, TECHNICIANS_POLL_INTERVAL_MS);

  const center = calls.length > 0 ? { lat: calls[0].latitude, lng: calls[0].longitude } : DEFAULT_CENTER;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <LiveMap
          centerLatitude={center.lat}
          centerLongitude={center.lng}
          liveCallMarkers={calls.map((c) => ({
            id: c.id,
            latitude: c.latitude,
            longitude: c.longitude,
            label: `${c.customerName} — ₹${c.total} (${c.status})`,
          }))}
          technicianMarkers={technicians
            .filter((t): t is AdminTechnician & { latitude: number; longitude: number } => t.latitude !== null && t.longitude !== null)
            .map((t) => ({
              id: t.id,
              latitude: t.latitude,
              longitude: t.longitude,
              label: `${t.name} — ${t.vendorName} (${t.isOnDuty ? "on duty" : "off duty"})`,
              isOnDuty: t.isOnDuty,
            }))}
        />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          All Live Calls <span className="text-slate-400 font-medium">({calls.length})</span>
        </h2>
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-2">
          {!loaded ? (
            <div className="p-6 text-center text-slate-400 text-sm">Loading...</div>
          ) : calls.length === 0 ? (
            <div className="p-6 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
              No live calls yet.
            </div>
          ) : (
            calls.map((call) => (
              <div
                key={call.id}
                className="flex flex-col gap-2 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[call.status] ?? ""}`}>
                    {call.status}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">₹{call.total}</span>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{call.customerName}</p>
                <p className="text-xs text-slate-500">
                  {call.city}, {call.pincode}
                </p>
                {call.acceptedByVendorName && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Accepted by {call.acceptedByVendorName}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
