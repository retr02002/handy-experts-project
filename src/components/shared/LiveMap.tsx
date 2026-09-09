"use client";

import { useEffect, useRef, useState } from "react";
import Map, { Marker, Popup, NavigationControl, Source, Layer, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { circlePolygon } from "@/lib/geo";

// OpenFreeMap's public style — free, keyless, no usage cap. See
// https://openfreemap.org. Kept as a single constant so it's easy to swap
// for a self-hosted tile source later without touching call sites.
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// ~0.0005 deg is roughly 55 m. Below this the two points are effectively
// the same place and a bounding box between them is meaningless.
const DEGENERATE_BOUNDS_DEGREES = 0.0005;

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
  /** [lng, lat] pairs — drawn as a route line between two points. */
  routeLine?: [number, number][];
  /**
   * Pans/zooms to cover every marker whenever they move. The map is
   * otherwise uncontrolled (initialViewState is read once at mount), which
   * is fine for a static overview but useless for live tracking.
   */
  fitToMarkers?: boolean;
  /**
   * The black "your business location" dot at the map centre. On by default
   * so the vendor/admin panels keep it; a customer tracking screen turns it
   * off, since the centre there is just a framing device.
   */
  showCenterMarker?: boolean;
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
  routeLine,
  fitToMarkers = false,
  showCenterMarker = true,
}: LiveMapProps) {
  const [hoveredTech, setHoveredTech] = useState<TechnicianMarkerData | null>(null);
  const [hoveredVendor, setHoveredVendor] = useState<VendorMarkerData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapRef = useRef<MapRef | null>(null);

  // Every point the caller wants visible, as a stable key so the effect only
  // refits when something actually moved.
  const fitPoints: [number, number][] = fitToMarkers
    ? [
        ...liveCallMarkers.map((m) => [m.longitude, m.latitude] as [number, number]),
        ...technicianMarkers.map((m) => [m.longitude, m.latitude] as [number, number]),
        ...vendorMarkers.map((m) => [m.longitude, m.latitude] as [number, number]),
      ]
    : [];
  const fitKey = fitPoints.map(([lng, lat]) => `${lng.toFixed(5)},${lat.toFixed(5)}`).join("|");

  useEffect(() => {
    // Nothing can be framed until the style has loaded — calling fitBounds
    // before that silently no-ops, which left the very first route render
    // sitting at the mount viewport with its markers off-screen.
    if (!fitToMarkers || fitPoints.length === 0 || !isLoaded) return;
    const map = mapRef.current;
    if (!map) return;

    if (fitPoints.length === 1) {
      map.easeTo({ center: fitPoints[0], zoom: 15, duration: 600 });
      return;
    }

    const lngs = fitPoints.map((p) => p[0]);
    const lats = fitPoints.map((p) => p[1]);
    const [west, east] = [Math.min(...lngs), Math.max(...lngs)];
    const [south, north] = [Math.min(...lats), Math.max(...lats)];

    // Two points a few metres apart make a near-zero-area box. fitBounds on
    // that produces an absurd zoom (and with padding larger than the canvas,
    // an invalid one), so frame the midpoint at a fixed close zoom instead.
    if (east - west < DEGENERATE_BOUNDS_DEGREES && north - south < DEGENERATE_BOUNDS_DEGREES) {
      map.easeTo({ center: [(west + east) / 2, (south + north) / 2], zoom: 17, duration: 600 });
      return;
    }

    // Padding has to leave room for actual map: on a 220px-tall card, 64px
    // top and bottom is more than half the canvas.
    const canvas = map.getCanvas();
    const padding = Math.max(
      16,
      Math.min(56, Math.floor(Math.min(canvas.clientWidth, canvas.clientHeight) / 5))
    );

    map.fitBounds(
      [
        [west, south],
        [east, north],
      ],
      { padding, maxZoom: 16, duration: 600 }
    );
    // fitKey collapses the coordinate list into one primitive dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, fitToMarkers, isLoaded]);

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: centerLongitude, latitude: centerLatitude, zoom: 11 }}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        onLoad={() => setIsLoaded(true)}
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

        {routeLine && routeLine.length > 1 && (
          <Source
            id="job-route"
            type="geojson"
            data={{
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: routeLine },
            }}
          >
            <Layer
              id="job-route-casing"
              type="line"
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={{ "line-color": "#ffffff", "line-width": 7, "line-opacity": 0.9 }}
            />
            <Layer
              id="job-route-line"
              type="line"
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={{ "line-color": "#00B4FF", "line-width": 4 }}
            />
          </Source>
        )}

        {showCenterMarker && (
          <Marker longitude={centerLongitude} latitude={centerLatitude} anchor="center">
            <div
              title="Your business location"
              className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white border-2 border-white dark:border-slate-900 shadow-md"
            />
          </Marker>
        )}

        {liveCallMarkers.map((call) => (
          <Marker
            key={call.id}
            longitude={call.longitude}
            latitude={call.latitude}
            anchor="bottom"
            onClick={() => onCallMarkerClick?.(call.id)}
            style={{ zIndex: 2 }}
          >
            <div className="relative w-7 h-7 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-[#00B4FF]/60 animate-ping" />
              <button
                type="button"
                title={call.label}
                className="relative w-7 h-7 rounded-full bg-[#00B4FF] text-white border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
              >
                <ClientIcon icon="ph:phone-call-fill" className="w-3.5 h-3.5" />
              </button>
            </div>
          </Marker>
        ))}

        {technicianMarkers.map((tech) => (
          <Marker key={tech.id} longitude={tech.longitude} latitude={tech.latitude} anchor="bottom" style={{ zIndex: 1 }}>
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
