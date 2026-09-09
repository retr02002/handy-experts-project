/**
 * Deep links out to whichever maps app the person actually uses. Every
 * provider gets the same destination; only Google and Apple accept an
 * explicit origin, and even there it's better to omit it so the app uses the
 * device's own live position rather than a coordinate we captured seconds ago.
 */
export interface MapProvider {
  id: string;
  label: string;
  icon: string;
  url: (lat: number, lng: number, label?: string) => string;
}

export const MAP_PROVIDERS: MapProvider[] = [
  {
    id: "google",
    label: "Google Maps",
    icon: "ph:google-logo-bold",
    url: (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
  },
  {
    id: "apple",
    label: "Apple Maps",
    icon: "ph:apple-logo-fill",
    url: (lat, lng) => `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`,
  },
  {
    id: "osm",
    label: "OpenStreetMap",
    icon: "ph:map-trifold-bold",
    url: (lat, lng) => `https://www.openstreetmap.org/directions?to=${lat},${lng}`,
  },
  {
    id: "geo",
    label: "Default maps app",
    icon: "ph:navigation-arrow-bold",
    // Handled by whatever the OS has registered; the label makes the pin
    // readable once it opens.
    url: (lat, lng, label) => `geo:${lat},${lng}?q=${lat},${lng}${label ? `(${encodeURIComponent(label)})` : ""}`,
  },
];

/** Formats a distance for display — metres under 1km, one decimal above. */
export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/** Formats an ETA in minutes, rolling over to hours past 60. */
export function formatEta(minutes: number): string {
  const mins = Math.max(1, Math.round(minutes));
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}
