"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { evaluateGeofence, formatDistance, type GeoFix, type GeofenceResult } from "@/lib/geo";
import { JOB_GEOFENCE_RADIUS_METERS, GEOFENCE_ACCURACY_GRACE_METERS } from "@/lib/constants";

interface Props {
  customerLat: number | null;
  customerLng: number | null;
  /** True when a vendor/admin has waived the check for this job. */
  bypass: boolean;
  /** Verb used in the copy — "start" or "complete". */
  action: "start" | "complete";
  onChange: (fix: GeoFix | null, result: GeofenceResult) => void;
}

type Phase = "locating" | "ready" | "denied" | "unsupported";

/**
 * Shows the technician where they stand relative to the job before they try
 * the gate, so an out-of-range block is never a surprise at submit time.
 * The same evaluateGeofence() the server uses runs here too — this is the
 * preview, the server call is the decision.
 */
export function GeofenceGate({ customerLat, customerLng, bypass, action, onChange }: Props) {
  const [phase, setPhase] = useState<Phase>("locating");
  const [result, setResult] = useState<GeofenceResult | null>(null);
  // Bumped by the "re-check" button to re-run the subscription effect.
  const [attempt, setAttempt] = useState(0);

  // Synced in an effect rather than assigned during render: the parent
  // hands us a fresh closure on every keystroke in the PIN field, and we
  // must not tear down and restart watchPosition each time — that would
  // thrash the GPS and reset the accuracy the device has converged on.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const applyFix = useCallback(
    (fix: GeoFix | null) => {
      const next = evaluateGeofence({ latitude: customerLat, longitude: customerLng }, fix, {
        radiusM: JOB_GEOFENCE_RADIUS_METERS,
        accuracyGraceM: GEOFENCE_ACCURACY_GRACE_METERS,
        bypass,
      });
      setResult(next);
      onChangeRef.current(fix, next);
    },
    [customerLat, customerLng, bypass]
  );

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      // Deferred rather than set inline: state updates belong in the
      // effect's async edges, not its synchronous body.
      const timer = setTimeout(() => {
        setPhase("unsupported");
        applyFix(null);
      }, 0);
      return () => clearTimeout(timer);
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPhase("ready");
        applyFix({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracyM: pos.coords.accuracy });
      },
      () => {
        setPhase("denied");
        applyFix(null);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [applyFix, attempt]);

  const recheck = () => {
    setPhase("locating");
    setAttempt((a) => a + 1);
  };

  const tone: "ok" | "warn" | "bad" =
    bypass || result?.reason === "NO_CUSTOMER_COORDS"
      ? "ok"
      : phase === "locating"
        ? "warn"
        : result?.ok
          ? "ok"
          : "bad";

  const styles = {
    ok: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
    warn: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400",
    bad: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400",
  }[tone];

  const icon =
    tone === "ok" ? "ph:map-pin-fill" : tone === "warn" ? "svg-spinners:180-ring" : "ph:warning-circle-fill";

  const message = (() => {
    if (bypass) return "Location check waived for this job.";
    if (result?.reason === "NO_CUSTOMER_COORDS") return "No exact pin on this address — location check skipped.";
    if (phase === "unsupported") return "This device can't share a location.";
    if (phase === "denied") return "Location is off. Turn it on so we can confirm you're at the site.";
    if (phase === "locating") return "Finding your location…";
    if (result?.distanceM === null) return "Waiting for a location fix…";
    if (result?.ok) return `You're ${formatDistance(result.distanceM!)} from the site.`;
    return `You're ${formatDistance(result?.distanceM ?? 0)} away — move within ${JOB_GEOFENCE_RADIUS_METERS} m to ${action}.`;
  })();

  return (
    <div className="flex flex-col gap-2">
      <div className={`flex items-center gap-2.5 rounded-xl border px-3.5 min-h-14 py-2.5 ${styles}`}>
        <ClientIcon icon={icon} className="w-5 h-5 shrink-0" />
        <p className="text-xs font-semibold leading-snug min-w-0">{message}</p>
      </div>
      {!bypass && (phase === "denied" || phase === "unsupported" || (result && !result.ok)) && (
        <button
          type="button"
          onClick={recheck}
          className="h-11 w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold cursor-pointer hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
        >
          <ClientIcon icon="ph:crosshair-simple-bold" className="w-4 h-4" />
          Re-check my location
        </button>
      )}
    </div>
  );
}
