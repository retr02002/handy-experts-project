"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { useDebounce } from "@/hooks/useDebounce";
import { reverseGeocodeAction } from "@/actions/location.actions";
import type { NominatimResult } from "@/lib/nominatim";

const MapComponent = dynamic(() => import("@/components/shared/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-xs">
      Loading map...
    </div>
  ),
});

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // India centroid, until a real position is known

export interface AdminLocationValue {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface Props {
  value: AdminLocationValue;
  onChange: (value: AdminLocationValue) => void;
}

/**
 * Same map-search-current-location-pin experience as the customer checkout's
 * address picker (AddressFormSheet), reusing the exact same MapComponent and
 * reverse-geocode action — just without the "save as Home/Work" step, since
 * this fills one order's fields directly rather than persisting an Address
 * record. Every field the map/search fills stays manually editable too.
 */
export function AdminLocationPicker({ value, onChange }: Props) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
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
    setResolving(true);
    setPincodeHint(false);
    try {
      const result = await reverseGeocodeAction(pos[0], pos[1]);
      if (result.success && result.data) {
        const next = { ...value, address: result.data.displayName };
        if (result.data.rawCity) next.city = result.data.rawCity;
        if (result.data.rawState) next.state = result.data.rawState;
        const cleanPincode = result.data.pincode.replace(/^,\s*/, "");
        if (cleanPincode) next.pincode = cleanPincode;
        else setPincodeHint(true);
        onChange(next);
      } else {
        setPincodeHint(true);
        toast("Couldn't auto-detect this address — fill in the details below.");
      }
    } catch (err) {
      console.error("Reverse geocode failed:", err);
      setPincodeHint(true);
      toast("Couldn't auto-detect this address — fill in the details below.");
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

  const setField = <K extends keyof AdminLocationValue>(key: K, val: AdminLocationValue[K]) =>
    onChange({ ...value, [key]: val });

  const inputClass =
    "w-full h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40";

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full h-48 sm:h-56 shrink-0 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
        <MapComponent position={position ?? DEFAULT_CENTER} onPositionChange={resolvePosition} />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full pointer-events-none z-[400] whitespace-nowrap shadow-lg flex items-center gap-1.5 font-medium">
          <ClientIcon icon="ph:arrows-out-cardinal-bold" className="w-3 h-3 text-[#00B4FF]" />
          Tap map to place the pin
        </div>
        {resolving && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 rounded-full px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shadow-md">
            <ClientIcon icon="ph:spinner-gap-bold" className="w-3 h-3 animate-spin" />
            Locating...
          </div>
        )}
      </div>

      <div className="relative">
        <div className="relative">
          {isSearching ? (
            <ClientIcon icon="ph:spinner-gap-bold" className="w-4 h-4 text-[#00B4FF] absolute left-3 top-1/2 -translate-y-1/2 animate-spin" />
          ) : (
            <ClientIcon icon="ph:magnifying-glass" className="w-4 h-4 text-[#00B4FF] absolute left-3 top-1/2 -translate-y-1/2" />
          )}
          <input
            type="text"
            placeholder="Search for area, street name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto">
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
        className="flex items-center gap-2.5 w-full h-10 px-3 rounded-lg border border-[#00B4FF]/30 hover:bg-[#00B4FF]/5 transition-all text-left disabled:opacity-60 shrink-0"
      >
        <ClientIcon icon={locating ? "svg-spinners:180-ring" : "ph:crosshair-simple-bold"} className="w-4 h-4 text-[#00B4FF] shrink-0" />
        <span className="text-xs font-semibold text-[#00B4FF] min-w-0">{locating ? "Detecting..." : "Use current location"}</span>
      </button>

      <textarea
        value={value.address}
        onChange={(e) => setField("address", e.target.value)}
        placeholder="Full street address"
        rows={2}
        className={`${inputClass} h-auto py-2.5 resize-none`}
      />
      <div className="grid grid-cols-3 gap-2">
        <input value={value.city} onChange={(e) => setField("city", e.target.value)} placeholder="City" className={inputClass} />
        <input value={value.state} onChange={(e) => setField("state", e.target.value)} placeholder="State" className={inputClass} />
        <div>
          <input
            value={value.pincode}
            onChange={(e) => {
              setField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6));
              setPincodeHint(false);
            }}
            placeholder="Pincode"
            inputMode="numeric"
            className={`${inputClass} ${pincodeHint && !value.pincode ? "border-amber-300 dark:border-amber-500/50" : ""}`}
          />
          {pincodeHint && !value.pincode && <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">Enter manually</p>}
        </div>
      </div>
    </div>
  );
}
