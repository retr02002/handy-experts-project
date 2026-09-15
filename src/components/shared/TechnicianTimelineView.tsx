"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { jobStatusLabel } from "@/lib/jobStatus";
import {
  getTechnicianTimelineAction,
  type TechnicianTimeline,
  type TechnicianTimelineEvent,
} from "@/actions/technician.actions";
import { reverseGeocodeBatchAction, type TimelinePointLabel } from "@/actions/location.actions";

const LiveMap = dynamic(() => import("./LiveMap").then((m) => m.LiveMap), {
  ssr: false,
  loading: () => <div className="w-full h-[320px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />,
});

const PAGE_SIZE = 20;

function todayIso(): string {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local
}

function labelFor(eventType: TechnicianTimelineEvent["eventType"]): string {
  if (eventType === "DUTY_ON") return "Clocked in";
  if (eventType === "DUTY_OFF") return "Clocked off";
  return "Location update";
}

function iconFor(eventType: TechnicianTimelineEvent["eventType"]): string {
  if (eventType === "DUTY_ON") return "ph:play-circle-fill";
  if (eventType === "DUTY_OFF") return "ph:stop-circle-fill";
  return "ph:map-pin-fill";
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

/**
 * The "Google Maps timeline" for one technician, one day at a time: the
 * day's travel path on a map (reusing LiveMap's existing routeLine prop —
 * no new map primitive), clock-in/out markers, a one-by-one event list with
 * on-demand reverse-geocoded pincodes, and the jobs they touched that day.
 * Shared between the vendor's and admin's detail pages — identical view,
 * different authorization already enforced server-side.
 */
export function TechnicianTimelineView({ technicianId }: { technicianId: string }) {
  const [date, setDate] = useState(todayIso());
  const [timeline, setTimeline] = useState<TechnicianTimeline | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [labels, setLabels] = useState<Map<string, TimelinePointLabel>>(new Map());
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setPage(1);
    getTechnicianTimelineAction(technicianId, date).then((res) => {
      if (res.success && res.data) setTimeline(res.data);
      setLoaded(true);
    });
  }, [technicianId, date]);

  const events = useMemo(() => timeline?.events ?? [], [timeline]);
  const pageEvents = useMemo(() => {
    // Newest first for the list — most relevant "what's happening" first.
    const reversed = [...events].reverse();
    return reversed.slice(0, page * PAGE_SIZE);
  }, [events, page]);

  // Reverse-geocode only the page currently rendered — never the whole day
  // eagerly. Points already resolved (by rounded key) are skipped.
  useEffect(() => {
    const unresolved = pageEvents.filter((e) => !labels.has(`${e.latitude.toFixed(3)},${e.longitude.toFixed(3)}`));
    if (unresolved.length === 0) return;
    setGeocoding(true);
    reverseGeocodeBatchAction(unresolved.map((e) => ({ lat: e.latitude, lng: e.longitude }))).then((res) => {
      if (res.success && res.data) {
        setLabels((prev) => {
          const next = new Map(prev);
          for (const l of res.data!) next.set(l.key, l);
          return next;
        });
      }
      setGeocoding(false);
    });
    // pageEvents/labels are both derived from state already captured above —
    // re-running only when the page grows avoids an infinite geocode loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageEvents.length]);

  const routeLine: [number, number][] = events
    .filter((e) => e.eventType === "PING")
    .map((e) => [e.longitude, e.latitude]);

  const clockMarkers = events.filter((e) => e.eventType === "DUTY_ON" || e.eventType === "DUTY_OFF");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={date}
          max={todayIso()}
          onChange={(e) => setDate(e.target.value)}
          className="h-10 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        {date !== todayIso() && (
          <button
            type="button"
            onClick={() => setDate(todayIso())}
            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Jump to today
          </button>
        )}
      </div>

      {!loaded ? (
        <div className="h-[320px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
      ) : events.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 text-center">
          <ClientIcon icon="ph:map-trifold" className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No location activity on this date.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <LiveMap
            height="320px"
            centerLatitude={events[events.length - 1].latitude}
            centerLongitude={events[events.length - 1].longitude}
            showCenterMarker={false}
            fitToMarkers
            fitPoints={events.map((e) => [e.longitude, e.latitude] as [number, number])}
            routeLine={routeLine.length > 1 ? routeLine : undefined}
            liveCallMarkers={clockMarkers.map((e) => ({
              id: e.id,
              latitude: e.latitude,
              longitude: e.longitude,
              label: `${labelFor(e.eventType)} · ${timeOf(e.createdAt)}`,
              // Clocking on is a natural "start" point on the trail, worth
              // distinguishing at a glance; clocking off is a deliberate
              // action, not a disconnection, so it stays the default blue
              // rather than reusing red (reserved for genuine staleness).
              tone: e.eventType === "DUTY_ON" ? "green" : "blue",
            }))}
          />
        </div>
      )}

      {/* Jobs that day */}
      {timeline && timeline.jobs.length > 0 && (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Jobs that day</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {timeline.jobs.map((j) => (
              <div key={j.id} className="p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{j.itemSummary}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {j.customerName} &middot; {j.city}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 capitalize">{jobStatusLabel(j.status)}</p>
                  <p className="text-[10px] text-slate-400">₹{j.total.toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* One-by-one event list */}
      {events.length > 0 && (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Travel history</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pageEvents.map((e) => {
              const key = `${e.latitude.toFixed(3)},${e.longitude.toFixed(3)}`;
              const label = labels.get(key);
              const isDuty = e.eventType !== "PING";
              return (
                <div key={e.id} className="p-3.5 flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isDuty ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    <ClientIcon icon={iconFor(e.eventType)} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${isDuty ? "font-bold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
                      {labelFor(e.eventType)}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {label ? `${label.localArea}${label.pincode ? ` · ${label.pincode}` : ""}` : "Resolving location..."}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 shrink-0">{timeOf(e.createdAt)}</p>
                </div>
              );
            })}
          </div>
          {pageEvents.length < events.length && (
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={geocoding}
              className="w-full py-3 text-xs font-bold text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800/40 disabled:opacity-60 cursor-pointer transition-colors"
            >
              {geocoding ? "Loading..." : `Show more (${events.length - pageEvents.length} remaining)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
