import { SERVICEABLE_CITIES, normalizeCityName, type ServiceableCity } from "@/lib/cities";

const CITY_CODES: Record<ServiceableCity, string> = {
  "New Delhi": "ND",
  Mumbai: "MU",
  Bangalore: "BL",
  Pune: "PU",
  Hyderabad: "HY",
};

/**
 * Deterministic 2-letter code for one of the SERVICEABLE_CITIES. Falls back
 * to the first 2 letters of the raw string (uppercased) for anything that
 * doesn't normalize — degrades gracefully rather than throwing, since city
 * is free text at the LiveCall layer (admin-entered addresses, etc).
 */
export function getCityCode(rawCity: string): string {
  const normalized = normalizeCityName(rawCity);
  if (normalized) return CITY_CODES[normalized];
  const letters = rawCity.replace(/[^a-zA-Z]/g, "").toUpperCase();
  return (letters.slice(0, 2) || "XX").padEnd(2, "X");
}

/**
 * 2-letter code for a locality/area string, or the city code as a graceful
 * fallback when locality is null/empty — the format degrades to
 * COMPANY+CITY+CITY+NUMBER rather than omitting a segment.
 */
export function getAreaCode(locality: string | null | undefined, cityCode: string): string {
  if (!locality) return cityCode;
  const letters = locality.replace(/[^a-zA-Z]/g, "").toUpperCase();
  return letters.length >= 2 ? letters.slice(0, 2) : cityCode;
}

export { SERVICEABLE_CITIES, type ServiceableCity };
