"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getNearbyLiveCallsForFreelancerAction, type NearbyLiveCall } from "@/actions/livecall.actions";
import { LOCATION_NOT_SET } from "@/lib/constants";
import { usePolling } from "@/hooks/usePolling";
import dynamic from "next/dynamic";
import { LiveCallCard } from "@/components/vendor/LiveCallCard";
import { FreelanceBuyCallModal } from "./FreelanceBuyLeadModal";
import { ClientIcon } from "@/components/ui/ClientIcon";

const LiveMap = dynamic(() => import("@/components/shared/LiveMap").then((m) => m.LiveMap), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-slate-100 dark:bg-slate-800 animate-pulse" />,
});

const CALLS_POLL_INTERVAL_MS = 10000;

interface FreelanceLiveCallsPanelProps {
  technicianLatitude: number;
  technicianLongitude: number;
  serviceAreas: { latitude: number; longitude: number; radiusKm: number }[];
}

export function FreelanceLiveCallsPanel({ technicianLatitude, technicianLongitude, serviceAreas }: FreelanceLiveCallsPanelProps) {
  const [calls, setCalls] = useState<NearbyLiveCall[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [buyingCall, setBuyingCall] = useState<NearbyLiveCall | null>(null);
  const [offDutyError, setOffDutyError] = useState(false);

  const refetchCalls = async () => {
    const res = await getNearbyLiveCallsForFreelancerAction();
    if (!res.success) {
      setLocationError(res.error === LOCATION_NOT_SET);
      setOffDutyError(res.error === "You must be on duty to view live calls");
      setLoaded(true);
      return;
    }
    setLocationError(false);
    setOffDutyError(false);
    setCalls(res.data ?? []);
    setLoaded(true);
  };

  usePolling(refetchCalls, CALLS_POLL_INTERVAL_MS);

  if (offDutyError) {
    return (
      <div className="p-8 text-center bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl">
        <ClientIcon icon="ph:power-fill" className="w-8 h-8 text-amber-500 mx-auto mb-3" />
        <p className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">You are currently Off Duty</p>
        <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mb-4">
          Go on duty from your profile to view and accept live calls.
        </p>
        <Link href="/technician/profile" className="text-sm font-bold text-amber-700 dark:text-amber-300 underline">
          Go to Profile
        </Link>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="p-8 text-center bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl">
        <ClientIcon icon="ph:map-pin-fill" className="w-8 h-8 text-amber-500 mx-auto mb-3" />
        <p className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">Set your location first</p>
        <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mb-4">
          We need it to know which live calls are near you.
        </p>
        <Link href="/technician/profile" className="text-sm font-bold text-amber-700 dark:text-amber-300 underline">
          Go to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <LiveMap
            centerLatitude={technicianLatitude}
            centerLongitude={technicianLongitude}
            liveCallMarkers={calls.map((c) => ({
              id: c.id,
              latitude: c.latitude,
              longitude: c.longitude,
              label: `${c.customerFirstName} — ₹${c.total}`,
            }))}
            technicianMarkers={[]}
            serviceAreaCircles={serviceAreas.map((a, i) => ({ id: String(i), latitude: a.latitude, longitude: a.longitude, radiusKm: a.radiusKm }))}
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
                <div key={call.id} className="relative">
                  <LiveCallCard
                    call={call}
                    isSelected={selectedId === call.id}
                    onSelect={setSelectedId}
                    onBuy={setBuyingCall}
                  />
                  {call.insufficientBalance && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl pointer-events-none">
                      <div className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm pointer-events-auto flex flex-col items-center gap-1">
                        <span>Low Balance (Need ₹{call.leadPrice})</span>
                        <Link href="/technician/wallet" className="underline font-medium text-red-500">Recharge Wallet</Link>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {buyingCall && (
        <FreelanceBuyCallModal
          call={buyingCall}
          onClose={() => setBuyingCall(null)}
          onBought={() => {
            refetchCalls();
          }}
        />
      )}
    </div>
  );
}
