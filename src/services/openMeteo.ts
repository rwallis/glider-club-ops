import type { CategoryCard, StatusLevel } from '../types'
import { fieldLocation } from '../config/field'

interface OpenMeteoCurrent {
  time: string
  temperature_2m: number
  apparent_temperature: number
  surface_pressure: number
  weather_code: number
  cloud_cover: number
  visibility: number
  wind_speed_10m: number
  wind_direction_10m: number
  wind_gusts_10m: number
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrent
}

export interface FieldWeather {
  fetchedAt: string
  summary: string
  status: StatusLevel
  statusLabel: string
  items: CategoryCard['items']
  notes?: string
}

const WMO_LABELS: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Heavy rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with hail',
}

const NO_FLY_CODES = [95, 96, 99, 65, 75, 82]
const MARGINAL_WEATHER_CODES = [45, 48, 55, 63, 61, 80, 81]

function windLabel(degrees: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(degrees / 22.5) % 16]
}

function metersToSm(meters: number): number {
  return meters / 1609.344
}

function densityAltitudeFt(elevationFt: number, tempF: number, pressureHpa: number): number {
  const tempC = ((tempF - 32) * 5) / 9
  const pressureAltitude = elevationFt + (1013.25 - pressureHpa) * 30
  const isaTempC = 15 - (pressureAltitude / 1000) * 1.98
  return Math.round(pressureAltitude + 120 * (tempC - isaTempC))
}

function windItemStatus(current: OpenMeteoCurrent): StatusLevel {
  if (current.wind_gusts_10m >= 25 || current.wind_speed_10m >= 20) return 'caution'
  if (current.wind_gusts_10m >= 20 || current.wind_speed_10m >= 15) return 'caution'
  return 'operational'
}

function visibilityItemStatus(current: OpenMeteoCurrent): StatusLevel {
  const visSm = metersToSm(current.visibility)
  if (visSm < 3) return 'caution'
  if (visSm < 5) return 'caution'
  return 'operational'
}

function cloudItemStatus(current: OpenMeteoCurrent): StatusLevel {
  if (NO_FLY_CODES.includes(current.weather_code)) return 'caution'
  if (MARGINAL_WEATHER_CODES.includes(current.weather_code)) return 'caution'
  if (current.cloud_cover >= 90) return 'caution'
  if (current.cloud_cover >= 70) return 'caution'
  return 'operational'
}

function tempItemStatus(current: OpenMeteoCurrent): StatusLevel {
  const da = densityAltitudeFt(fieldLocation.elevationFt, current.temperature_2m, current.surface_pressure)
  if (da >= 6000) return 'caution'
  return 'operational'
}

/** Flyability for the card pill — never use equipment-style "Unavailable" when data loaded. */
function flyability(current: OpenMeteoCurrent): { status: StatusLevel; label: string } {
  if (NO_FLY_CODES.includes(current.weather_code)) {
    return { status: 'caution', label: 'No fly' }
  }

  const visSm = metersToSm(current.visibility)
  const checks = [
    windItemStatus(current),
    visibilityItemStatus(current),
    cloudItemStatus(current),
    tempItemStatus(current),
  ]

  if (visSm < 3 || current.wind_gusts_10m >= 25) {
    return { status: 'caution', label: 'No fly' }
  }

  if (checks.includes('caution') || MARGINAL_WEATHER_CODES.includes(current.weather_code)) {
    return { status: 'caution', label: 'Marginal' }
  }

  return { status: 'operational', label: 'Flyable' }
}

export async function fetchFieldWeather(): Promise<FieldWeather> {
  const params = new URLSearchParams({
    latitude: String(fieldLocation.latitude),
    longitude: String(fieldLocation.longitude),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'surface_pressure',
      'weather_code',
      'cloud_cover',
      'visibility',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    wind_speed_unit: 'kn',
    temperature_unit: 'fahrenheit',
    timezone: fieldLocation.timezone,
  })

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!response.ok) throw new Error(`Open-Meteo request failed (${response.status})`)

  const data = (await response.json()) as OpenMeteoResponse
  const current = data.current
  const visSm = metersToSm(current.visibility)
  const da = densityAltitudeFt(fieldLocation.elevationFt, current.temperature_2m, current.surface_pressure)
  const conditions = WMO_LABELS[current.weather_code] ?? 'Unknown'
  const windDir = windLabel(current.wind_direction_10m)
  const { status, label } = flyability(current)

  return {
    fetchedAt: current.time,
    summary: `${conditions} · ${windDir} ${Math.round(current.wind_speed_10m)} kt · ${Math.round(current.temperature_2m)}°F`,
    status,
    statusLabel: label,
    items: [
      {
        id: 'wx-wind',
        name: 'Wind',
        status: windItemStatus(current),
        detail: `${current.wind_direction_10m}° (${windDir}) at ${current.wind_speed_10m.toFixed(0)} kt, gusts ${current.wind_gusts_10m.toFixed(0)}`,
      },
      {
        id: 'wx-vis',
        name: 'Visibility',
        status: visibilityItemStatus(current),
        detail: visSm >= 10 ? '10+ SM' : `${visSm.toFixed(1)} SM`,
      },
      {
        id: 'wx-cloud',
        name: 'Cloud cover',
        status: cloudItemStatus(current),
        detail: `${current.cloud_cover}% · ${conditions}`,
      },
      {
        id: 'wx-temp',
        name: 'Temp / density alt',
        status: tempItemStatus(current),
        detail: `${Math.round(current.temperature_2m)}°F · DA ~${da.toLocaleString()} ft`,
      },
    ],
    notes: 'Open-Meteo forecast at FLF Gliderport. Verify field conditions before flying — not a substitute for METAR or briefing.',
  }
}
