"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { reverseGeocodeAction } from "@/actions/location.actions";

const MapComponent = dynamic(() => import("@/components/shared/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium">
      Loading map...
    </div>
  ),
});

const PREDEFINED_LOCATIONS = [
  { id: "del", code: "DEL", name: "New Delhi", region: "Delhi NCR" },
  { id: "mum", code: "BOM", name: "Mumbai", region: "Maharashtra" },
  { id: "blr", code: "BLR", name: "Bangalore", region: "Karnataka" },
  { id: "pun", code: "PNQ", name: "Pune", region: "Maharashtra" },
  { id: "hyd", code: "HYD", name: "Hyderabad", region: "Telangana" },
];

const DEFAULT_MAP_POSITION: [number, number] = [28.6139, 77.209]; // New Delhi

export function HeroSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [locationName, setLocationName] = useState("New Delhi");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [step, setStep] = useState<"list" | "map">("list");

  const [mapPosition, setMapPosition] = useState<[number, number]>(DEFAULT_MAP_POSITION);
  const [mapAddress, setMapAddress] = useState("");
  const [isResolvingPin, setIsResolvingPin] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const closeDropdown = () => {
    setIsDropdownOpen(false);
    setStep("list");
    setLocationError(null);
  };

  // Note: closing is handled entirely by the modal's own backdrop click / X
  // button below, not a document-level "outside click" listener — the modal
  // is rendered in a portal to document.body, so it sits outside the trigger
  // button's DOM subtree and a mousedown-based outside-click check would
  // treat every click inside the modal (map, city list, confirm button) as
  // "outside" and slam it shut before the real handler ever ran.

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isDropdownOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDropdownOpen]);

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsResolvingPin(true);
    try {
      const result = await reverseGeocodeAction(lat, lng);
      if (result.success && result.data) {
        setMapAddress(result.data.displayName);
        return { localArea: result.data.localArea, pincode: result.data.pincode };
      }
      setMapAddress("Couldn't resolve address");
      return null;
    } catch (error) {
      console.warn("Error reverse geocoding:", error);
      setMapAddress("Couldn't resolve address");
      return null;
    } finally {
      setIsResolvingPin(false);
    }
  };

  const fetchLiveLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) setLocationError("Your browser doesn't support geolocation. Pick a city below instead.");
      return;
    }

    if (!silent) setLocationError(null);
    setIsFetchingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        if (silent) {
          // Background fetch on page load: just update the label text quietly.
          try {
            const result = await reverseGeocodeAction(latitude, longitude);
            if (result.success && result.data) {
              setLocationName(`${result.data.localArea}${result.data.pincode}`);
            }
          } catch (error) {
            console.warn("Error fetching location details:", error);
          } finally {
            setIsFetchingLocation(false);
          }
          return;
        }

        // Interactive flow: drop into a live map so the user can fine-tune the pin, Zomato-style.
        setLocationError(null);
        setMapPosition([latitude, longitude]);
        setStep("map");
        setIsFetchingLocation(false);
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        if (!silent) {
          console.warn("Error getting location:", error.message || error);
          if (error.code === error.PERMISSION_DENIED) {
            setLocationError(
              "Location access is blocked for this site. Allow it from the padlock/site settings in your browser's address bar, then try again — or just pick a city below."
            );
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setLocationError(
              "Couldn't get a GPS fix — even though this site is allowed, your OS can still block location per-browser. On macOS: System Settings → Privacy & Security → Location Services, and make sure this specific browser is toggled on. Then try again, or pick a city below."
            );
          } else if (error.code === error.TIMEOUT) {
            setLocationError("Location request timed out. Try again, or pick a city below.");
          } else {
            setLocationError("Something went wrong getting your location. Try again, or pick a city below.");
          }
        }
        setIsFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    // Attempt to silently fetch on load (will prompt the user)
    // Wrapped in setTimeout to prevent synchronous setState warning
    const timer = setTimeout(() => {
      fetchLiveLocation(true);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectLocation = (name: string) => {
    setLocationName(name);
    setLocationError(null);
    closeDropdown();
  };

  const handleFetchCurrentClick = () => {
    fetchLiveLocation(false);
  };

  const handlePinMove = (pos: [number, number]) => {
    setMapPosition(pos);
    reverseGeocode(pos[0], pos[1]);
  };

  const handleConfirmMapLocation = async () => {
    const result = await reverseGeocode(mapPosition[0], mapPosition[1]);
    if (result) {
      setLocationName(`${result.localArea}${result.pincode}`);
    } else if (mapAddress) {
      setLocationName(mapAddress.split(",")[0]);
    }
    closeDropdown();
  };

  const handleSearch = () => {
    const trimmed = query.trim();
    router.push(trimmed ? `/services?q=${encodeURIComponent(trimmed)}` : "/services");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full relative flex items-center bg-white/95 dark:bg-slate-900/80 backdrop-blur-2xl rounded-full p-1.5 sm:p-2 border border-slate-200/80 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] mx-auto max-w-2xl transition-all focus-within:ring-2 focus-within:ring-[#00B4FF]/40 hover:-translate-y-0.5"
      >
        {/* Inset Location Badge */}
        <div className="relative shrink-0">
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full px-3 sm:px-4 py-2 sm:py-2.5 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer border border-transparent hover:border-slate-300/50 dark:hover:border-slate-600/50 ${isFetchingLocation ? 'animate-pulse' : ''} ${isDropdownOpen ? 'ring-2 ring-[#00B4FF]/50 bg-slate-200 dark:bg-slate-700' : ''}`}
            title="Select location"
          >
            {isFetchingLocation ? (
              <ClientIcon icon="ph:spinner-gap-bold" className="text-[#00B4FF] animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            ) : (
              <ClientIcon icon="ph:map-pin-fill" className="text-[#00B4FF] w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            )}
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[90px] sm:max-w-[150px]">
              {isFetchingLocation ? "Locating..." : locationName}
            </span>
            <ClientIcon icon={isDropdownOpen ? "ph:caret-up-bold" : "ph:caret-down-bold"} className="text-slate-400 w-3 h-3 ml-1 sm:ml-2" />
          </div>
        </div>

        {/* Main Input */}
        <div className="flex items-center flex-1 px-3 sm:px-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you need?"
            className="bg-transparent border-none outline-none text-slate-900 dark:text-white w-full placeholder:text-slate-400 dark:placeholder:text-slate-500 text-[13px] sm:text-base font-medium min-w-0"
          />
        </div>

        {/* Search Action */}
        <button
          type="submit"
          className="bg-gradient-to-br from-[#00B4FF] to-[#0070FF] text-white rounded-full w-9 h-9 sm:w-auto sm:h-11 sm:px-7 flex items-center justify-center transition-all shadow-[0_2px_10px_rgba(0,180,255,0.3)] hover:shadow-[0_4px_15px_rgba(0,180,255,0.5)] hover:scale-105 active:scale-95 shrink-0 group border border-white/20"
        >
          <span className="hidden sm:inline font-bold text-[15px] tracking-wide">Search</span>
          <ClientIcon icon="ph:arrow-right-bold" className="sm:hidden w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </form>

      {/* Responsive Modal (Rendered in Portal) */}
      {isDropdownOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex flex-col sm:items-center sm:justify-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeDropdown} // Clicking backdrop closes modal
        >
          {/* Modal Container */}
          <div
            className="bg-white dark:bg-slate-900 w-full sm:max-w-[380px] max-h-[85vh] sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-8 sm:zoom-in-95 duration-300 mt-auto sm:mt-0"
            onClick={(e) => e.stopPropagation()} // Prevent clicking inside modal from closing it
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {step === "map" && (
                  <button
                    onClick={() => setStep("list")}
                    className="w-7 h-7 -ml-1 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                  >
                    <ClientIcon icon="ph:arrow-left-bold" className="w-4 h-4" />
                  </button>
                )}
                <ClientIcon icon="ph:map-pin-bold" className="w-4 h-4 text-[#00B4FF]" />
                {step === "map" ? "Confirm Your Location" : "Select Location"}
              </h3>
              <button
                onClick={closeDropdown}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500"
              >
                <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
              </button>
            </div>

            {step === "list" ? (
              <div className="overflow-y-auto custom-scrollbar flex-1 pb-safe">
                {locationError && (
                  <div className="m-3 mb-0 flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl p-3.5 text-xs leading-relaxed">
                    <ClientIcon icon="ph:warning-circle-bold" className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="flex-1">{locationError}</span>
                    <button
                      onClick={() => setLocationError(null)}
                      className="shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                    >
                      <ClientIcon icon="ph:x-bold" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {/* Auto Fetch Option */}
                <div
                  onClick={handleFetchCurrentClick}
                  className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-[#00B4FF]/5 dark:hover:bg-[#00B4FF]/10 cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#00B4FF]/10 group-hover:bg-[#00B4FF]/20 flex items-center justify-center shrink-0 transition-colors">
                    <ClientIcon icon="ph:crosshair-fill" className="text-[#00B4FF] w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#00B4FF]">Use Current Location</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Pinpoint it live on the map</span>
                  </div>
                </div>

                {/* Predefined List */}
                <div className="p-2">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pt-3 pb-2">
                    Popular Cities
                  </div>
                  {PREDEFINED_LOCATIONS.map((loc) => (
                    <div
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc.name)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                        <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 tracking-wide transition-colors">{loc.code}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{loc.name}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{loc.region}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Live Map Step */
              <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
                <div className="w-full h-52 sm:h-56 shrink-0 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                  <MapComponent position={mapPosition} onPositionChange={handlePinMove} />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full pointer-events-none z-[400] whitespace-nowrap shadow-lg flex items-center gap-1.5 font-medium">
                    <ClientIcon icon="ph:hand-tap-bold" className="w-3 h-3 text-[#00B4FF]" />
                    Tap the map to adjust your pin
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800">
                  <ClientIcon icon="ph:map-pin-fill" className="w-4 h-4 text-[#00B4FF] shrink-0 mt-0.5" />
                  {isResolvingPin ? (
                    <span className="text-sm text-slate-400 flex items-center gap-2">
                      <ClientIcon icon="ph:spinner-gap-bold" className="animate-spin w-3.5 h-3.5" /> Detecting address...
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{mapAddress || "Move the pin to your location"}</span>
                  )}
                </div>

                <button
                  onClick={handleConfirmMapLocation}
                  disabled={isResolvingPin}
                  className="w-full py-3.5 bg-gradient-to-br from-[#00B4FF] to-[#0070FF] hover:shadow-lg text-white font-semibold rounded-xl shadow-lg shadow-[#00B4FF]/20 transition-all mt-auto disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  Confirm Location
                  <ClientIcon icon="ph:check-circle-bold" className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
