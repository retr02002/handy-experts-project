"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  updateTechnicianLocationAction,
  setTechnicianDutyStatusAction,
  getMyDutyStatusAction,
} from "@/actions/technician.actions";
import { usePolling } from "@/hooks/usePolling";

// Ephemeral GPS ticks aren't written to the DB on every update — throttle
// the durable write so there's always a reasonable "last known position"
// without hammering TechnicianLocation on every watchPosition callback.
// 12s rather than 25s so a customer watching the live map sees the dot move
// at a believable rate; the cost is roughly double the writes and GPS
// wake-ups while on duty.
const LOCATION_REPORT_INTERVAL_MS = 12000;
const DUTY_POLL_INTERVAL_MS = 15000;

export function OnDutyToggle() {
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastReportRef = useRef(0);

  /**
   * Starts reporting position, if it isn't already.
   *
   * This has to be callable outside the "go on duty" click. The watch is
   * torn down on unmount, so every route change or reload used to kill it
   * permanently: duty stayed true in the DB while the stored position froze
   * at wherever the technician stood when they first tapped the toggle,
   * which is how a six-hour-old fix ends up being served as live tracking.
   */
  const startWatch = useCallback(() => {
    if (watchIdRef.current !== null || !navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        const now = Date.now();
        if (now - lastReportRef.current < LOCATION_REPORT_INTERVAL_MS) return;
        lastReportRef.current = now;
        updateTechnicianLocationAction(p.coords.latitude, p.coords.longitude);
      },
      () => {}, // duty is already established — a later watch failure isn't fatal
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
  }, []);

  const stopWatch = useCallback(() => {
    if (watchIdRef.current === null) return;
    navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  }, []);

  // Hydrates from (and stays in sync with) the real persisted value instead
  // of trusting local state alone — otherwise a remount (e.g. a route change)
  // resets back to "Off Duty" even when the technician is genuinely on duty.
  // Runs immediately on mount, so it also re-arms reporting after a reload.
  usePolling(async () => {
    const res = await getMyDutyStatusAction();
    if (!res.success || !res.data) return;
    setIsOnDuty(res.data.isOnDuty);
    if (res.data.isOnDuty) startWatch();
    else stopWatch();
  }, DUTY_POLL_INTERVAL_MS);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const goOnDuty = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation isn't supported on this device.");
      return;
    }
    setIsBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const res = await updateTechnicianLocationAction(pos.coords.latitude, pos.coords.longitude);
        setIsBusy(false);
        if (!res.success) {
          toast.error(res.error || "Failed to go on duty. Please try again.");
          return;
        }
        setIsOnDuty(true);
        lastReportRef.current = Date.now();
        toast.success("You're on duty — nearby vendors can see your location");
        startWatch();
      },
      () => {
        setIsBusy(false);
        toast.error("Location access denied. Turn on location to go on duty.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const goOffDuty = async () => {
    stopWatch();
    setIsBusy(true);
    setIsOnDuty(false);
    await setTechnicianDutyStatusAction(false);
    setIsBusy(false);
    toast("You're now off duty");
  };

  return (
    <button
      type="button"
      disabled={isBusy}
      onClick={() => (isOnDuty ? goOffDuty() : goOnDuty())}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-wait ${
        isOnDuty
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isOnDuty ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
      {isBusy ? "Updating..." : isOnDuty ? "On Duty" : "Off Duty"}
    </button>
  );
}
