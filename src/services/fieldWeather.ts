import type { CategoryCard, StatusLevel } from '../types'
import { fieldLocation } from '../config/field'

export interface FieldWeather {
  fetchedAt: string
  summary: string
  status: StatusLevel
  statusLabel: string
  items: CategoryCard['items']
  notes?: string
}

/** Reporting airports near FLF Gliderport (TX23) */
const NEARBY_METAR_STATIONS = [
  { id: 'KGRK', name: 'Killeen / Robert Gray', lat: 31.0779, lon: -97.8323 },
  { id: 'KGTU', name: 'Georgetown', lat: 30.6809, lon: -97.6767 },
  { id: 'KBMQ', name: 'Burnet', lat: 30.7407, lon: -98.2354 },
  { id: 'KILE', name: 'Killeen / Skylark', lat: 31.0858, lon: -97.6865 },
  { id: 'KLZZ', name: 'Lampasas', lat: 31.1061, lon: -98.1955 },
] as const

interface MetarCloud {
  cover: string
  base: number
}

interface MetarObservation {
  icaoId: string
  reportTime: string
  temp: number
  wdir: number | null
  wspd: number | null
  wgst: number | null
  visib: string | number
  altim: number
  cover?: string
  clouds: MetarCloud[]
  fltCat?: string
  rawOb: string
  lat: number
  lon: number
  name: string
}

function distanceNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return (2 * Math.asin(Math.sqrt(a)) * 180) / Math.PI * 60
}

function windLabel(degrees: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(degrees / 22.5) % 16]
}

function celsiusToF(c: number): number {
  return (c * 9) / 5 + 32
}

function parseVisibilitySm(visib: string | number): number {
  if (typeof visib === 'number') return visib
  if (visib.includes('+')) return 10
  const n = Number.parseFloat(visib)
  return Number.isFinite(n) ? n : 10
}

function lowestCeilingFt(clouds: MetarCloud[]): number | null {
  const bases = clouds.map((c) => c.base).filter((b) => b > 0)
  return bases.length ? Math.min(...bases) : null
}

function hasThunder(raw: string): boolean {
  return /\b(TS|TSRA|VCTS|CB)\b/.test(raw)
}

function densityAltitudeFt(elevationFt: number, tempF: number, altimInHg: number): number {
  const pressureHpa = altimInHg * 33.8639
  const tempC = ((tempF - 32) * 5) / 9
  const pressureAltitude = elevationFt + (1013.25 - pressureHpa) * 30
  const isaTempC = 15 - (pressureAltitude / 1000) * 1.98
  return Math.round(pressureAltitude + 120 * (tempC - isaTempC))
}

function flyability(obs: MetarObservation): { status: StatusLevel; label: string } {
  const raw = obs.rawOb
  const visSm = parseVisibilitySm(obs.visib)
  const ceiling = lowestCeilingFt(obs.clouds)
  const gusts = obs.wgst ?? 0
  const wind = obs.wspd ?? 0

  if (hasThunder(raw) || obs.fltCat === 'IFR' || obs.fltCat === 'LIFR') {
    return { status: 'caution', label: 'No fly' }
  }
  if (visSm < 3 || (ceiling !== null && ceiling < 1000) || gusts >= 25 || wind >= 20) {
    return { status: 'caution', label: 'No fly' }
  }
  if (
    obs.fltCat === 'MVFR' ||
    visSm < 5 ||
    (ceiling !== null && ceiling < 3000) ||
    gusts >= 20 ||
    wind >= 15
  ) {
    return { status: 'caution', label: 'Marginal' }
  }
  return { status: 'operational', label: 'Flyable' }
}

function windStatus(obs: MetarObservation): StatusLevel {
  const gusts = obs.wgst ?? 0
  const wind = obs.wspd ?? 0
  if (gusts >= 20 || wind >= 15) return 'caution'
  return 'operational'
}

