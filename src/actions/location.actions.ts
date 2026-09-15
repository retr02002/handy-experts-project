"use server";

import type { ActionResponse } from "@/actions/auth.actions";
import { normalizeCityName, type ServiceableCity } from "@/lib/cities";

export interface ReverseGeocodeResult {
  displayName: string;
  localArea: string;
  pincode: string;
  /** Normalized to one of our serviceable hub cities, or null if outside coverage. */
  city: ServiceableCity | null;
  /** Raw city/town name as returned by the geocoder, for general address-form autofill. */
  rawCity: string;
  /** Raw state/province name as returned by the geocoder. */
  rawState: string;
}

export async function reverseGeocodeAction(
  lat: number,
  lng: number
): Promise<ActionResponse<ReverseGeocodeResult>> {
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    Number.isNaN(lat) ||
    Number.isNaN(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return { success: false, error: "Invalid coordinates" };
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          // Nominatim's usage policy requires a way to identify the calling application.
          "User-Agent": "Handyzo/1.0 (hello@Handyzo.in)",
        },
      }
    );

    if (!res.ok) {
      return { success: false, error: "Reverse geocoding request failed" };
    }

    const data = await res.json();
    const address = data?.address;
    if (!address) {
      return { success: false, error: "No address found for this location" };
    }

    const localArea: string =
      address.neighbourhood || address.suburb || address.city_district || address.city || "Location found";
    const pincode = address.postcode ? `, ${address.postcode}` : "";
    const rawCity: string = address.city || address.town || address.village || address.state_district || "";
    const rawState: string = address.state || "";
    const city = normalizeCityName(address.city || address.state_district || address.county);

    return {
      success: true,
      data: {
        displayName: data.display_name || `${localArea}${pincode}`,
        localArea,
        pincode,
        city,
        rawCity,
        rawState,
      },
    };
  } catch (error) {
    console.error("Reverse geocode action failed:", error);
    return { success: false, error: "Reverse geocoding failed" };
  }
}

export interface TimelinePointLabel {
  /** Rounded-coordinate key this label was resolved for — see the batch fn. */
  key: string;
  localArea: string;
  pincode: string | null;
}

/** ~110m grid — points this close together share one Nominatim lookup. */
function roundKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

/**
 * Bulk reverse-geocode for the technician location timeline. Never called
 * for a whole day's history eagerly — only for the page of points actually
 * rendered in the "one by one" list — and even then, points within ~110m of
 * each other in the same batch share one lookup rather than one each, to
 * stay well inside Nominatim's free-tier rate limit. Best-effort: a point
 * that fails to resolve is simply omitted, never blocks the rest.
 */
export async function reverseGeocodeBatchAction(
  points: { lat: number; lng: number }[]
): Promise<ActionResponse<TimelinePointLabel[]>> {
  const unique = new Map<string, { lat: number; lng: number }>();
  for (const p of points) {
    if (Number.isNaN(p.lat) || Number.isNaN(p.lng)) continue;
    const key = roundKey(p.lat, p.lng);
    if (!unique.has(key)) unique.set(key, p);
  }

  const results: TimelinePointLabel[] = [];
  // Sequential, not parallel — Nominatim's usage policy caps free-tier use
  // at ~1 request/second; a batch page is small (tens of points, deduped
  // further by rounding), so this stays fast enough for a UI paginated by
  // the caller in the first place.
  for (const [key, p] of unique) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${p.lat}&lon=${p.lng}&addressdetails=1`,
        { headers: { "User-Agent": "Handyzo/1.0 (hello@Handyzo.in)" } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const address = data?.address;
      if (!address) continue;
      results.push({
        key,
        localArea: address.neighbourhood || address.suburb || address.city_district || address.city || "Unknown area",
        pincode: address.postcode ?? null,
      });
    } catch {
      // best-effort — skip this point, keep going
    }
  }

  return { success: true, data: results };
}
