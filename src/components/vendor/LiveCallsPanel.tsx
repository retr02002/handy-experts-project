"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getNearbyLiveCallsForVendorAction, type NearbyLiveCall } from "@/actions/livecall.actions";
import { getMyTechniciansAction, type VendorTechnician } from "@/actions/technician.actions";
import { getMyServiceAreasAction, type VendorServiceAreaSummary } from "@/actions/vendorservicearea.actions";
import {
  getMyAwaitingCallsForVendorAction,
  rebroadcastLiveCallOffersAction,
  type AwaitingJobSummary,
} from "@/actions/servicecall.actions";
import { LOCATION_NOT_SET, VENDOR_INACTIVE } from "@/lib/constants";
import { usePolling } from "@/hooks/usePolling";
import dynamic from "next/dynamic";

import { LiveCallCard } from "./LiveCallCard";
import { AcceptCallModal } from "./AcceptCallModal";
import { ClientIcon } from "@/components/ui/ClientIcon";

// maplibre-gl is ~800KB — kept out of the first-load bundle and
// fetched when the panel actually renders a map.
const LiveMap = dynamic(() => import("@/components/shared/LiveMap").then((m) => m.LiveMap), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-slate-100 dark:bg-slate-800 animate-pulse" />,
});

const CALLS_POLL_INTERVAL_MS = 10000;
const TECHNICIANS_POLL_INTERVAL_MS = 15000;
const AWAITING_POLL_INTERVAL_MS = 8000;

interface LiveCallsPanelProps {
  vendorLatitude: number;
  vendorLongitude: number;
}

export function LiveCallsPanel({ vendorLatitude, vendorLongitude }: LiveCallsPanelProps) {
  const [calls, setCalls] = useState<NearbyLiveCall[]>([]);
  const [technicians, setTechnicians] = useState<VendorTechnician[]>([]);
  const [serviceAreas, setServiceAreas] = useState<VendorServiceAreaSummary[]>([]);
  const [areasLoaded, setAreasLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [inactiveError, setInactiveError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [acceptingCall, setAcceptingCall] = useState<NearbyLiveCall | null>(null);
  const [awaitingCalls, setAwaitingCalls] = useState<AwaitingJobSummary[]>([]);
  const [rebroadcastingId, setRebroadcastingId] = useState<string | null>(null);

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

  usePolling(async () => {
    const res = await getMyServiceAreasAction();
    if (res.success && res.data) setServiceAreas(res.data);
    setAreasLoaded(true);
  }, TECHNICIANS_POLL_INTERVAL_MS);

  const refetchAwaiting = async () => {
    const res = await getMyAwaitingCallsForVendorAction();
    if (res.success && res.data) setAwaitingCalls(res.data);
  };

  usePolling(refetchAwaiting, AWAITING_POLL_INTERVAL_MS);

  const handleRebroadcast = async (liveCallId: string) => {
    setRebroadcastingId(liveCallId);
    try {
      const res = await rebroadcastLiveCallOffersAction(liveCallId);
      if (!res.success) {
        toast.error(res.error || "Failed to notify technicians");
        return;
      }
      toast.success(`Notified ${res.data?.offerCount ?? 0} technician(s) again`);
      refetchAwaiting();
    } finally {
      setRebroadcastingId(null);
    }
  };

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
    <div className="flex flex-col gap-4">
      {areasLoaded && serviceAreas.length === 0 && (
        <div className="p-4 flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl">
          <ClientIcon icon="ph:map-pin-area-fill" className="w-6 h-6 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">You haven&apos;t added any serviceable areas yet</p>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/80">Add one to start receiving live calls.</p>
          </div>
          <Link href="/vendor/service-areas" className="text-sm font-bold text-amber-700 dark:text-amber-300 underline shrink-0">
            Add Area
          </Link>
        </div>
      )}

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
                label: t.name,
                isOnDuty: t.isOnDuty,
                skillCategory: t.skillCategory,
                phone: t.phone,
              }))}
            serviceAreaCircles={serviceAreas.map((a) => ({
              id: a.id,
              latitude: a.latitude,
              longitude: a.longitude,
              radiusKm: a.radiusKm,
            }))}
            technicianServiceAreaCircles={technicians.flatMap((t) =>
              t.serviceAreas.map((a) => ({
                id: a.id,
                latitude: a.latitude,
                longitude: a.longitude,
                radiusKm: a.radiusKm,
              }))
            )}
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
      </div>

      {awaitingCalls.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Awaiting Technician <span className="text-slate-400 font-medium">({awaitingCalls.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {awaitingCalls.map((call) => {
              const allNonResponsive = call.pendingCount === 0;
              return (
                <div
                  key={call.serviceCallId}
                  className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-500/30 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{call.itemSummary}</h3>
                    <span className="text-sm font-bold text-slate-900 dark:text-white shrink-0">₹{call.total}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {call.address}, {call.city}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    {call.pendingCount > 0 && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                        <ClientIcon icon="ph:hourglass-medium" className="w-3.5 h-3.5" />
                        {call.pendingCount} pending
                      </span>
                    )}
                    {call.declinedCount > 0 && (
                      <span className="text-slate-400">{call.declinedCount} declined</span>
                    )}
                    {call.expiredCount > 0 && <span className="text-slate-400">{call.expiredCount} expired</span>}
                  </div>
                  {allNonResponsive && (
                    <button
                      type="button"
                      onClick={() => handleRebroadcast(call.liveCallId)}
                      disabled={rebroadcastingId === call.liveCallId}
                      className="mt-1 w-full h-9 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {rebroadcastingId === call.liveCallId ? "Notifying..." : "Notify Again"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {acceptingCall && (
        <AcceptCallModal
          call={acceptingCall}
          onClose={() => setAcceptingCall(null)}
          onAccepted={() => {
            refetchCalls();
            refetchAwaiting();
          }}
        />
      )}
    </div>
  );
}
