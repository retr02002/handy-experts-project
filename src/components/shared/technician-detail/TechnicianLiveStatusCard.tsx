import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface Props {
  isOnDuty: boolean;
  /** On-duty but hasn't reported a position in a while — see STALE_POSITION_AFTER_SECONDS. */
  isStale: boolean;
  /** Raw ISO timestamp — formatted with toLocaleString on this fixed value, never Date.now(). */
  locationUpdatedAt: string | null;
}

/**
 * Right-now status, distinct from the historical timeline below it — same
 * blue/red/green convention as the live tracking map (LiveMap.tsx): a
 * steady green dot means genuinely connected right now, a pulsing red dot
 * means on duty but gone quiet, gray means off duty entirely.
 */
export function TechnicianLiveStatusCard({ isOnDuty, isStale, locationUpdatedAt }: Props) {
  const tone = !isOnDuty ? "off" : isStale ? "stale" : "live";

  const dotClass = tone === "live" ? "bg-emerald-500" : tone === "stale" ? "bg-red-500 animate-pulse" : "bg-slate-300 dark:bg-slate-600";
  const label = tone === "live" ? "On duty — reporting live" : tone === "stale" ? "On duty — not reporting location" : "Off duty";
  const labelClass =
    tone === "live"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "stale"
        ? "text-red-600 dark:text-red-400"
        : "text-slate-500 dark:text-slate-400";

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex items-center gap-3">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotClass}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-bold ${labelClass}`}>{label}</p>
        {locationUpdatedAt && (
          <p className="text-xs text-slate-400 truncate">
            Last position: {new Date(locationUpdatedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
          </p>
        )}
      </div>
      {tone === "stale" && <ClientIcon icon="ph:wifi-slash-bold" className="w-5 h-5 text-red-400 shrink-0" />}
    </div>
  );
}
