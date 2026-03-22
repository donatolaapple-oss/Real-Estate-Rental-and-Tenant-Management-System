/** SEAIT reference point (Tupi area — aligns with StayScout map & sample listings) */
export const SEAIT = { lat: 6.331, lng: 124.951 };

const R = 6371;

function toRad(d) {
  return (d * Math.PI) / 180;
}

/** Haversine distance in km */
export function distanceKm(lat1, lng1, lat2, lng2) {
  if (
    [lat1, lng1, lat2, lng2].some((x) => x == null || Number.isNaN(Number(x)))
  ) {
    return null;
  }
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1000) / 1000;
}

/** Walking time at ~5 km/h */
export function walkMinutes(distanceKm) {
  if (distanceKm == null || distanceKm < 0) return null;
  return Math.round((distanceKm / 5) * 60);
}
