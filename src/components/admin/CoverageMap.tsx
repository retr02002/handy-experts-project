"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker icon issues in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Area {
  id: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  pincode: string;
}

interface CoverageMapProps {
  areas: Area[];
  draftPin: { latitude: number; longitude: number } | null;
  draftRadiusKm: number;
  onMapClick: (lat: number, lng: number, locationName?: string) => void;
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number, locationName?: string) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapFitter({ areas, draftPin }: { areas: Area[], draftPin: { latitude: number; longitude: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (areas.length === 0 && !draftPin) return;

    const bounds = L.latLngBounds([]);
    areas.forEach((a) => {
      if (a.latitude && a.longitude) {
        bounds.extend([a.latitude, a.longitude]);
      }
    });
    if (draftPin) {
      bounds.extend([draftPin.latitude, draftPin.longitude]);
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [areas, draftPin, map]);
  return null;
}

import { useDebounce } from "@/hooks/useDebounce";
import { ClientIcon } from "@/components/ui/ClientIcon";

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    const container = map.getContainer();
    resizeObserver.observe(container);

    // Also trigger it manually after a small delay to handle initial tab mounting
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [map]);
  return null;
}

function MapFlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14, { duration: 1 });
    }
  }, [position, map]);
  return null;
}

interface SearchResult {
  name?: string;
  display_name: string;
  lat: string;
  lon: string;
}

export function CoverageMap({ areas, draftPin, draftRadiusKm, onMapClick }: CoverageMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [flyToPos, setFlyToPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    let cancelled = false;

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
        if (!cancelled) setSearchResults(data);
      } catch (error) {
        // ignore errors
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    };

    fetchResults();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearchQuery]);

  const selectSearchResult = (result: SearchResult) => {
    const locName = result.name || result.display_name.split(",")[0];
    setSearchQuery(locName);
    setSearchResults([]);
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setFlyToPos([lat, lon]);
    onMapClick(lat, lon, locName);
  };

  return (
    <div className="w-full h-[350px] relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
      
      {/* Search Bar Overlay */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-[400]">
        <div className="relative">
          <div className="relative bg-white dark:bg-slate-900 shadow-md rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            {isSearching ? (
              <ClientIcon icon="ph:spinner-gap-bold" className="w-4 h-4 text-[#00B4FF] absolute left-3 top-1/2 -translate-y-1/2 animate-spin" />
            ) : (
              <ClientIcon icon="ph:magnifying-glass" className="w-4 h-4 text-[#00B4FF] absolute left-3 top-1/2 -translate-y-1/2" />
            )}
            <input 
              type="text" 
              placeholder="Search area (e.g. Banjara Hills, Hyderabad)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-sm bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400"
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
      </div>

      <MapContainer
        center={[20.5937, 78.9629]} // default India
        zoom={4}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {areas.map((area) => {
          if (!area.latitude || !area.longitude) return null;
          return (
            <React.Fragment key={area.id}>
              <Circle
                center={[area.latitude, area.longitude]}
                radius={area.radiusKm * 1000}
                pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.2 }}
              />
              <Marker position={[area.latitude, area.longitude]} icon={icon} />
            </React.Fragment>
          );
        })}

        {draftPin && (
          <>
            <Circle
              center={[draftPin.latitude, draftPin.longitude]}
              radius={draftRadiusKm * 1000}
              pathOptions={{ color: "#00B4FF", fillColor: "#00B4FF", fillOpacity: 0.2, dashArray: "4 4" }}
            />
            <Marker position={[draftPin.latitude, draftPin.longitude]} icon={icon} />
          </>
        )}

        <MapEvents onMapClick={onMapClick} />
        <MapFitter areas={areas} draftPin={draftPin} />
        <MapResizer />
        <MapFlyTo position={flyToPos} />
      </MapContainer>
    </div>
  );
}
