"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { usePolling } from "@/hooks/usePolling";
import { MAP_PROVIDERS, formatDistance, formatEta } from "@/lib/mapLinks";
import { haversineKm } from "@/lib/geo";
import { getJobRouteAction, type JobRoute } from "@/actions/tracking.actions";

const LiveMap = dynamic(() => import("./LiveMap").then((m) => m.LiveMap), {
  ssr: false,
  loading: () => <div className="w-full h-[240px] bg-slate-100 dark:bg-slate-800 animate-pulse" />,
});

const ROUTE_POLL_INTERVAL_MS = 15000;

function agoLabel(iso: string): string {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  return minutes < 60 ? `${minutes} min ago` : `${Math.round(minutes / 60)} hr ago`;
}

interface Props {
  serviceCallId: string;
  /** Where the job is — always known, so the map has something to show even with no technician yet. */
  customerLatitude: number;
  customerLongitude: number;
  customerLabel: string;
  technicianLabel?: string;
  height?: string;
  /** "customer" hides the vendor-centric centre dot and reframes the copy. */
  viewer: "customer" | "technician";
  /**
   * The viewer's own device position. Used only when the server has no route
   * to offer — a technician looking at their own job still gets a pin and a
   * straight-line distance from live GPS even before any position is stored.
   */
  viewerPosition?: { lat: number; lng: number } | null;
  /** Shown instead of "not available yet" while the host is still locating. */
  locating?: boolean;
  /** Renders a retry affordance when there's no position from either source. */
  onRetryLocation?: () => void;
  /**
   * The technician has arrived and work has begun. Distance and ETA stop
   * meaning anything useful at that point — "5 m · approx 1 min" while
   * someone is already inside the house reads as a bug.
   */
  onSite?: boolean;
}

/**
 * Live job map: both pins, the road route between them, distance/ETA, and a
 * way out to a real navigation app. Position updates arrive by polling on
 * the same cadence as everything else here — the technician's device writes
 * a durable position every ~12s while on duty, so the dot moves in steps
 * rather than gliding. The "updated Xs ago" stamp keeps that honest instead
 * of implying a real-time feed.
 */
export function JobTrackingMap({
  serviceCallId,
  customerLatitude,
  customerLongitude,
  customerLabel,
  technicianLabel = "Technician",
  height = "240px",
  viewer,
  viewerPosition = null,
  locating = false,
  onRetryLocation,
  onSite = false,
}: Props) {
  const [route, setRoute] = useState<JobRoute | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);
  const providerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await getJobRouteAction(serviceCallId);
    if (res.success) setRoute(res.data ?? null);
    setLoaded(true);
  }, [serviceCallId]);

  usePolling(load, ROUTE_POLL_INTERVAL_MS, [serviceCallId]);

  useEffect(() => {
    if (!providerOpen) return;
    const onClickAway = (e: MouseEvent) => {
      if (providerRef.current && !providerRef.current.contains(e.target as Node)) setProviderOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, [providerOpen]);

  // A position the server has judged too old is still worth drawing as a
  // last-known dot, but it must not drive the route line, the distance, or
  // the ETA — those would assert something about right now.
  const isStale = route?.isStale ?? false;
  const serverPosition = route ? { lat: route.technicianLatitude, lng: route.technicianLongitude } : null;
  const livePosition = route && !isStale ? serverPosition : null;

  // A customer's own device position says nothing about where their
  // technician is, so the local fallback only applies on the technician's
  // own screen. It does outrank a stale stored fix, though — a technician's
  // own handset is the better authority on where that technician is.
  const localPosition = viewer === "technician" ? viewerPosition : null;
  const moverPosition = livePosition ?? localPosition ?? serverPosition;
  const showingStalePosition = !livePosition && !localPosition && !!serverPosition;

  const localDistanceKm = localPosition
    ? haversineKm(localPosition.lat, localPosition.lng, customerLatitude, customerLongitude)
    : null;

  // The technician navigates to the customer; the customer watches the
  // technician come to them — so "open in maps" points at the other party.
  const destination =
    viewer === "technician"
      ? { lat: customerLatitude, lng: customerLongitude, label: customerLabel }
      : livePosition
        ? { lat: livePosition.lat, lng: livePosition.lng, label: technicianLabel }
        : { lat: customerLatitude, lng: customerLongitude, label: customerLabel };

  return (
    <div className="shrink-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A]">
      <LiveMap
        height={height}
        centerLatitude={moverPosition?.lat ?? customerLatitude}
        centerLongitude={moverPosition?.lng ?? customerLongitude}
        showCenterMarker={false}
        fitToMarkers
        routeLine={isStale ? undefined : route?.coordinates}
        liveCallMarkers={[
          { id: "customer", latitude: customerLatitude, longitude: customerLongitude, label: customerLabel },
        ]}
        technicianMarkers={
          moverPosition
            ? [
                {
                  id: "technician",
                  latitude: moverPosition.lat,
                  longitude: moverPosition.lng,
                  label: viewer === "technician" ? "You" : technicianLabel,
                  isOnDuty: !showingStalePosition,
                  skillCategory: showingStalePosition
                    ? `Last known position · ${agoLabel(route!.updatedAt)}`
                    : viewer === "customer"
                      ? "Your technician"
                      : "You",
                  phone: "",
                },
              ]
            : []
        }
      />

      <div className="p-3 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex-1 min-w-0">
          {onSite ? (
            <>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {viewer === "customer" ? "Your technician is on site" : "You're on site"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">Work in progress</p>
            </>
          ) : route && !isStale ? (
            <>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {formatDistance(route.distanceKm)} · approx {formatEta(route.durationMin)}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {route.source === "straight" ? "Estimated — live route unavailable" : "Live route"} · updated{" "}
                {agoLabel(route.updatedAt)}
              </p>
            </>
          ) : localDistanceKm !== null ? (
            <>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {formatDistance(localDistanceKm)} away
              </p>
              <p className="text-[10px] text-slate-400 truncate">Straight line from your device</p>
            </>
          ) : showingStalePosition ? (
            <>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400 truncate">Not tracking right now</p>
              <p className="text-[10px] text-slate-400 truncate">
                {viewer === "customer" ? "Your technician's" : "Your"} position last updated{" "}
                {agoLabel(route!.updatedAt)}
                {viewer === "technician" && " — turn location back on"}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {!loaded || locating ? "Locating..." : "Live tracking not available yet"}
              </p>
              {loaded && !locating && (
                <p className="text-[10px] text-slate-400 truncate">
                  {viewer === "customer" ? (
                    "It starts once your technician is on duty and on the way."
                  ) : onRetryLocation ? (
                    <button type="button" onClick={onRetryLocation} className="font-bold text-amber-600 underline">
                      Retry location
                    </button>
                  ) : (
                    "Go on duty so your position can be shared."
                  )}
                </p>
              )}
            </>
          )}
        </div>

        <div className="relative shrink-0" ref={providerRef}>
          <button
            type="button"
            onClick={() => setProviderOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] text-white text-sm font-bold transition-colors cursor-pointer"
          >
            <ClientIcon icon="ph:navigation-arrow-fill" className="w-4 h-4" />
            Open in Maps
          </button>

          {providerOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-52 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-20">
              {MAP_PROVIDERS.map((p) => (
                <a
                  key={p.id}
                  href={p.url(destination.lat, destination.lng, destination.label)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setProviderOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border-b last:border-b-0 border-slate-100 dark:border-slate-800"
                >
                  <ClientIcon icon={p.icon} className="w-4 h-4 text-slate-400 shrink-0" />
                  {p.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
