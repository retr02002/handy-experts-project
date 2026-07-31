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
