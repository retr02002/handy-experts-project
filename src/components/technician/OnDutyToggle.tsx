"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { updateTechnicianLocationAction, setTechnicianDutyStatusAction } from "@/actions/technician.actions";

// Ephemeral GPS ticks aren't written to the DB on every update — throttle
// the durable write so there's always a reasonable "last known position"
// without hammering TechnicianLocation on every watchPosition callback.
const LOCATION_REPORT_INTERVAL_MS = 25000;

export function OnDutyToggle() {
  const [isOnDuty, setIsOnDuty] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastReportRef = useRef(0);

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
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastReportRef.current < LOCATION_REPORT_INTERVAL_MS) return;
        lastReportRef.current = now;
        updateTechnicianLocationAction(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        toast.error("Location access denied. Turn on location to go on duty.");
        setIsOnDuty(false);
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    setIsOnDuty(true);
    toast.success("You're on duty — nearby vendors can see your location");
  };

  const goOffDuty = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsOnDuty(false);
    await setTechnicianDutyStatusAction(false);
    toast("You're now off duty");
  };

  return (
    <button
      type="button"
      onClick={() => (isOnDuty ? goOffDuty() : goOnDuty())}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 ${
        isOnDuty
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isOnDuty ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
      {isOnDuty ? "On Duty" : "Off Duty"}
    </button>
  );
}
