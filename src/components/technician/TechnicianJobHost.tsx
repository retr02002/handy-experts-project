"use client";

import React, { useState } from "react";
import { TechnicianJobPanel } from "./TechnicianJobPanel";
import { JobPinDialog } from "./JobPinDialog";
import type { ServiceCallSummary } from "@/actions/servicecall.actions";

/**
 * Job detail plus the PIN gate it hands off to, in one mountable unit —
 * the dashboard and the service-calls page both open jobs, and this keeps
 * the gate wiring from being duplicated (and drifting) between them.
 */
export function TechnicianJobHost({
  call,
  onClose,
  onChanged,
}: {
  call: ServiceCallSummary;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [gate, setGate] = useState<"start" | "complete" | null>(null);

  if (gate) {
    return (
      <JobPinDialog
        call={call}
        gate={gate}
        onClose={() => setGate(null)}
        onDone={() => {
          setGate(null);
          onChanged();
          onClose();
        }}
      />
    );
  }

  return (
    <TechnicianJobPanel
      call={call}
      onClose={onClose}
      onChanged={onChanged}
      onGatedStep={(_call, nextGate) => setGate(nextGate)}
    />
  );
}
