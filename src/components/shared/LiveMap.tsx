"use client";

import { useState } from "react";
import Map, { Marker, Popup, NavigationControl, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { circlePolygon } from "@/lib/geo";

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
  skillCategory: string;
  phone: string;
}

export interface VendorMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  contactName: string;
  phone: string;
  technicianCount: number;
  isActive: boolean;
}

export interface ServiceAreaCircleData {
  id: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

interface LiveMapProps {
  centerLatitude: number;
  centerLongitude: number;
  liveCallMarkers?: LiveCallMarkerData[];
  technicianMarkers?: TechnicianMarkerData[];
  vendorMarkers?: VendorMarkerData[];
  serviceAreaCircles?: ServiceAreaCircleData[];
  technicianServiceAreaCircles?: ServiceAreaCircleData[];
  onCallMarkerClick?: (id: string) => void;
  height?: string;
}

export function LiveMap({
  centerLatitude,
  centerLongitude,
  liveCallMarkers = [],
  technicianMarkers = [],
  vendorMarkers = [],
  serviceAreaCircles = [],
  technicianServiceAreaCircles = [],
  onCallMarkerClick,
  height = "500px",
}: LiveMapProps) {
  const [hoveredTech, setHoveredTech] = useState<TechnicianMarkerData | null>(null);
  const [hoveredVendor, setHoveredVendor] = useState<VendorMarkerData | null>(null);

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden">
      <Map
        initialViewState={{ longitude: centerLongitude, latitude: centerLatitude, zoom: 11 }}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />

        {/* MapLibre has no native circle primitive — each area is a
            generated GeoJSON polygon rendered as one shared fill + line
            layer, drawn first so markers sit visually on top. Vendor
            coverage is green, technician coverage is blue. */}
        {serviceAreaCircles.length > 0 && (
          <Source
            id="service-area-circles"
            type="geojson"
            data={{
              type: "FeatureCollection",
              features: serviceAreaCircles.map((c) => circlePolygon(c.latitude, c.longitude, c.radiusKm)),
            }}
          >
            <Layer id="service-area-fill" type="fill" paint={{ "fill-color": "#22c55e", "fill-opacity": 0.15 }} />
            <Layer id="service-area-line" type="line" paint={{ "line-color": "#22c55e", "line-width": 2 }} />
          </Source>
        )}

        {technicianServiceAreaCircles.length > 0 && (
          <Source
            id="technician-service-area-circles"
            type="geojson"
            data={{
              type: "FeatureCollection",
              features: technicianServiceAreaCircles.map((c) => circlePolygon(c.latitude, c.longitude, c.radiusKm)),
            }}
          >
            <Layer id="technician-service-area-fill" type="fill" paint={{ "fill-color": "#3b82f6", "fill-opacity": 0.15 }} />
            <Layer id="technician-service-area-line" type="line" paint={{ "line-color": "#3b82f6", "line-width": 2 }} />
          </Source>
        )}

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
              onMouseEnter={() => setHoveredTech(tech)}
              onMouseLeave={() => setHoveredTech((cur) => (cur?.id === tech.id ? null : cur))}
              className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-colors cursor-pointer ${
                tech.isOnDuty ? "bg-emerald-500" : "bg-slate-400"
              }`}
            >
              <ClientIcon icon="ph:user-fill" className="w-3 h-3 text-white" />
            </div>
          </Marker>
        ))}

        {vendorMarkers.map((vendor) => (
          <Marker key={vendor.id} longitude={vendor.longitude} latitude={vendor.latitude} anchor="bottom">
            <div
              onMouseEnter={() => setHoveredVendor(vendor)}
              onMouseLeave={() => setHoveredVendor((cur) => (cur?.id === vendor.id ? null : cur))}
              className="w-6 h-6 rounded-full bg-violet-500 border-2 border-white shadow-lg flex items-center justify-center cursor-pointer"
            >
              <ClientIcon icon="ph:user-fill" className="w-3 h-3 text-white" />
            </div>
          </Marker>
        ))}

        {/* closeOnClick defaults to true and would otherwise fight the
            hover-driven onMouseLeave unmount — gate visibility purely on
            our own hover state instead. */}
        {hoveredTech && (
          <Popup
            longitude={hoveredTech.longitude}
            latitude={hoveredTech.latitude}
            anchor="bottom"
            offset={12}
            closeButton={false}
            closeOnClick={false}
            onClose={() => setHoveredTech(null)}
          >
            <div className="text-sm min-w-[160px]">
              <p className="font-bold text-slate-900">{hoveredTech.label}</p>
              <p className="text-slate-600">{hoveredTech.skillCategory}</p>
              <p className="text-slate-600">
                <span className={hoveredTech.isOnDuty ? "text-emerald-600 font-semibold" : "text-slate-400"}>
                  {hoveredTech.isOnDuty ? "On duty" : "Off duty"}
                </span>
                {hoveredTech.phone && <> &middot; {hoveredTech.phone}</>}
              </p>
            </div>
          </Popup>
        )}

        {hoveredVendor && (
          <Popup
            longitude={hoveredVendor.longitude}
            latitude={hoveredVendor.latitude}
            anchor="bottom"
            offset={12}
            closeButton={false}
            closeOnClick={false}
            onClose={() => setHoveredVendor(null)}
          >
            <div className="text-sm min-w-[180px]">
              <p className="font-bold text-slate-900">{hoveredVendor.label}</p>
              <p className="text-slate-600">{hoveredVendor.contactName}</p>
              <p className="text-slate-600">{hoveredVendor.phone}</p>
              <p className="text-slate-600">
                {hoveredVendor.technicianCount} technician{hoveredVendor.technicianCount === 1 ? "" : "s"}
                {" · "}
                <span className={hoveredVendor.isActive ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
                  {hoveredVendor.isActive ? "Active" : "Deactivated"}
                </span>
              </p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
