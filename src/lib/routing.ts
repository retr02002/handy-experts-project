import { haversineKm } from "@/lib/geo";

/**
 * Road factor applied to straight-line distance when we couldn't get a real
 * route — streets are never as short as the crow flies, and understating the
 * distance to a customer is worse than roughly overstating it.
 */
const STRAIGHT_LINE_ROAD_FACTOR = 1.3;

/** Rough urban driving speed used only for the fallback ETA. */
const FALLBACK_SPEED_KMH = 22;

/**
 * OSRM's public profile routes at free-flow speeds with no traffic data
 * whatsoever, so its raw ETA is wildly optimistic in Indian cities — on a
 * sample Delhi leg it returned 3.4 min where Google (with live traffic) said
 * 9. This multiplier pulls the estimate back toward reality. It's a blunt
 * heuristic, not a traffic model: a real ETA needs a routing provider that
 * actually has traffic data, and ETAs are labelled "approx" in the UI
 * because of it.
 */
const OSRM_CONGESTION_FACTOR = 1.9;

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";
const OSRM_TIMEOUT_MS = 4000;

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  /** [lng, lat] pairs, ready to hand straight to a GeoJSON LineString. */
  coordinates: [number, number][];
  distanceKm: number;
  durationMin: number;
  /** "straight" means the routing service didn't answer and this is an estimate. */
  source: "osrm" | "straight";
}

function straightLineRoute(from: LatLng, to: LatLng): RouteResult {
  const direct = haversineKm(from.latitude, from.longitude, to.latitude, to.longitude);
  const distanceKm = direct * STRAIGHT_LINE_ROAD_FACTOR;
  return {
    coordinates: [
      [from.longitude, from.latitude],
      [to.longitude, to.latitude],
    ],
    distanceKm,
    durationMin: (distanceKm / FALLBACK_SPEED_KMH) * 60,
    source: "straight",
  };
}

/**
 * Driving route between two points via OSRM's free public API — no key, no
 * billing. That server offers no uptime guarantee, so every failure path
 * (non-200, malformed body, timeout, network error) degrades to a straight
 * line rather than breaking the tracking screen. Swap OSRM_BASE for a
 * self-hosted instance before this carries real traffic.
 */
export async function getRoute(from: LatLng, to: LatLng): Promise<RouteResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);

  try {
    const url =
      `${OSRM_BASE}/${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
      `?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return straightLineRoute(from, to);

    const data = await res.json();
    const route = data?.routes?.[0];
    const coordinates = route?.geometry?.coordinates;
    if (!route || !Array.isArray(coordinates) || coordinates.length === 0) {
      return straightLineRoute(from, to);
    }

    return {
      coordinates: coordinates as [number, number][],
      distanceKm: route.distance / 1000,
      durationMin: (route.duration / 60) * OSRM_CONGESTION_FACTOR,
      source: "osrm",
    };
  } catch {
    return straightLineRoute(from, to);
  } finally {
    clearTimeout(timeout);
  }
}
