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
