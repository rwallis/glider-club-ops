import type { AircraftRecord } from '../data/aircraftFleet'

export type FleetBoardSection = 'tow' | 'two-seat' | 'single-seat'

function isTwoSeatGliderType(type: string): boolean {
  const t = type.trim().toLowerCase()
  return t.includes('2-33') || t.includes('grob')
}

/** Board sections: tow planes, 2-seat gliders, single-seat. */
export function fleetBoardSection(
  aircraft: Pick<AircraftRecord, 'category' | 'type'>
): FleetBoardSection {
  if (aircraft.category === 'tow') return 'tow'
  if (isTwoSeatGliderType(aircraft.type)) return 'two-seat'
  return 'single-seat'
}
