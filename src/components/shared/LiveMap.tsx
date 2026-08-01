"use client";

import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { ClientIcon } from "@/components/ui/ClientIcon";

// OpenFreeMap's public style — free, keyless, no usage cap. See
// https://openfreemap.org. Kept as a single constant so it's easy to swap
// for a self-hosted tile source later without touching call sites.
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

export interface LiveCallMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
}

export interface TechnicianMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  isOnDuty: boolean;
}

interface LiveMapProps {
  centerLatitude: number;
  centerLongitude: number;
  liveCallMarkers?: LiveCallMarkerData[];
  technicianMarkers?: TechnicianMarkerData[];
  onCallMarkerClick?: (id: string) => void;
  height?: string;
}

export function LiveMap({
  centerLatitude,
  centerLongitude,
  liveCallMarkers = [],
  technicianMarkers = [],
  onCallMarkerClick,
  height = "500px",
}: LiveMapProps) {
  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden">
      <Map
        initialViewState={{ longitude: centerLongitude, latitude: centerLatitude, zoom: 11 }}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />

        <Marker longitude={centerLongitude} latitude={centerLatitude} anchor="center">
          <div
            title="Your business location"
            className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white border-2 border-white dark:border-slate-900 shadow-md"
          />
        </Marker>

        {liveCallMarkers.map((call) => (
          <Marker
            key={call.id}
            longitude={call.longitude}
            latitude={call.latitude}
            anchor="bottom"
            onClick={() => onCallMarkerClick?.(call.id)}
          >
            <button
              type="button"
              title={call.label}
              className="w-7 h-7 rounded-full bg-[#00B4FF] text-white border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            >
              <ClientIcon icon="ph:phone-call-fill" className="w-3.5 h-3.5" />
            </button>
          </Marker>
        ))}

        {technicianMarkers.map((tech) => (
          <Marker key={tech.id} longitude={tech.longitude} latitude={tech.latitude} anchor="bottom">
            <div
              title={tech.label}
              className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-colors ${
                tech.isOnDuty ? "bg-emerald-500" : "bg-slate-400"
              }`}
            >
              <ClientIcon icon="ph:user-fill" className="w-3 h-3 text-white" />
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
