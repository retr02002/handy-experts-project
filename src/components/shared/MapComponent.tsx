"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
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
    </MapContainer>
  );
}
