/**
 * deliveryZone.ts
 * Delivery zone validation using the Haversine formula.
 * TODO: real backend required — replace hardcoded restaurant coords and
 *       zone radius tiers with values fetched from an API or config service.
 */

// Flavora Kitchen restaurant coordinates (Mumbai)
export const RESTAURANT_COORDS = { lat: 19.4180, lng: 72.8200 };

export type ZoneStatus = "in_zone" | "mid_zone" | "far_zone" | "out_of_zone";

export interface DeliveryZoneResult {
  distanceKm: number;
  status: ZoneStatus;
  fee: number;
  label: string;
  eta: string;
}

/**
 * Haversine formula — returns great-circle distance in kilometres
 * between two lat/lng points.
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

/**
 * Tiered delivery fee structure:
 * 0–3 km   → ₹0   (free near zone)
 * 3–7 km   → ₹40  (standard)
 * 7–12 km  → ₹80  (extended)
 * 12–20 km → ₹140 (far zone)
 * >20 km   → not serviceable
 */
export function getDeliveryZone(coords: { lat: number; lng: number } | undefined): DeliveryZoneResult {
  if (!coords) {
    return {
      distanceKm: 0,
      status: "in_zone",
      fee: 40,
      label: "In Zone",
      eta: "25–35 min"
    };
  }

  const dist = haversineKm(
    RESTAURANT_COORDS.lat,
    RESTAURANT_COORDS.lng,
    coords.lat,
    coords.lng
  );

  if (dist <= 3) {
    return { distanceKm: dist, status: "in_zone", fee: 0, label: "In Zone", eta: "15–20 min" };
  } else if (dist <= 7) {
    return { distanceKm: dist, status: "mid_zone", fee: 40, label: "Near Zone", eta: "25–35 min" };
  } else if (dist <= 12) {
    return { distanceKm: dist, status: "far_zone", fee: 80, label: "Extended Zone", eta: "40–55 min" };
  } else if (dist <= 20) {
    return { distanceKm: dist, status: "far_zone", fee: 140, label: "Far Zone", eta: "60–75 min" };
  } else {
    return { distanceKm: dist, status: "out_of_zone", fee: 0, label: "Out of Zone", eta: "Not available" };
  }
}
