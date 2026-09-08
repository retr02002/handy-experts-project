"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
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

interface MapComponentProps {
  position: [number, number];
  onPositionChange: (pos: [number, number]) => void;
}

function LocationMarker({ position, onPositionChange }: MapComponentProps) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon}></Marker>
  );
}

// react-leaflet's <MapContainer center=.../> only reads `center` once, at
// creation — without this, a position update from a search result or "use
// current location" moves the marker's coordinates but the viewport never
// follows it there, so the pin silently ends up off-screen. Runs on every
// position change (including a plain map click, which is a harmless no-op
// pan since that point is already in view).
function RecenterOnChange({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const targetZoom = Math.max(map.getZoom(), 15);
    map.flyTo(position, targetZoom, { animate: true, duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[1]]);
  return null;
}

export default function MapComponent({ position, onPositionChange }: MapComponentProps) {
  const [mapKey, setMapKey] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMapKey((prev) => prev + 1);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MapContainer
      key={mapKey}
      center={position}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} onPositionChange={onPositionChange} />
      <RecenterOnChange position={position} />
    </MapContainer>
  );
}
