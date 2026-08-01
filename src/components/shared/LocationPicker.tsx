"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { ClientIcon } from "@/components/ui/ClientIcon";

const MapComponent = dynamic(() => import("./MapComponent"), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div> 
});

export type SavedAddress = {
  id: string;
  label: "Home" | "Work" | "Other";
  addressLine: string;
  lat: number;
  lng: number;
};

export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
}

// Custom hook for debouncing search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export function LocationPicker() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [position, setPosition] = useState<[number, number]>([28.6139, 77.2090]); // Default New Delhi
  const [currentAddress, setCurrentAddress] = useState("Select your location");
  
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Form state
  const [formAddressLine, setFormAddressLine] = useState("");
  const [formLabel, setFormLabel] = useState<"Home" | "Work" | "Other">("Home");

  // Load initial state
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const stored = localStorage.getItem("savedAddresses");
      if (stored) {
        setSavedAddresses(JSON.parse(stored));
      }
      const currentLoc = localStorage.getItem("currentLocation");
      if (currentLoc) {
        const parsed = JSON.parse(currentLoc);
        setCurrentAddress(parsed.addressLine);
        setPosition([parsed.lat, parsed.lng]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Debounced Search Effect
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      const timer = setTimeout(() => {
        setSearchResults([]);
      }, 0);
      return () => clearTimeout(timer);
    }
    
    const fetchResults = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedSearchQuery)}&addressdetails=1&limit=5`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };
    
    fetchResults();
  }, [debouncedSearchQuery]);

  const saveCurrentLocation = (address: string, lat: number, lng: number) => {
    const loc = { addressLine: address, lat, lng };
    localStorage.setItem("currentLocation", JSON.stringify(loc));
    setCurrentAddress(address);
    setPosition([lat, lng]);
  };

  const selectSearchResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPosition([lat, lng]);
    setFormAddressLine(result.display_name);
    setSearchResults([]);
    setSearchQuery(result.name || result.display_name.split(",")[0]);
    
    // Automatically transition to the "Add New Address" screen so they can adjust the pin
    setIsAddingNew(true);
  };

  const handleMapClick = async (newPos: [number, number]) => {
    setPosition(newPos);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos[0]}&lon=${newPos[1]}`);
      const data = await res.json();
      if (data && data.display_name) {
        setFormAddressLine(data.display_name);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        handleMapClick([lat, lng]);
        setIsAddingNew(true); // Move to the pin adjustment screen
      }, () => {
        alert("Location access denied or failed.");
      }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    }
  };

  const saveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAddressLine.trim()) return;
    
    const newAddress: SavedAddress = {
      id: Math.random().toString(36).substring(7),
      label: formLabel,
      addressLine: formAddressLine,
      lat: position[0],
      lng: position[1]
    };
    
    const updated = [...savedAddresses, newAddress];
    setSavedAddresses(updated);
    localStorage.setItem("savedAddresses", JSON.stringify(updated));
    
    // Also set as current
    saveCurrentLocation(newAddress.addressLine, newAddress.lat, newAddress.lng);
    
    setIsAddingNew(false);
    setIsOpen(false);
  };

  const selectSavedAddress = (addr: SavedAddress) => {
    saveCurrentLocation(addr.addressLine, addr.lat, addr.lng);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 pr-2.5 pl-1.5 py-1 md:py-1.5 bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full transition-all group max-w-[160px] sm:max-w-[220px] md:max-w-xs shadow-sm"
      >
        <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center shrink-0">
          <ClientIcon icon="ph:map-pin-fill" className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-500" />
        </div>
        <div className="flex flex-col items-start truncate min-w-0 flex-1">
          <span className="text-[8px] md:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none mb-[2px]">Delivery</span>
          <span className="text-[11px] md:text-xs font-semibold text-slate-800 dark:text-white truncate w-full leading-none">{currentAddress}</span>
        </div>
        <ClientIcon icon="ph:caret-down-bold" className="w-3 h-3 text-slate-400 shrink-0 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
      </button>

      {/* Modal */}
      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 border-t sm:border border-white/20 dark:border-slate-800 mt-12 sm:mt-0">
            {/* Header */}
            <div className="flex flex-col p-4 border-b border-slate-100 dark:border-slate-800/50 sticky top-0 bg-transparent z-10 shrink-0">
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
              <div className="flex items-center justify-between w-full">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {isAddingNew ? "Pinpoint Location" : "Select Delivery Location"}
                </h2>
                <button onClick={() => {
                  if (isAddingNew) setIsAddingNew(false);
                  else setIsOpen(false);
                }} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                  <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-5">
              
              {!isAddingNew ? (
                <>
                  {/* Search Bar - Plug and Play Feel */}
                  <form onSubmit={(e) => e.preventDefault()} className="relative z-20">
                    <div className="relative group">
                      {isSearching ? (
                        <ClientIcon icon="ph:spinner-gap-bold" className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2 animate-spin" />
                      ) : (
                        <ClientIcon icon="ph:magnifying-glass" className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-transform group-focus-within:scale-110" />
                      )}
                      <input 
                        type="text" 
                        placeholder="Search for area, street name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-10 pr-10 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:bg-white dark:focus:bg-[#1E293B] focus:border-rose-500/50 text-slate-900 dark:text-white transition-all shadow-sm"
                      />
                      {searchQuery && (
                        <button 
                          type="button" 
                          onClick={() => { setSearchQuery(""); setSearchResults([]); }} 
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <ClientIcon icon="ph:x-circle-fill" className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Autocomplete Dropdown */}
                    {searchResults.length > 0 && searchQuery && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {searchResults.map((res: NominatimResult, idx) => (
                          <button 
                            key={idx}
                            type="button"
                            onClick={() => selectSearchResult(res)}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 border-b last:border-b-0 border-slate-100 dark:border-slate-800/80 hover:bg-rose-50/50 dark:hover:bg-slate-800/80 text-sm transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex flex-shrink-0 items-center justify-center group-hover:bg-rose-100 dark:group-hover:bg-rose-900/30 transition-colors">
                              <ClientIcon icon="ph:map-pin-fill" className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-slate-900 dark:text-white block truncate">{res.name || res.display_name.split(",")[0]}</span>
                              <span className="text-[11px] text-slate-500 truncate block mt-0.5">{res.display_name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </form>

                  {/* Detect Location */}
                  <button onClick={detectLocation} className="flex items-center gap-3 w-full p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 hover:bg-rose-50/50 dark:hover:bg-rose-500/10 transition-all text-left group">
                    <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0">
                      <ClientIcon icon="ph:crosshair-simple" className="w-4 h-4 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">Use current location</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Using GPS</p>
                    </div>
                    <ClientIcon icon="ph:caret-right-bold" className="w-4 h-4 text-rose-300 dark:text-rose-700 ml-auto group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Saved Addresses */}
                  {savedAddresses.length > 0 && (
                    <div className="mt-2">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Saved Addresses</h3>
                      <div className="space-y-1.5">
                        {savedAddresses.map(addr => (
                          <button 
                            key={addr.id}
                            onClick={() => selectSavedAddress(addr)}
                            className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                              <ClientIcon 
                                icon={addr.label === "Home" ? "ph:house-fill" : addr.label === "Work" ? "ph:briefcase-fill" : "ph:map-pin-fill"} 
                                className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-rose-500 transition-colors" 
                              />
                            </div>
                            <div className="overflow-hidden flex-1">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{addr.label}</p>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">{addr.addressLine}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => setIsAddingNew(true)}
                    className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <ClientIcon icon="ph:plus-bold" className="w-4 h-4" />
                    Add New Address Manually
                  </button>
                </>
              ) : (
                /* Add New Address Form (Compact) */
                <form onSubmit={saveNewAddress} className="flex flex-col gap-4 h-full relative">
                  <div className="w-full h-40 sm:h-48 shrink-0 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                    <MapComponent position={position} onPositionChange={handleMapClick} />
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full pointer-events-none z-[400] whitespace-nowrap shadow-lg flex items-center gap-1.5 font-medium">
                      <ClientIcon icon="ph:arrows-out-cardinal-bold" className="w-3 h-3 text-rose-400" />
                      Move map to adjust pin
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">Address Details</label>
                      <textarea 
                        required
                        value={formAddressLine}
                        onChange={(e) => setFormAddressLine(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#1E293B]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-slate-900 dark:text-white resize-none h-20 shadow-sm transition-all"
                        placeholder="House No, Floor, Building Name, Street..."
                      />
                    </div>
                    
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 block uppercase tracking-wider">Save As</label>
                      <div className="flex items-center gap-2">
                        {(["Home", "Work", "Other"] as const).map(label => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => setFormLabel(label)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm font-semibold transition-all ${
                              formLabel === label 
                                ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/20 dark:border-rose-500/50 dark:text-rose-400 shadow-sm" 
                                : "bg-white dark:bg-[#1E293B]/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                            }`}
                          >
                            <ClientIcon 
                              icon={label === "Home" ? "ph:house-fill" : label === "Work" ? "ph:briefcase-fill" : "ph:map-pin-fill"} 
                              className={`w-4 h-4 ${formLabel === label ? "text-rose-500" : ""}`} 
                            />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/20 transition-all mt-auto sm:mt-2 shrink-0 flex items-center justify-center gap-2"
                  >
                    Confirm Location
                    <ClientIcon icon="ph:check-circle-bold" className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
