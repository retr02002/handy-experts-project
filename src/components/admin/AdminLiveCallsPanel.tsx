"use client";

import React, { useState } from "react";
import { getAllLiveCallsAction, type AdminLiveCall } from "@/actions/livecall.actions";
import { getAllTechniciansForAdminAction, type AdminTechnician } from "@/actions/technician.actions";
import { getAllVendorsForAdminAction, type AdminVendor } from "@/actions/admin.actions";
import { getAllVendorServiceAreasForAdminAction, type AdminVendorServiceArea } from "@/actions/vendorservicearea.actions";
import { getAllTechnicianServiceAreasForAdminAction, type AdminTechnicianServiceArea } from "@/actions/technicianservicearea.actions";
import { usePolling } from "@/hooks/usePolling";
import dynamic from "next/dynamic";

import { AdminLiveCallCard } from "./AdminLiveCallCard";

// maplibre-gl is ~800KB — kept out of the first-load bundle and
// fetched when the panel actually renders a map.
const LiveMap = dynamic(() => import("@/components/shared/LiveMap").then((m) => m.LiveMap), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-slate-100 dark:bg-slate-800 animate-pulse" />,
});

const CALLS_POLL_INTERVAL_MS = 15000;
const TECHNICIANS_POLL_INTERVAL_MS = 15000;
const VENDORS_POLL_INTERVAL_MS = 30000;
// Fallback map center (New Delhi) used only when there are no live calls yet.
const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

export function AdminLiveCallsPanel() {
  const [calls, setCalls] = useState<AdminLiveCall[]>([]);
  const [technicians, setTechnicians] = useState<AdminTechnician[]>([]);
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [serviceAreas, setServiceAreas] = useState<AdminVendorServiceArea[]>([]);
  const [technicianServiceAreas, setTechnicianServiceAreas] = useState<AdminTechnicianServiceArea[]>([]);
  const [loaded, setLoaded] = useState(false);

  usePolling(async () => {
    const res = await getAllLiveCallsAction();
    if (res.success && res.data) setCalls(res.data);
    setLoaded(true);
  }, CALLS_POLL_INTERVAL_MS);

  usePolling(async () => {
    const res = await getAllTechniciansForAdminAction();
    if (res.success && res.data) setTechnicians(res.data);
  }, TECHNICIANS_POLL_INTERVAL_MS);

  usePolling(async () => {
    const res = await getAllVendorsForAdminAction();
    if (res.success && res.data) setVendors(res.data);
  }, VENDORS_POLL_INTERVAL_MS);

  usePolling(async () => {
    const res = await getAllVendorServiceAreasForAdminAction();
    if (res.success && res.data) setServiceAreas(res.data);
  }, VENDORS_POLL_INTERVAL_MS);

  usePolling(async () => {
    const res = await getAllTechnicianServiceAreasForAdminAction();
    if (res.success && res.data) setTechnicianServiceAreas(res.data);
  }, TECHNICIANS_POLL_INTERVAL_MS);

  const center = calls.length > 0 ? { lat: calls[0].latitude, lng: calls[0].longitude } : DEFAULT_CENTER;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <LiveMap
          centerLatitude={center.lat}
          centerLongitude={center.lng}
          liveCallMarkers={calls.map((c) => ({
            id: c.id,
            latitude: c.latitude,
            longitude: c.longitude,
            label: `${c.customerName} — ₹${c.total} (${c.status})`,
          }))}
          technicianMarkers={technicians
            .filter((t): t is AdminTechnician & { latitude: number; longitude: number } => t.latitude !== null && t.longitude !== null)
            .map((t) => ({
              id: t.id,
              latitude: t.latitude,
              longitude: t.longitude,
              label: `${t.name} — ${t.vendorName}`,
              isOnDuty: t.isOnDuty,
              skillCategory: t.skillCategory,
              phone: t.phone,
            }))}
          vendorMarkers={vendors
            .filter((v): v is AdminVendor & { latitude: number; longitude: number } => v.latitude !== null && v.longitude !== null)
            .map((v) => ({
              id: v.id,
              latitude: v.latitude,
              longitude: v.longitude,
              label: v.companyName,
              contactName: v.contactName,
              phone: v.phone,
              technicianCount: v.technicianCount,
              isActive: v.isActive,
            }))}
          serviceAreaCircles={serviceAreas.map((a) => ({
            id: a.id,
            latitude: a.latitude,
            longitude: a.longitude,
            radiusKm: a.radiusKm,
          }))}
          technicianServiceAreaCircles={technicianServiceAreas.map((a) => ({
            id: a.id,
            latitude: a.latitude,
            longitude: a.longitude,
            radiusKm: a.radiusKm,
          }))}
        />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          All Live Calls <span className="text-slate-400 font-medium">({calls.length})</span>
        </h2>
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-2">
          {!loaded ? (
            <div className="p-6 text-center text-slate-400 text-sm">Loading...</div>
          ) : calls.length === 0 ? (
            <div className="p-6 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
              No live calls yet.
            </div>
          ) : (
            calls.map((call) => <AdminLiveCallCard key={call.id} call={call} />)
          )}
        </div>
      </div>
    </div>
  );
}
