export const SERVICEABLE_CITIES = ["New Delhi", "Mumbai", "Bangalore", "Pune", "Hyderabad"] as const;

export type ServiceableCity = (typeof SERVICEABLE_CITIES)[number];

const CITY_ALIASES: Record<string, ServiceableCity> = {
  "new delhi": "New Delhi",
  "delhi": "New Delhi",
  "mumbai": "Mumbai",
  "bombay": "Mumbai",
  "bangalore": "Bangalore",
  "bengaluru": "Bangalore",
  "pune": "Pune",
  "poona": "Pune",
  "hyderabad": "Hyderabad",
};

export function normalizeCityName(rawCity: string | undefined | null): ServiceableCity | null {
  if (!rawCity) return null;
  return CITY_ALIASES[rawCity.trim().toLowerCase()] ?? null;
}
