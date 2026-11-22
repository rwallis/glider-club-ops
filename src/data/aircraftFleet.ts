export type AircraftStatus = 'Up' | 'Down'
export type AircraftCategory = 'glider' | 'tow'
export type AnnualUrgency = 'green' | 'amber' | 'red' | 'unknown'
/** Demo-ride airworthiness — not used for tow planes. */
export type DemoRidesStatus = 'up' | 'caution' | 'down' | 'na'

export interface AircraftRecord {
  id: string
  type: string
  color: string | null
  tail: string
  /** Tow planes skip demo-ride status. */
  category: AircraftCategory
  status: AircraftStatus
  lastAnnual: string | null
  /** Annual due as MM/YY */
  dueMmYy: string | null
  /** Hours since last annual — blank until club fills in */
  hoursSinceAnnual: number | null
  /** ISO date (YYYY-MM-DD) when hours were last entered */
  hoursLastEntered: string | null
  reasonGrounded: string | null
  lastUpdated: string | null
}

function tow(
  partial: Omit<AircraftRecord, 'category' | 'hoursLastEntered'> & {
    hoursLastEntered?: string | null
  }
): AircraftRecord {
  return {
    ...partial,
    category: 'tow',
    hoursLastEntered: partial.hoursLastEntered ?? null,
  }
}

function glider(
  partial: Omit<AircraftRecord, 'category' | 'hoursLastEntered'> & {
    hoursLastEntered?: string | null
  }
): AircraftRecord {
  return {
    ...partial,
    category: 'glider',
    hoursLastEntered: partial.hoursLastEntered ?? null,
  }
}

/**
 * Seed: status from annual due as of 2026-11-22.
 * Glider hours from All Flights Report 11/22/2025–11/22/2026
 * (summed on/after approx last annual = due month prior year).
 */
export const SEED_AIRCRAFT_FLEET: AircraftRecord[] = [
  tow({
    id: 'n42va',
    type: 'Pawnee',
    color: null,
    tail: 'N42VA',
    status: 'Down',
    lastAnnual: null,
    dueMmYy: '05/26',
    hoursSinceAnnual: null,
    reasonGrounded: 'Down since May 2026',
    lastUpdated: '2026-11-22',
  }),
  tow({
    id: 'n48887',
    type: 'Cessna',
    color: null,
    tail: 'N48887',
    status: 'Down',
    lastAnnual: null,
    dueMmYy: '10/26',
    hoursSinceAnnual: null,
    reasonGrounded: 'Annual overdue',
    lastUpdated: '2026-11-22',
  }),
  glider({
    id: 'n1185s',
    type: '2-33',
    color: 'Yellow',
    tail: 'N1185S',
    status: 'Down',
    lastAnnual: null,
    dueMmYy: '10/26',
    hoursSinceAnnual: 65.7,
    hoursLastEntered: '2026-11-22',
    reasonGrounded: 'Annual overdue',
    lastUpdated: '2026-11-22',
  }),
  glider({
    id: 'n7757s',
    type: '2-33',
    color: 'White/Green',
    tail: 'N7757S',
    status: 'Up',
    lastAnnual: null,
    dueMmYy: '05/27',
    hoursSinceAnnual: 2.5,
    hoursLastEntered: '2026-11-22',
    reasonGrounded: null,
    lastUpdated: '2026-11-22',
  }),
  glider({
    id: 'n2479w',
    type: '2-33',
    color: 'White',
    tail: 'N2479W',
    status: 'Up',
    lastAnnual: null,
    dueMmYy: '12/26',
    hoursSinceAnnual: 43.9,
    hoursLastEntered: '2026-11-22',
    reasonGrounded: null,
    lastUpdated: '2026-11-22',
  }),
  glider({
    id: 'n11139s',
    type: '1-26',
    color: 'White',
    tail: 'N11139S',
    status: 'Up',
    lastAnnual: null,
    dueMmYy: '05/27',
    hoursSinceAnnual: 21.6,
    hoursLastEntered: '2026-11-22',
    reasonGrounded: null,
    lastUpdated: '2026-11-22',
  }),
  glider({
    id: 'n27037',
    type: '1-26',
    color: 'White/Yellow',
    tail: 'N27037',
    status: 'Down',
    lastAnnual: null,
    dueMmYy: null,
    hoursSinceAnnual: null,
    reasonGrounded: 'Annual due unknown',
    lastUpdated: '2026-11-22',
  }),
  glider({
    id: 'n136yp',
    type: '1-36',
    color: null,
    tail: 'N136YP',
    status: 'Up',
    lastAnnual: null,
    dueMmYy: '05/27',
    hoursSinceAnnual: 30.2,
    hoursLastEntered: '2026-11-22',
    reasonGrounded: null,
    lastUpdated: '2026-11-22',
  }),
  glider({
    id: 'n160ss',
    type: 'Grob',
    color: null,
    tail: 'N160SS',
    status: 'Up',
    lastAnnual: null,
    dueMmYy: '01/27',
    hoursSinceAnnual: 18.9,
    hoursLastEntered: '2026-11-22',
    reasonGrounded: null,
    lastUpdated: '2026-11-22',
  }),
]

export const AIRCRAFT_FLEET_STORAGE_KEY = 'flf-aircraft-fleet-v3'

export function inferAircraftCategory(type: string): AircraftCategory {
  const t = type.trim().toLowerCase()
  if (t.includes('pawnee') || t.includes('cessna') || t.includes('tow')) return 'tow'
  return 'glider'
}

/** Merge stored rows with seed defaults (category / hoursLastEntered). */
export function normalizeAircraftRecord(
  raw: Partial<AircraftRecord> & { id: string }
): AircraftRecord {
  const seed = SEED_AIRCRAFT_FLEET.find((a) => a.id === raw.id)
  const type = raw.type ?? seed?.type ?? 'Unknown'
  return {
    id: raw.id,
    type,
    color: raw.color ?? seed?.color ?? null,
    tail: raw.tail ?? seed?.tail ?? raw.id.toUpperCase(),
    category: raw.category ?? seed?.category ?? inferAircraftCategory(type),
    status: raw.status === 'Up' || raw.status === 'Down' ? raw.status : (seed?.status ?? 'Down'),
    lastAnnual: raw.lastAnnual ?? seed?.lastAnnual ?? null,
    dueMmYy: raw.dueMmYy ?? seed?.dueMmYy ?? null,
    hoursSinceAnnual:
      raw.hoursSinceAnnual != null && Number.isFinite(raw.hoursSinceAnnual)
        ? raw.hoursSinceAnnual
        : (seed?.hoursSinceAnnual ?? null),
    hoursLastEntered: raw.hoursLastEntered ?? seed?.hoursLastEntered ?? null,
    reasonGrounded: raw.reasonGrounded ?? seed?.reasonGrounded ?? null,
    lastUpdated: raw.lastUpdated ?? seed?.lastUpdated ?? null,
  }
}
