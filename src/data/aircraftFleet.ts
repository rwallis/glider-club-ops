export type AircraftStatus = 'Up' | 'Down'
export type AnnualUrgency = 'green' | 'amber' | 'red' | 'unknown'

export interface AircraftRecord {
  id: string
  type: string
  color: string | null
  tail: string
  status: AircraftStatus
  lastAnnual: string | null
  /** Annual due as MM/YY */
  dueMmYy: string | null
  /** Hours since last annual — blank until club fills in */
  hoursSinceAnnual: number | null
  reasonGrounded: string | null
  lastUpdated: string | null
}

/** Seed: status from annual due as of 2026-11-22; hours left blank. */
export const SEED_AIRCRAFT_FLEET: AircraftRecord[] = [
  {
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
  },
  {
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
  },
  {
    id: 'n1185s',
    type: '2-33',
    color: 'Yellow',
    tail: 'N1185S',
    status: 'Down',
    lastAnnual: null,
    dueMmYy: '10/26',
    hoursSinceAnnual: null,
    reasonGrounded: 'Annual overdue',
    lastUpdated: '2026-11-22',
  },
  {
    id: 'n7757s',
    type: '2-33',
    color: 'White/Green',
    tail: 'N7757S',
    status: 'Up',
    lastAnnual: null,
    dueMmYy: '05/27',
    hoursSinceAnnual: null,
    reasonGrounded: null,
    lastUpdated: '2026-11-22',
  },
  {
    id: 'n2479w',
    type: '2-33',
    color: 'White',
    tail: 'N2479W',
    status: 'Up',
    lastAnnual: null,
    dueMmYy: '12/26',
    hoursSinceAnnual: null,
    reasonGrounded: null,
    lastUpdated: '2026-11-22',
  },
  {
    id: 'n11139s',
    type: '1-26',
    color: 'White',
    tail: 'N11139S',
    status: 'Up',
    lastAnnual: null,
    dueMmYy: '05/27',
    hoursSinceAnnual: null,
    reasonGrounded: null,
    lastUpdated: '2026-11-22',
  },
  {
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
  },
  {
    id: 'n136yp',
    type: '1-36',
    color: null,
    tail: 'N136YP',
    status: 'Up',
    lastAnnual: null,
    dueMmYy: '05/27',
    hoursSinceAnnual: null,
    reasonGrounded: null,
    lastUpdated: '2026-11-22',
  },
  {
    id: 'n160ss',
    type: 'Grob',
    color: null,
    tail: 'N160SS',
    status: 'Up',
    lastAnnual: null,
    dueMmYy: '01/27',
    hoursSinceAnnual: null,
    reasonGrounded: null,
    lastUpdated: '2026-11-22',
  },
]

export const AIRCRAFT_FLEET_STORAGE_KEY = 'flf-aircraft-fleet-v1'
