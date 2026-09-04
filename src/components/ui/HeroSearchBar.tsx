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
        className="w-full relative flex flex-col md:flex-row items-stretch md:items-center gap-0 mx-auto max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] md:rounded-full p-2 md:p-1.5 shadow-sm transition-colors focus-within:border-[#4285F4]/50 md:focus-within:border-[#4285F4]/50 focus-within:ring-4 focus-within:ring-[#4285F4]/10 md:focus-within:ring-0"
      >
        {/* Location Picker Box */}
        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center justify-between w-full md:w-auto md:min-w-[200px] bg-transparent border-none px-3 py-2.5 md:px-4 md:py-2 cursor-pointer hover:bg-slate-50 md:hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-2xl md:rounded-full ${isFetchingLocation ? 'animate-pulse' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 md:bg-blue-50 md:dark:bg-blue-900/30 shrink-0">
              <ClientIcon icon="ph:map-pin-fill" className="text-slate-700 dark:text-slate-300 md:text-[#4285F4] w-4 h-4" />
            </div>
            <div className="flex flex-col text-left justify-center">
              <span className="text-[14px] md:text-[14px] font-bold text-slate-900 dark:text-white leading-tight">
                {isFetchingLocation ? "Locating..." : locationName}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Select your location</span>
            </div>
          </div>
          <ClientIcon icon="ph:caret-down-bold" className="text-slate-400 w-4 h-4 ml-2 md:ml-4 shrink-0" />
        </div>

        {/* Mobile Divider */}
        <div className="md:hidden w-[calc(100%-32px)] mx-auto h-px bg-slate-100 dark:bg-slate-800/80 my-1" />

        {/* Desktop Divider */}
        <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

        {/* Search Bar Box */}
        <div className="flex items-center flex-1 w-full bg-transparent border-none pl-4 pr-1.5 py-1.5 md:py-0 md:px-3 h-[52px] md:h-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What service do you need?"
            className="bg-transparent border-none outline-none text-slate-900 dark:text-white w-full placeholder:text-slate-400 dark:placeholder:text-slate-500 text-[14px] font-medium min-w-0"
          />
          <button
            type="submit"
            className="bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl md:rounded-full w-10 h-10 flex items-center justify-center transition-colors ml-2 shrink-0"
          >
            <ClientIcon icon="ph:magnifying-glass-bold" className="w-4 h-4" />
          </button>
        </div>
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