function visibilityStatus(obs: MetarObservation): StatusLevel {
  const visSm = parseVisibilitySm(obs.visib)
  if (visSm < 3) return 'caution'
  if (visSm < 5) return 'caution'
  return 'operational'
}

function cloudStatus(obs: MetarObservation): StatusLevel {
  if (hasThunder(obs.rawOb)) return 'caution'
  const ceiling = lowestCeilingFt(obs.clouds)
  if (ceiling !== null && ceiling < 3000) return 'caution'
  if (obs.cover === 'OVC' || obs.cover === 'BKN') return 'caution'
  return 'operational'
}

function tempStatus(obs: MetarObservation): StatusLevel {
  const tempF = celsiusToF(obs.temp)
  const da = densityAltitudeFt(fieldLocation.elevationFt, tempF, obs.altim)
  if (da >= 6000) return 'caution'
  return 'operational'
}

function formatWind(obs: MetarObservation): string {
  if (obs.wspd === null || obs.wdir === null || obs.wspd === 0) return 'Calm'
  const dir = windLabel(obs.wdir)
  const gust = obs.wgst ? `, gusts ${obs.wgst}` : ''
  return `${obs.wdir}° (${dir}) at ${obs.wspd} kt${gust}`
}

function formatClouds(obs: MetarObservation): string {
  if (!obs.clouds.length) return obs.cover ?? 'Clear'
  const ceiling = lowestCeilingFt(obs.clouds)
  const layers = obs.clouds.map((c) => `${c.cover} ${c.base.toLocaleString()} ft`).join(' · ')
  return ceiling ? `${layers}` : layers
}

export async function fetchFieldWeather(): Promise<FieldWeather> {
  const ids = NEARBY_METAR_STATIONS.map((s) => s.id).join(',')
  const response = await fetch(`/api/weather?ids=${ids}`)
  if (!response.ok) throw new Error(`METAR request failed (${response.status})`)

  const observations = (await response.json()) as MetarObservation[]
  if (!observations.length) throw new Error('No METAR data for nearby stations')

  const ranked = observations
    .map((obs) => ({
      obs,
      distanceNm: distanceNm(fieldLocation.latitude, fieldLocation.longitude, obs.lat, obs.lon),
    }))
    .sort((a, b) => a.distanceNm - b.distanceNm)

  const { obs, distanceNm: dist } = ranked[0]
  const tempF = Math.round(celsiusToF(obs.temp))
  const visSm = parseVisibilitySm(obs.visib)
  const { status, label } = flyability(obs)
  const da = densityAltitudeFt(fieldLocation.elevationFt, tempF, obs.altim)

  return {
    fetchedAt: obs.reportTime,
    summary: `${obs.fltCat ?? '—'} · METAR ${obs.icaoId} (${dist.toFixed(0)} NM) · ${formatWind(obs)}`,
    status,
    statusLabel: label,
    items: [
      {
        id: 'wx-wind',
        name: 'Wind',
        status: windStatus(obs),
        detail: formatWind(obs),
      },
      {
        id: 'wx-vis',
        name: 'Visibility',
        status: visibilityStatus(obs),
        detail: visSm >= 10 ? '10+ SM' : `${visSm} SM`,
      },
      {
        id: 'wx-cloud',
        name: 'Ceiling / clouds',
        status: cloudStatus(obs),
        detail: formatClouds(obs),
      },
      {
        id: 'wx-temp',
        name: 'Temp / density alt',
        status: tempStatus(obs),
        detail: `${tempF}°F · DA ~${da.toLocaleString()} ft`,
      },
    ],
    notes: `Observed weather from ${obs.icaoId} (${dist.toFixed(0)} NM from FLF Gliderport, TX23 at ${fieldLocation.latitude.toFixed(3)}°N ${Math.abs(fieldLocation.longitude).toFixed(3)}°W). Field conditions may differ — confirm at briefing.`,
  }
}
