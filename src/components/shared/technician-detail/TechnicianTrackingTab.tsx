import React from "react";
import { TechnicianTimelineView } from "@/components/shared/TechnicianTimelineView";
import { TechnicianLiveStatusCard } from "./TechnicianLiveStatusCard";

interface Props {
  technicianId: string;
  isOnDuty: boolean;
  isStale: boolean;
  locationUpdatedAt: string | null;
}

/** Right-now status card, plus TechnicianTimelineView (self-contained, fetches its own history given an id) for the day-by-day route/clock-in trail. */
export function TechnicianTrackingTab({ technicianId, isOnDuty, isStale, locationUpdatedAt }: Props) {
  return (
    <div className="max-w-4xl flex flex-col gap-4">
      <TechnicianLiveStatusCard isOnDuty={isOnDuty} isStale={isStale} locationUpdatedAt={locationUpdatedAt} />
      <TechnicianTimelineView technicianId={technicianId} />
    </div>
  );
}
