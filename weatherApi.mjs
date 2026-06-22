const STATIONS = [
  { id: 'KGRK', name: 'Killeen / Robert Gray', lat: 31.0779, lon: -97.8323 },
  { id: 'KGTU', name: 'Georgetown', lat: 30.6809, lon: -97.6767 },
  { id: 'KBMQ', name: 'Burnet', lat: 30.7407, lon: -98.2354 },
  { id: 'KILE', name: 'Killeen / Skylark', lat: 31.0858, lon: -97.6865 },
  { id: 'KLZZ', name: 'Lampasas', lat: 31.1061, lon: -98.1955 },
]

const ALLOWED = new Set(STATIONS.map((s) => s.id))

function kmhToKt(kmh) {
  return kmh == null ? null : Math.round(kmh * 0.539957)
}

function metersToFeet(m) {
  return m == null ? 0 : Math.round(m * 3.28084)
}

function flightCategory(visSm, clouds) {
  const ceiling = clouds
    .filter((c) => c.cover === 'BKN' || c.cover === 'OVC')
    .map((c) => c.base)
    .sort((a, b) => a - b)[0]

  if (visSm < 1 || (ceiling != null && ceiling < 500)) return 'LIFR'
  if (visSm < 3 || (ceiling != null && ceiling < 1000)) return 'IFR'
  if (visSm < 5 || (ceiling != null && ceiling < 3000)) return 'MVFR'
  return 'VFR'
}

function nwsToMetar(feature, station) {
  const p = feature.properties
  const coords = feature.geometry?.coordinates ?? [station.lon, station.lat]

  const clouds = (p.cloudLayers ?? []).map((layer) => ({
    cover: layer.amount,
    base: metersToFeet(layer.base?.value),
  }))

  const visM = p.visibility?.value ?? 16090
  const visSm = visM / 1609.344

  return {
    icaoId: p.stationId,
    reportTime: p.timestamp,
    temp: p.temperature?.value ?? 20,
    wdir: p.windDirection?.value ?? null,
    wspd: kmhToKt(p.windSpeed?.value),
    wgst: kmhToKt(p.windGust?.value),
    visib: visSm >= 10 ? '10+' : Math.round(visSm * 10) / 10,
    altim: (p.seaLevelPressure?.value ?? 101325) / 100,
    cover: clouds.at(-1)?.cover ?? 'CLR',
    clouds,
    fltCat: flightCategory(visSm, clouds),
    rawOb: p.rawMessage ?? '',
    lat: coords[1],
    lon: coords[0],
    name: p.stationName ?? station.name,
  }
}

async function fetchStation(id) {
  const station = STATIONS.find((s) => s.id === id)
  if (!station) return null

  const response = await fetch(`https://api.weather.gov/stations/${id}/observations/latest`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'glider-club-ops (soar.flf@gmail.com)',
    },
    signal: AbortSignal.timeout(12000),
  })

  if (!response.ok) return null
  const data = await response.json()
  return nwsToMetar(data, station)
}

/** @param {string | undefined} requestUrl */
export async function fetchNearbyMetarObservations(requestUrl) {
  const url = new URL(requestUrl ?? '/api/weather', 'http://localhost')
  const requested = (url.searchParams.get('ids') ?? '')
    .split(',')
    .map((id) => id.trim().toUpperCase())
    .filter((id) => ALLOWED.has(id))

  const ids = requested.length ? requested : STATIONS.map((s) => s.id)
  const results = await Promise.all(ids.map((id) => fetchStation(id)))
  const observations = results.filter(Boolean)

  if (!observations.length) {
    throw new Error('No METAR data available from nearby stations')
  }

  return observations
}
