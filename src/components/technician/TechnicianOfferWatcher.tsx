"use client";

import React, { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePolling } from "@/hooks/usePolling";
import { getMyAvailableJobsAction, type TechnicianJobOffer } from "@/actions/servicecall.actions";
import { IncomingOfferModal } from "./IncomingOfferModal";

const OFFER_POLL_INTERVAL_MS = 6000;

/**
 * Mounted once in the technician layout so a job ping interrupts whatever
 * page they're on — previously this lived inside the dashboard, so a
 * technician sitting on their wallet or profile page never saw incoming
 * work. Going on duty surfaces waiting jobs on the next poll, because
 * getMyAvailableJobsAction computes eligibility at read time.
 */
export function TechnicianOfferWatcher() {
  const router = useRouter();
  const [offer, setOffer] = useState<TechnicianJobOffer | null>(null);
  // Jobs the technician waved off this session — they stay claimable from
  // the service-calls page, they just stop interrupting.
  const snoozedRef = useRef<Set<string>>(new Set());

  const poll = useCallback(async () => {
    if (offer) return;
    const res = await getMyAvailableJobsAction();
    if (!res.success || !res.data) return;
    const next = res.data.find((j) => !snoozedRef.current.has(j.serviceCallId));
    if (next) setOffer(next);
  }, [offer]);

  usePolling(poll, OFFER_POLL_INTERVAL_MS, [offer]);

  if (!offer) return null;

  return (
    <IncomingOfferModal
      offer={offer}
      onResolved={() => {
        setOffer(null);
        router.refresh();
      }}
      onDismiss={() => {
        snoozedRef.current.add(offer.serviceCallId);
        setOffer(null);
      }}
    />
  );
}
