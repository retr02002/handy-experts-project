/**
 * Pincode -> coordinates. The only reusable geocoding helper in the
 * codebase — the existing forward-geocode logic in livecall.actions.ts is
 * private to that file and free-text-address-oriented, not pincode-scoped.
 */
export async function forwardGeocodePincode(pincode: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&postalcode=${encodeURIComponent(pincode)}&country=India&limit=1`,
      { headers: { "User-Agent": "Handyzo/1.0 (hello@Handyzo.in)" } }
    );
    if (!res.ok) return null;
    const results = await res.json();
    const top = results?.[0];
    if (!top) return null;
    const latitude = parseFloat(top.lat);
    const longitude = parseFloat(top.lon);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
    return { latitude, longitude };
  } catch (error) {
    console.error("Forward geocode pincode failed:", error);
    return null;
  }
}
