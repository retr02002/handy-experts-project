"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import {
  addTechnicianServiceAreaAction,
  updateTechnicianServiceAreaRadiusAction,
  removeTechnicianServiceAreaAction,
  type TechnicianServiceAreaSummary,
} from "@/actions/technicianservicearea.actions";

import { CoverageMap } from "@/components/admin/CoverageMapDynamic";

export function FreelanceServiceAreaManager({
  technicianId,
  initialAreas,
}: {
  technicianId: string;
  initialAreas: TechnicianServiceAreaSummary[];
}) {
  const [areas, setAreas] = useState(initialAreas);
  const [newPincode, setNewPincode] = useState("");
  const [newLocationName, setNewLocationName] = useState("");
  const [newRadius, setNewRadius] = useState("5");
  const [isAdding, setIsAdding] = useState(false);
  const [radiusDrafts, setRadiusDrafts] = useState<Record<string, number>>({});
  const [savingAreaId, setSavingAreaId] = useState<string | null>(null);

  const [draftPin, setDraftPin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleMapClick = async (lat: number, lng: number, locationName?: string) => {
    setDraftPin({ latitude: lat, longitude: lng });
    if (locationName) setNewLocationName(locationName);
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&countrycodes=in`);
      const data = await res.json();
      if (data?.address?.postcode) {
        setNewPincode(data.address.postcode);
        if (!locationName && data.address) {
          const possibleName = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.village || data.address.town || data.address.city;
          if (possibleName) setNewLocationName(possibleName);
        }
        toast.success(`Found pincode: ${data.address.postcode}`);
      } else {
        toast.error("Could not determine pincode for this location. Please enter manually.");
      }
    } catch (e) {
      toast.error("Failed to find pincode for this location.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const addArea = async () => {
    if (!/^\d{6}$/.test(newPincode)) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }
    const radiusKm = Number(newRadius);
    setIsAdding(true);
    try {
      const res = await addTechnicianServiceAreaAction({ technicianId, pincode: newPincode, locationName: newLocationName || null, radiusKm });
      if (!res.success) {
        toast.error(res.error || "Couldn't add that area");
        return;
      }
      toast.success("Service area added");
      setAreas((prev) => [...prev, { id: res.data!.id, pincode: newPincode, locationName: newLocationName || null, latitude: draftPin?.latitude || 0, longitude: draftPin?.longitude || 0, radiusKm }]);
      setNewPincode("");
      setNewLocationName("");
      setNewRadius("5");
      setDraftPin(null);
    } finally {
      setIsAdding(false);
    }
  };

  const saveRadius = async (area: TechnicianServiceAreaSummary) => {
    const radiusKm = radiusDrafts[area.id] ?? area.radiusKm;
    if (radiusKm === area.radiusKm) return;
    setSavingAreaId(area.id);
    try {
      const res = await updateTechnicianServiceAreaRadiusAction({ id: area.id, radiusKm });
      if (!res.success) {
        toast.error(res.error || "Couldn't update radius");
        return;
      }
      setAreas((prev) => prev.map((a) => (a.id === area.id ? { ...a, radiusKm } : a)));
      setRadiusDrafts((prev) => {
        const next = { ...prev };
        delete next[area.id];
        return next;
      });
      toast.success("Radius updated");
    } finally {
      setSavingAreaId(null);
    }
  };

  const removeArea = async (id: string) => {
    if (!confirm("Remove this service area?")) return;
    try {
      const res = await removeTechnicianServiceAreaAction(id);
      if (!res.success) {
        toast.error(res.error || "Couldn't remove area");
        return;
      }
      toast.success("Area removed");
      setAreas((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error("Failed to remove area");
    }
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Service Areas</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Add the pincodes this freelance technician can service. Search or click on the map to add a location. Each area is a circular radius around that pincode&apos;s center.
        </p>

        <div className="mb-6">
          <CoverageMap 
            areas={areas} 
            draftPin={draftPin} 
            draftRadiusKm={Number(newRadius) || 5} 
            onMapClick={handleMapClick} 
          />
        </div>

        <div className="flex flex-col gap-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
          {areas.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">No service areas defined. They won&apos;t see any local calls.</p>
            </div>
          ) : (
            areas.map((a) => {
              const draft = radiusDrafts[a.id];
              const displayRadius = draft ?? a.radiusKm;
              const isDirty = draft !== undefined && draft !== a.radiusKm;
              return (
                <div
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                      <ClientIcon icon="ph:map-pin-line-bold" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white flex items-baseline gap-2">
                        {a.pincode}
                        {a.locationName && <span className="text-xs font-normal text-slate-500">{a.locationName}</span>}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{a.radiusKm}km radius</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-2">
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={displayRadius}
                        onChange={(e) => setRadiusDrafts((prev) => ({ ...prev, [a.id]: Number(e.target.value) }))}
                        className="w-24"
                      />
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 w-8 text-right">
                        {displayRadius}km
                      </span>
                    </div>
                    {isDirty && (
                      <button
                        onClick={() => saveRadius(a)}
                        disabled={savingAreaId === a.id}
                        className="h-8 px-3 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {savingAreaId === a.id ? "Saving..." : "Save"}
                      </button>
                    )}
                    <button
                      onClick={() => removeArea(a.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <ClientIcon icon="ph:trash-bold" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder={isGeocoding ? "Locating..." : "Pincode (e.g. 110001)"}
            value={newPincode}
            disabled={isGeocoding}
            onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ""))}
            className="flex-1 max-w-[200px] h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:opacity-50"
          />
          <select
            value={newRadius}
            onChange={(e) => setNewRadius(e.target.value)}
            className="h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
          >
            {[2, 3, 5, 8, 10, 15, 20, 25].map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>
          <button
            onClick={addArea}
            disabled={newPincode.length !== 6 || isAdding || isGeocoding}
            className="h-10 px-4 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
          >
            {isAdding ? "Adding..." : "Add Area"}
          </button>
        </div>
      </div>
    </div>
  );
}
