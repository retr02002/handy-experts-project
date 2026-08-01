"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getNearbyLiveCallsForVendorAction, type NearbyLiveCall } from "@/actions/livecall.actions";
import { getMyTechniciansAction, type VendorTechnician } from "@/actions/technician.actions";
import { LOCATION_NOT_SET, VENDOR_INACTIVE } from "@/lib/constants";
import { usePolling } from "@/hooks/usePolling";
import { LiveMap } from "@/components/shared/LiveMap";
import { LiveCallCard } from "./LiveCallCard";
import { AcceptCallModal } from "./AcceptCallModal";
import { ClientIcon } from "@/components/ui/ClientIcon";

const CALLS_POLL_INTERVAL_MS = 10000;
const TECHNICIANS_POLL_INTERVAL_MS = 15000;

interface LiveCallsPanelProps {
  vendorLatitude: number;
  vendorLongitude: number;
}

export function LiveCallsPanel({ vendorLatitude, vendorLongitude }: LiveCallsPanelProps) {
  const [calls, setCalls] = useState<NearbyLiveCall[]>([]);
  const [technicians, setTechnicians] = useState<VendorTechnician[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [inactiveError, setInactiveError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [acceptingCall, setAcceptingCall] = useState<NearbyLiveCall | null>(null);

  const refetchCalls = async () => {
    const res = await getNearbyLiveCallsForVendorAction();
    if (!res.success) {
      setLocationError(res.error === LOCATION_NOT_SET);
      setInactiveError(res.error === VENDOR_INACTIVE);
      setLoaded(true);
      return;
    }
    setLocationError(false);
    setInactiveError(false);
    setCalls(res.data ?? []);
    setLoaded(true);
  };

  usePolling(refetchCalls, CALLS_POLL_INTERVAL_MS);

  usePolling(async () => {
    const res = await getMyTechniciansAction();
    if (res.success && res.data) setTechnicians(res.data);
  }, TECHNICIANS_POLL_INTERVAL_MS);

  if (inactiveError) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl">
        <ClientIcon icon="ph:prohibit-fill" className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-sm font-bold text-red-900 dark:text-red-200 mb-1">Your account is deactivated</p>
        <p className="text-xs text-red-700/80 dark:text-red-400/80">Contact Handy Experts support to reactivate it.</p>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="p-8 text-center bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl">
        <ClientIcon icon="ph:map-pin-fill" className="w-8 h-8 text-amber-500 mx-auto mb-3" />
        <p className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">Set your business location first</p>
        <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mb-4">
          We need it to know which live calls are near you.
        </p>
        <Link href="/vendor/profile" className="text-sm font-bold text-amber-700 dark:text-amber-300 underline">
          Go to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <LiveMap
          centerLatitude={vendorLatitude}
          centerLongitude={vendorLongitude}
          liveCallMarkers={calls.map((c) => ({
            id: c.id,
            latitude: c.latitude,
            longitude: c.longitude,
            label: `${c.customerName} — ₹${c.total}`,
          }))}
          technicianMarkers={technicians
            .filter((t): t is VendorTechnician & { latitude: number; longitude: number } => t.latitude !== null && t.longitude !== null)
            .map((t) => ({
              id: t.id,
              latitude: t.latitude,
              longitude: t.longitude,
              label: `${t.name} (${t.isOnDuty ? "on duty" : "off duty"})`,
              isOnDuty: t.isOnDuty,
            }))}
          onCallMarkerClick={setSelectedId}
        />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Active Live Calls <span className="text-slate-400 font-medium">({calls.length})</span>
        </h2>
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-2">
          {!loaded ? (
            <div className="p-6 text-center text-slate-400 text-sm">Loading...</div>
          ) : calls.length === 0 ? (
            <div className="p-6 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
              No live calls near you right now.
            </div>
          ) : (
            calls.map((call) => (
              <LiveCallCard
                key={call.id}
                call={call}
                isSelected={selectedId === call.id}
                onSelect={setSelectedId}
                onAccept={setAcceptingCall}
              />
            ))
          )}
        </div>
      </div>

      {acceptingCall && (
        <AcceptCallModal call={acceptingCall} onClose={() => setAcceptingCall(null)} onAccepted={refetchCalls} />
      )}
    </div>
  );
}
