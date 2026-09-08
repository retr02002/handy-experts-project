"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { useDebounce } from "@/hooks/useDebounce";
import { reverseGeocodeAction } from "@/actions/location.actions";
import { createAddressAction, updateAddressAction, type AddressSummary } from "@/actions/address.actions";
import type { NominatimResult } from "@/lib/nominatim";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-xs">
      Loading map...
    </div>
  ),
});

const QUICK_LABELS = ["Home", "Work", "Other"] as const;
const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // India centroid — used only until a real position is known

interface Props {
  mode: "create" | "edit";
  initial?: AddressSummary;
  onSaved: (address: AddressSummary) => void;
  onCancel: () => void;
}

export function AddressFormSheet({ mode, initial, onSaved, onCancel }: Props) {
  const [position, setPosition] = useState<[number, number]>(initial ? [initial.latitude, initial.longitude] : DEFAULT_CENTER);
  const [hasPosition, setHasPosition] = useState(!!initial);
  const [addressLine, setAddressLine] = useState(initial?.addressLine ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [state, setState] = useState(initial?.state ?? "");
  const [pincode, setPincode] = useState(initial?.pincode ?? "");
  const [label, setLabel] = useState(initial?.label ?? "Home");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  // Nominatim frequently can't resolve a pincode (or any address at all) for
  // an exact rooftop-level pin, especially outside major Indian cities — this
  // is a soft inline hint rather than a toast so a normal map click never
  // reads as "an error happened."
  const [pincodeHint, setPincodeHint] = useState(false);

  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedSearchQuery)}&addressdetails=1&limit=5`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setSearchResults(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearchQuery]);

  const resolvePosition = async (pos: [number, number]) => {
    setPosition(pos);
    setHasPosition(true);
    setResolving(true);
    setPincodeHint(false);
    try {
      const result = await reverseGeocodeAction(pos[0], pos[1]);
      if (result.success && result.data) {
        setAddressLine(result.data.displayName);
        if (result.data.rawCity) setCity(result.data.rawCity);
        if (result.data.rawState) setState(result.data.rawState);
        const cleanPincode = result.data.pincode.replace(/^,\s*/, "");
        if (cleanPincode) setPincode(cleanPincode);
        else setPincodeHint(true);
      } else {
        // The pin is still placed on the map either way — only the
        // auto-filled text fields are missing, so this is a nudge to fill
        // them in below, not a dead end.
        setPincodeHint(true);
        toast("Couldn't auto-detect this address — you can fill in the details below.");
      }
    } catch (err) {
      console.error("Reverse geocode failed:", err);
      setPincodeHint(true);
      toast("Couldn't auto-detect this address — you can fill in the details below.");
    } finally {
      setResolving(false);
    }
  };

  const selectSearchResult = (result: NominatimResult) => {
    setSearchQuery(result.name || result.display_name.split(",")[0]);
    setSearchResults([]);
    resolvePosition([parseFloat(result.lat), parseFloat(result.lon)]);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation isn't supported on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await resolvePosition([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => {
        toast.error("Location access denied.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPosition) {
      toast.error("Please set a location on the map first.");
      return;
    }
    if (!addressLine.trim() || !city.trim() || !state.trim() || !/^\d{6}$/.test(pincode.trim())) {
      toast.error("Please fill in the full address, city, state and a 6-digit pincode.");
      return;
    }
    if (!label.trim()) {
      toast.error("Give this address a name.");
      return;
    }

    setSaving(true);
    try {
      const input = {
        label: label.trim(),
        addressLine: addressLine.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        latitude: position[0],
        longitude: position[1],
        isDefault,
      };
      const res =
        mode === "edit" && initial ? await updateAddressAction(initial.id, input) : await createAddressAction(input);
      if (!res.success) {
        toast.error(res.error || "Failed to save this address");
        return;
      }
      toast.success(mode === "edit" ? "Address updated" : "Address saved");
      onSaved({
        id: mode === "edit" && initial ? initial.id : (res.data as { id: string }).id,
        ...input,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <div className="w-full h-40 sm:h-48 shrink-0 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
        <MapComponent position={position} onPositionChange={resolvePosition} />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full pointer-events-none z-[400] whitespace-nowrap shadow-lg flex items-center gap-1.5 font-medium">
          <ClientIcon icon="ph:arrows-out-cardinal-bold" className="w-3 h-3 text-[#00B4FF]" />
          Tap map to adjust pin
        </div>
        {resolving && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 rounded-full px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shadow-md">
            <ClientIcon icon="ph:spinner-gap-bold" className="w-3 h-3 animate-spin" />
            Locating...
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <div className="relative">
          {isSearching ? (
            <ClientIcon icon="ph:spinner-gap-bold" className="w-4 h-4 text-[#00B4FF] absolute left-3.5 top-1/2 -translate-y-1/2 animate-spin" />
          ) : (
            <ClientIcon icon="ph:magnifying-glass" className="w-4 h-4 text-[#00B4FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
          )}
          <input
            type="text"
            placeholder="Search for area, street name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 focus:border-[#00B4FF] text-slate-900 dark:text-white transition-all"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
            {searchResults.map((r, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectSearchResult(r)}
                className="flex items-start gap-2.5 w-full text-left px-3.5 py-2.5 border-b last:border-b-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ClientIcon icon="ph:map-pin-fill" className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 dark:text-slate-300 min-w-0 break-words">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={detectLocation}
        disabled={locating}
        className="flex items-center gap-3 w-full p-3 rounded-xl border border-[#00B4FF]/30 hover:bg-[#00B4FF]/5 transition-all text-left disabled:opacity-60"
      >
        <div className="w-9 h-9 rounded-full bg-[#00B4FF]/10 flex items-center justify-center shrink-0">
          <ClientIcon icon={locating ? "svg-spinners:180-ring" : "ph:crosshair-simple-bold"} className="w-4 h-4 text-[#00B4FF]" />
        </div>
        <span className="text-sm font-semibold text-[#00B4FF] min-w-0">{locating ? "Detecting..." : "Use current location"}</span>
      </button>

      <div>
        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">
          Full Address
        </label>
        <textarea
          required
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 text-slate-900 dark:text-white resize-none h-16 transition-all"
          placeholder="House / Flat No, Floor, Building, Street, Area"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 text-slate-900 dark:text-white transition-all"
          />
        </div>
        <div className="min-w-0">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 text-slate-900 dark:text-white transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 items-start">
        <div className="min-w-0">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">Pincode</label>
          <input
            type="text"
            inputMode="numeric"
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setPincodeHint(false);
            }}
            className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 text-slate-900 dark:text-white transition-all ${
              pincodeHint && !pincode ? "border-amber-300 dark:border-amber-500/50" : "border-slate-200 dark:border-slate-700/50"
            }`}
          />
          {pincodeHint && !pincode && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">Couldn&apos;t auto-detect — please enter it</p>
          )}
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none mt-6">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[#00B4FF] focus:ring-[#00B4FF]/40 shrink-0"
          />
          Set as default
        </label>
      </div>

      <div>
        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 block uppercase tracking-wider">Save As</label>
        <div className="flex items-center gap-2 mb-2.5">
          {QUICK_LABELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLabel(l)}
              className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                label === l
                  ? "bg-[#00B4FF]/10 border-[#00B4FF]/40 text-[#00B4FF]"
                  : "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400"
              }`}
            >
              <ClientIcon
                icon={l === "Home" ? "ph:house-fill" : l === "Work" ? "ph:briefcase-fill" : "ph:map-pin-fill"}
                className="w-4 h-4 shrink-0"
              />
              <span className="truncate">{l}</span>
            </button>
          ))}
        </div>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Or type a custom name, e.g. Mom's place"
          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 text-slate-900 dark:text-white transition-all"
        />
      </div>

      <div className="flex items-center gap-2 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-60 text-white text-sm font-bold shadow-sm transition-colors"
        >
          {saving ? "Saving..." : "Save Address"}
        </button>
      </div>
    </form>
  );
}
