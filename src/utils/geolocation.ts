import { FIELD_CHECK_IN_RADIUS_MILES, fieldLocation } from '../config/field'

export type LocationStatus = 'on-field' | 'remote' | 'unknown'

export interface LocationCheck {
  locationStatus: LocationStatus
  distanceMiles: number | null
}

const EARTH_RADIUS_MILES = 3958.8

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

export function milesBetween(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function distanceFromField(latitude: number, longitude: number): number {
  return milesBetween(
    fieldLocation.latitude,
    fieldLocation.longitude,
    latitude,
    longitude,
  )
}

export function locationCheckFromCoords(latitude: number, longitude: number): LocationCheck {
  const distanceMiles = distanceFromField(latitude, longitude)
  return {
    distanceMiles,
    locationStatus: distanceMiles <= FIELD_CHECK_IN_RADIUS_MILES ? 'on-field' : 'remote',
  }
}

export function getCurrentLocationCheck(): Promise<LocationCheck> {
  if (!navigator.geolocation) {
    return Promise.resolve({ locationStatus: 'unknown', distanceMiles: null })
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(locationCheckFromCoords(position.coords.latitude, position.coords.longitude))
      },
      () => resolve({ locationStatus: 'unknown', distanceMiles: null }),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    )
  })
}

export function locationLabel(check: Pick<LocationCheck, 'locationStatus' | 'distanceMiles'>): string {
  switch (check.locationStatus) {
    case 'on-field':
      return check.distanceMiles != null
        ? `On field (${check.distanceMiles.toFixed(1)} mi)`
        : 'On field'
    case 'remote':
      return check.distanceMiles != null
        ? `Remote (${check.distanceMiles.toFixed(1)} mi away)`
        : 'Remote'
    case 'unknown':
      return 'Location unknown'
  }
}
