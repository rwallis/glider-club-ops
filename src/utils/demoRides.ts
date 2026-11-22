import type { AircraftRecord, DemoRidesStatus } from '../data/aircraftFleet'

/** Hard stop for demo rides (hours since last annual). */
export const DEMO_RIDES_DOWN_HOURS = 95
/** Caution band — close to the 100-hour limit. */
export const DEMO_RIDES_YELLOW_HOURS = 85
/** Assumed demo hours flown each weekend when hours log is stale. */
export const DEMO_RIDES_HOURS_PER_WEEKEND = 5

/** Demo rides only on 2-seat demo-capable types (2-33s and Grob). */
export function isDemoCapableType(type: string): boolean {
  const t = type.trim().toLowerCase()
  return t.includes('2-33') || t.includes('grob')
}

export type FleetBoardSection = 'tow' | 'two-seat' | 'single-seat'

/** Board sections: tow planes, 2-seat demo gliders, single-seat. */
export function fleetBoardSection(
  aircraft: Pick<AircraftRecord, 'category' | 'type'>
): FleetBoardSection {
  if (aircraft.category === 'tow') return 'tow'
  if (isDemoCapableType(aircraft.type)) return 'two-seat'
  return 'single-seat'
}

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

/** Count Saturdays strictly after `from` through `to` (inclusive of to if Saturday). */
export function weekendsSince(from: Date, to: Date): number {
  const start = startOfLocalDay(from)
  const end = startOfLocalDay(to)
  if (end <= start) return 0

  let count = 0
  const cursor = new Date(start)
  cursor.setDate(cursor.getDate() + 1)
  while (cursor <= end) {
    if (cursor.getDay() === 6) count += 1 // Saturday = one weekend
    cursor.setDate(cursor.getDate() + 1)
  }
  return count
}

export interface DemoRidesAssessment {
  applicable: boolean
  status: DemoRidesStatus
  label: string
  detail: string
  recordedHours: number | null
  estimatedExtraHours: number
  effectiveHours: number | null
  hoursStale: boolean
}

export function assessDemoRides(
  aircraft: Pick<
    AircraftRecord,
    'category' | 'type' | 'status' | 'hoursSinceAnnual' | 'hoursLastEntered' | 'lastUpdated'
  >,
  now = new Date()
): DemoRidesAssessment {
  if (aircraft.category === 'tow') {
    return {
      applicable: false,
      status: 'na',
      label: 'N/A',
      detail: 'Demo rides not applicable to tow planes',
      recordedHours: aircraft.hoursSinceAnnual,
      estimatedExtraHours: 0,
      effectiveHours: null,
      hoursStale: false,
    }
  }

  if (!isDemoCapableType(aircraft.type)) {
    return {
      applicable: false,
      status: 'na',
      label: 'N/A',
      detail: 'Demo rides not applicable to single-seat gliders',
      recordedHours: aircraft.hoursSinceAnnual,
      estimatedExtraHours: 0,
      effectiveHours: null,
      hoursStale: false,
    }
  }

  if (aircraft.status === 'Down') {
    return {
      applicable: true,
      status: 'down',
      label: 'Down',
      detail: 'Down for ops — also down for demo rides',
      recordedHours: aircraft.hoursSinceAnnual,
      estimatedExtraHours: 0,
      effectiveHours: aircraft.hoursSinceAnnual,
      hoursStale: false,
    }
  }

  const recorded = aircraft.hoursSinceAnnual
  if (recorded == null || !Number.isFinite(recorded)) {
    return {
      applicable: true,
      status: 'down',
      label: 'Down',
      detail: 'Hours not entered — down for demo rides',
      recordedHours: null,
      estimatedExtraHours: 0,
      effectiveHours: null,
      hoursStale: false,
    }
  }

  const enteredAt =
    parseIsoDate(aircraft.hoursLastEntered) ?? parseIsoDate(aircraft.lastUpdated)
  const today = startOfLocalDay(now)
  const hoursStale = !enteredAt || startOfLocalDay(enteredAt) < today
  const estimatedExtraHours =
    hoursStale && enteredAt
      ? weekendsSince(enteredAt, today) * DEMO_RIDES_HOURS_PER_WEEKEND
      : 0
  const effectiveHours = recorded + estimatedExtraHours

  if (effectiveHours >= DEMO_RIDES_DOWN_HOURS) {
    return {
      applicable: true,
      status: 'down',
      label: 'Down',
      detail:
        estimatedExtraHours > 0
          ? `${effectiveHours.toFixed(1)}h est. (≥${DEMO_RIDES_DOWN_HOURS}h) — includes ${estimatedExtraHours}h weekend estimate`
          : `${effectiveHours.toFixed(1)}h since annual (≥${DEMO_RIDES_DOWN_HOURS}h)`,
      recordedHours: recorded,
      estimatedExtraHours,
      effectiveHours,
      hoursStale,
    }
  }

  if (effectiveHours >= DEMO_RIDES_YELLOW_HOURS) {
    return {
      applicable: true,
      status: 'caution',
      label: 'Caution',
      detail:
        estimatedExtraHours > 0
          ? `${effectiveHours.toFixed(1)}h est. — nearing 100h ( +${estimatedExtraHours}h weekends )`
          : `${effectiveHours.toFixed(1)}h — nearing 100h limit`,
      recordedHours: recorded,
      estimatedExtraHours,
      effectiveHours,
      hoursStale,
    }
  }

  return {
    applicable: true,
    status: 'up',
    label: 'Up',
    detail:
      estimatedExtraHours > 0
        ? `${effectiveHours.toFixed(1)}h est. (recorded ${recorded} + ${estimatedExtraHours} weekend)`
        : `${effectiveHours.toFixed(1)}h since annual`,
    recordedHours: recorded,
    estimatedExtraHours,
    effectiveHours,
    hoursStale,
  }
}
