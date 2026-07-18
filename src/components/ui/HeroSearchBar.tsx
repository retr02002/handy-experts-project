"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ClientIcon } from "@/components/ui/ClientIcon";

const PREDEFINED_LOCATIONS = [
  { id: "del", code: "DEL", name: "New Delhi", region: "Delhi NCR" },
  { id: "mum", code: "BOM", name: "Mumbai", region: "Maharashtra" },
  { id: "blr", code: "BLR", name: "Bangalore", region: "Karnataka" },
  { id: "pun", code: "PNQ", name: "Pune", region: "Maharashtra" },
  { id: "hyd", code: "HYD", name: "Hyderabad", region: "Telangana" },
];

export function HeroSearchBar() {
  const [locationName, setLocationName] = useState("New Delhi");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isDropdownOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDropdownOpen]);

  const fetchLiveLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) alert("Geolocation is not supported by your browser");
      return;
    }

    setIsFetchingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Using Nominatim for reverse geocoding (Free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data && data.address) {
            // Try to get the most specific local area (neighbourhood, suburb) plus postcode
            const localArea = 
              data.address.neighbourhood || 
              data.address.suburb || 
              data.address.city_district || 
              data.address.city || 
              "Unknown Location";
              
            const pincode = data.address.postcode ? `, ${data.address.postcode}` : "";
            
            setLocationName(`${localArea}${pincode}`);
          } else {
            setLocationName("Location Found");
          }
        } catch (error) {
          console.error("Error fetching location details:", error);
          if (!silent) alert("Failed to get location details.");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        if (!silent) {
          console.error("Error getting location:", error.message || error);
          alert("Please allow location access to fetch your live area.");
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
    setIsDropdownOpen(false);
  };

  const handleFetchCurrentClick = () => {
    fetchLiveLocation(false);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="w-full relative flex items-center bg-white/95 dark:bg-slate-900/80 backdrop-blur-2xl rounded-full p-1.5 sm:p-2 border border-slate-200/80 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] mx-auto max-w-2xl transition-all focus-within:ring-2 focus-within:ring-[#00B4FF]/40 hover:-translate-y-0.5">
        
        {/* Inset Location Badge */}
        <div className="relative shrink-0" ref={dropdownRef}>
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
            placeholder="What do you need?"
            className="bg-transparent border-none outline-none text-slate-900 dark:text-white w-full placeholder:text-slate-400 dark:placeholder:text-slate-500 text-[13px] sm:text-base font-medium min-w-0"
          />
        </div>

        {/* Search Action */}
        <button className="bg-gradient-to-br from-[#00B4FF] to-[#0070FF] text-white rounded-full w-9 h-9 sm:w-auto sm:h-11 sm:px-7 flex items-center justify-center transition-all shadow-[0_2px_10px_rgba(0,180,255,0.3)] hover:shadow-[0_4px_15px_rgba(0,180,255,0.5)] hover:scale-105 active:scale-95 shrink-0 group border border-white/20">
          <span className="hidden sm:inline font-bold text-[15px] tracking-wide">Search</span>
          <ClientIcon icon="ph:arrow-right-bold" className="sm:hidden w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Responsive Modal (Rendered in Portal) */}
      {isDropdownOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex flex-col sm:items-center sm:justify-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsDropdownOpen(false)} // Clicking backdrop closes modal
        >
          {/* Modal Container */}
          <div 
            className="bg-white dark:bg-slate-900 w-full sm:max-w-[380px] max-h-[85vh] sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-8 sm:zoom-in-95 duration-300 mt-auto sm:mt-0"
            onClick={(e) => e.stopPropagation()} // Prevent clicking inside modal from closing it
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ClientIcon icon="ph:map-pin-bold" className="w-4 h-4 text-[#00B4FF]" />
                Select Location
              </h3>
              <button 
                onClick={() => setIsDropdownOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500"
              >
                <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
              </button>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 pb-safe">
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
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Auto-detect via GPS</span>
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
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
