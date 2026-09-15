/** Great-circle distance between two lat/lng points, in kilometers. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Default radius (km) within which a vendor is considered "nearby" a live call. */
export const DEFAULT_RADIUS_KM = 15;

/** A position reading from a technician's device at the moment they hit a job gate. */
export interface GeoFix {
  latitude: number;
  longitude: number;
  /** The device's own reported uncertainty, in metres, when it gives one. */
  accuracyM?: number | null;
}

export type GeofenceReason = "INSIDE" | "OUTSIDE" | "NO_CUSTOMER_COORDS" | "NO_FIX" | "BYPASSED";

export interface GeofenceResult {
  ok: boolean;
  /** Null when no distance could be computed at all (no fix, or no customer coords). */
  distanceM: number | null;
  effectiveRadiusM: number;
  reason: GeofenceReason;
}

/**
 * 0,0 is in the Gulf of Guinea, not a real Indian service address — it's
 * what a failed geocode writes. Treating it as "unknown" rather than a
 * location is what stops the fence from measuring against the null island.
 */
export function hasUsableCoords(latitude: number | null, longitude: number | null): boolean {
  if (latitude === null || longitude === null) return false;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  if (Math.abs(latitude) < 0.0001 && Math.abs(longitude) < 0.0001) return false;
  return Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
}

/**
 * Decides whether a technician is close enough to the job to start or
 * finish it.
 *
 * Fails OPEN in every case where we can't honestly measure: no customer
 * coordinates (a bad geocode is the platform's fault, not the technician's,
 * and they'd otherwise be permanently unable to work that job). Fails
 * CLOSED only when we have both points and the distance genuinely exceeds
 * the radius.
 *
 * The device's own accuracy widens the radius, capped by the caller's
 * grace: a phone reporting ±120m inside a concrete building isn't evidence
 * the technician is absent, it's evidence the phone doesn't know.
 */
export function evaluateGeofence(
  customer: { latitude: number | null; longitude: number | null },
  fix: GeoFix | null,
  opts: { radiusM: number; accuracyGraceM: number; bypass?: boolean }
): GeofenceResult {
  const { radiusM, accuracyGraceM, bypass = false } = opts;

  if (bypass) return { ok: true, distanceM: null, effectiveRadiusM: radiusM, reason: "BYPASSED" };
  if (!hasUsableCoords(customer.latitude, customer.longitude)) {
    return { ok: true, distanceM: null, effectiveRadiusM: radiusM, reason: "NO_CUSTOMER_COORDS" };
  }
  if (!fix || !hasUsableCoords(fix.latitude, fix.longitude)) {
    return { ok: false, distanceM: null, effectiveRadiusM: radiusM, reason: "NO_FIX" };
  }

  const distanceM = haversineKm(customer.latitude!, customer.longitude!, fix.latitude, fix.longitude) * 1000;
  const grace = Math.min(Math.max(fix.accuracyM ?? 0, 0), accuracyGraceM);
  const effectiveRadiusM = radiusM + grace;

  return {
    ok: distanceM <= effectiveRadiusM,
    distanceM,
    effectiveRadiusM,
    reason: distanceM <= effectiveRadiusM ? "INSIDE" : "OUTSIDE",
  };
}

/** "42 m" / "2.3 km" — for telling a technician how far off they are. */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Generates an N-point polygon approximating a circle of `radiusKm` around
 * a center point, for rendering as a GeoJSON fill/line layer. MapLibre (the
 * live-calls map library) has no native `<Circle>` primitive the way Leaflet
 * does — a "circle" there is just a polygon — so this walks the standard
 * spherical "destination point given bearing + distance" formula around
 * 360° rather than pulling in @turf/circle for one generated shape.
 */
export function circlePolygon(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  points = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const R = 6371; // Earth's radius in km
  const latRad = (centerLat * Math.PI) / 180;
  const lngRad = (centerLng * Math.PI) / 180;
  const angularDistance = radiusKm / R;

  const coordinates: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const bearing = (i * 2 * Math.PI) / points;
    const destLat = Math.asin(
      Math.sin(latRad) * Math.cos(angularDistance) + Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearing)
    );
    const destLng =
      lngRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRad),
        Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(destLat)
      );
    coordinates.push([(destLng * 180) / Math.PI, (destLat * 180) / Math.PI]);
  }

  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [coordinates] },
  };
}
