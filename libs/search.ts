/**
 * Search utilities for FoodLister
 * Includes Haversine distance formula for geolocation-based search
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculate the distance between two points on Earth using the Haversine formula.
 * @param lat1 - Latitude of point 1 in degrees
 * @param lng1 - Longitude of point 1 in degrees
 * @param lat2 - Latitude of point 2 in degrees
 * @param lng2 - Longitude of point 2 in degrees
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Validate that coordinates are within valid ranges.
 */
export function isValidCoordinates(
  latitude: number,
  longitude: number
): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Supported sort options for restaurant search.
 */
export type RestaurantSortBy = 'rating' | 'distance' | 'price' | 'name' | 'popularity';

export type SortDirection = 'asc' | 'desc';

export interface NearbySearchParams {
  lat: number;
  lng: number;
  radius?: number; // in km, default 10
  sortBy?: RestaurantSortBy;
  sortDirection?: SortDirection;
}
