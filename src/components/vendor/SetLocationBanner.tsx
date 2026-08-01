"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateVendorLocationAction } from "@/actions/profile.actions";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function SetLocationBanner() {
  const router = useRouter();
  const [isLocating, setIsLocating] = useState(false);

  const setLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation isn't supported on this device.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const res = await updateVendorLocationAction(pos.coords.latitude, pos.coords.longitude);
        setIsLocating(false);
        if (!res.success) {
          toast.error(res.error || "Couldn't save your location");
          return;
        }
        toast.success("Business location saved");
        router.refresh();
      },
      () => {
        toast.error("Location access denied.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="flex items-center justify-between gap-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 shrink-0 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <ClientIcon icon="ph:map-pin-fill" className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Set your business location</p>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
            Required so nearby customer live calls can reach you.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={setLocation}
        disabled={isLocating}
        className="shrink-0 flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-bold px-3.5 py-2.5 transition-colors cursor-pointer"
      >
        <ClientIcon icon={isLocating ? "svg-spinners:180-ring" : "ph:crosshair-simple-bold"} className="w-4 h-4" />
        {isLocating ? "Detecting..." : "Use current location"}
      </button>
    </div>
  );
}
