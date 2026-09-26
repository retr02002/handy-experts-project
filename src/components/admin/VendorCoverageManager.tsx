"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { setVendorCategoriesAction } from "@/actions/admin.actions";
import {
  addServiceAreaAction,
  updateServiceAreaRadiusAction,
  removeServiceAreaAction,
  type VendorServiceAreaSummary,
} from "@/actions/vendorservicearea.actions";
import type { CategoryWithServiceOptions } from "@/actions/category.actions";
import { SkillAssignmentBuilder } from "@/components/shared/SkillAssignmentBuilder";
import type { SkillAssignmentInput } from "@/lib/validations/technician.schema";

import { CoverageMap } from "@/components/admin/CoverageMapDynamic";

/**
 * The admin's control surface for both halves of a vendor's coverage — what
 * they're allowed to serve (categories) and where (service-area circles).
 * Both used to be vendor-self-service; both are now admin-only, changed on
 * request via a support ticket rather than freely by the vendor.
 */
export function VendorCoverageManager({
  vendorId,
  categories,
  initialAssignedSkillAssignments,
  initialAreas,
}: {
  vendorId: string;
  categories: CategoryWithServiceOptions[];
  initialAssignedSkillAssignments: SkillAssignmentInput[];
  initialAreas: VendorServiceAreaSummary[];
}) {
  const [assigned, setAssigned] = useState<SkillAssignmentInput[]>(initialAssignedSkillAssignments);
  const [savingCategories, setSavingCategories] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [areas, setAreas] = useState(initialAreas);
  const [newPincode, setNewPincode] = useState("");
  const [newLocationName, setNewLocationName] = useState("");
  const [newRadius, setNewRadius] = useState("5");
  const [isAdding, setIsAdding] = useState(false);
  const [radiusDrafts, setRadiusDrafts] = useState<Record<string, number>>({});
  const [savingAreaId, setSavingAreaId] = useState<string | null>(null);
  
  const [draftPin, setDraftPin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleAssignmentsChange = (next: SkillAssignmentInput[]) => {
    setAssigned(next);
    setDirty(true);
  };

  const saveCategories = async () => {
    setSavingCategories(true);
    try {
      const res = await setVendorCategoriesAction(vendorId, assigned);
      if (!res.success) {
        toast.error(res.error || "Couldn't save categories");
        return;
      }
      toast.success(assigned.length === 0 ? "Saved — this vendor now sees no live calls" : "Categories updated");
      setDirty(false);
    } finally {
      setSavingCategories(false);
    }
  };

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
      const res = await addServiceAreaAction({ vendorId, pincode: newPincode, locationName: newLocationName || null, radiusKm });
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

  const saveRadius = async (area: VendorServiceAreaSummary) => {
    const radiusKm = radiusDrafts[area.id] ?? area.radiusKm;
    if (radiusKm === area.radiusKm) return;
    setSavingAreaId(area.id);
    try {
      const res = await updateServiceAreaRadiusAction({ id: area.id, radiusKm });
      if (!res.success) {
        toast.error(res.error || "Couldn't update radius");
        return;
      }
      setAreas((prev) => prev.map((a) => (a.id === area.id ? { ...a, radiusKm } : a)));
      toast.success("Radius updated");
    } finally {
      setSavingAreaId(null);
    }
  };

  const removeArea = async (id: string) => {
    const res = await removeServiceAreaAction(id);
    if (!res.success) {
      toast.error(res.error || "Couldn't remove that area");
      return;
    }
    setAreas((prev) => prev.filter((a) => a.id !== id));
    toast.success("Service area removed");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* Categories */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Categories this vendor may serve</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            A vendor sees zero live calls in a category they aren&apos;t assigned here.
          </p>
        </div>

        <SkillAssignmentBuilder value={assigned} onChange={handleAssignmentsChange} />

        {assigned.length === 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <ClientIcon icon="ph:warning-circle-fill" className="w-4 h-4 shrink-0" />
            No categories assigned — this vendor currently sees no live calls at all.
          </p>
        )}

        <button
          type="button"
          onClick={saveCategories}
          disabled={!dirty || savingCategories}
          className="self-start h-10 px-5 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors cursor-pointer"
        >
          {savingCategories ? "Saving..." : "Save Categories"}
        </button>
      </div>

      {/* Service areas */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Serviceable areas</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search or click the map below to drop a pin, adjust radius, and save it.
          </p>
        </div>
        
        <CoverageMap 
          areas={areas} 
          draftPin={draftPin} 
          draftRadiusKm={Number(newRadius) || 5} 
          onMapClick={handleMapClick} 
        />

        {areas.length === 0 ? (
          <p className="text-sm text-slate-400">No areas added yet.</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
            {areas.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80"
              >
                <div className="flex flex-col min-w-0 w-32 shrink-0">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{a.pincode}</span>
                  {a.locationName && <span className="text-[10px] text-slate-500 truncate">{a.locationName}</span>}
                </div>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={radiusDrafts[a.id] ?? a.radiusKm}
                  onChange={(e) => setRadiusDrafts((prev) => ({ ...prev, [a.id]: Number(e.target.value) }))}
                  className="w-16 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-sm text-slate-900 dark:text-white"
                />
                <span className="text-xs text-slate-400 shrink-0">km</span>
                <button
                  type="button"
                  onClick={() => saveRadius(a)}
                  disabled={savingAreaId === a.id || (radiusDrafts[a.id] ?? a.radiusKm) === a.radiusKm}
                  className="ml-auto text-xs font-bold text-[#00B4FF] disabled:text-slate-300 disabled:cursor-not-allowed hover:underline cursor-pointer shrink-0"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => removeArea(a.id)}
                  aria-label={`Remove ${a.pincode}`}
                  className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors cursor-pointer shrink-0"
                >
                  <ClientIcon icon="ph:trash-bold" className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <input
            value={newPincode}
            onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder={isGeocoding ? "Locating..." : "6-digit pincode"}
            inputMode="numeric"
            disabled={isGeocoding}
            className="flex-1 h-9 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 text-sm text-slate-900 dark:text-white disabled:opacity-50"
          />
          <input
            type="number"
            min={1}
            max={25}
            value={newRadius}
            onChange={(e) => setNewRadius(e.target.value)}
            className="w-16 h-9 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-sm text-slate-900 dark:text-white"
          />
          <span className="text-xs text-slate-400 shrink-0">km</span>
          <button
            type="button"
            onClick={addArea}
            disabled={isAdding || isGeocoding}
            className="h-9 px-4 rounded-lg bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-60 text-white text-sm font-bold transition-colors cursor-pointer shrink-0"
          >
            {isAdding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
