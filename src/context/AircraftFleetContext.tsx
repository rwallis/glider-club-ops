import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  AIRCRAFT_FLEET_STORAGE_KEY,
  SEED_AIRCRAFT_FLEET,
  normalizeAircraftRecord,
  type AircraftRecord,
  type AircraftStatus,
} from '../data/aircraftFleet'

type AircraftPatch = Partial<
  Pick<
    AircraftRecord,
    | 'status'
    | 'lastAnnual'
    | 'dueMmYy'
    | 'hoursSinceAnnual'
    | 'hoursLastEntered'
    | 'reasonGrounded'
  >
>

interface AircraftFleetContextValue {
  fleet: AircraftRecord[]
  updateAircraft: (id: string, patch: AircraftPatch) => void
  applyHoursByTail: (hoursByTail: Record<string, number | null>) => void
  resetToSeed: () => void
}

const AircraftFleetContext = createContext<AircraftFleetContextValue | null>(null)

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function loadFleet(): AircraftRecord[] {
  try {
    const raw = localStorage.getItem(AIRCRAFT_FLEET_STORAGE_KEY)
    if (!raw) return SEED_AIRCRAFT_FLEET.map((a) => ({ ...a }))
    const parsed = JSON.parse(raw) as Partial<AircraftRecord>[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return SEED_AIRCRAFT_FLEET.map((a) => ({ ...a }))
    }
    return parsed
      .filter((row): row is Partial<AircraftRecord> & { id: string } => Boolean(row?.id))
      .map(normalizeAircraftRecord)
  } catch {
    return SEED_AIRCRAFT_FLEET.map((a) => ({ ...a }))
  }
}

export function AircraftFleetProvider({ children }: { children: ReactNode }) {
  const [fleet, setFleet] = useState<AircraftRecord[]>(loadFleet)

  useEffect(() => {
    localStorage.setItem(AIRCRAFT_FLEET_STORAGE_KEY, JSON.stringify(fleet))
  }, [fleet])

  const updateAircraft = useCallback((id: string, patch: AircraftPatch) => {
    setFleet((prev) =>
      prev.map((aircraft) => {
        if (aircraft.id !== id) return aircraft
        const today = todayIso()
        const next: AircraftRecord = {
          ...aircraft,
          ...patch,
          lastUpdated: today,
        }
        if (Object.prototype.hasOwnProperty.call(patch, 'hoursSinceAnnual')) {
          next.hoursLastEntered = patch.hoursSinceAnnual == null ? null : today
        }
        if (patch.status === 'Up') {
          next.reasonGrounded = null
        }
        return next
      })
    )
  }, [])

  const applyHoursByTail = useCallback((hoursByTail: Record<string, number | null>) => {
    const today = todayIso()
    setFleet((prev) =>
      prev.map((aircraft) => {
        if (!Object.prototype.hasOwnProperty.call(hoursByTail, aircraft.tail)) {
          return aircraft
        }
        const hours = hoursByTail[aircraft.tail]
        return {
          ...aircraft,
          hoursSinceAnnual: hours,
          hoursLastEntered: hours == null ? null : today,
          lastUpdated: today,
        }
      })
    )
  }, [])

  const resetToSeed = useCallback(() => {
    setFleet(SEED_AIRCRAFT_FLEET.map((a) => ({ ...a })))
  }, [])

  const value = useMemo(
    () => ({ fleet, updateAircraft, applyHoursByTail, resetToSeed }),
    [fleet, updateAircraft, applyHoursByTail, resetToSeed]
  )

  return (
    <AircraftFleetContext.Provider value={value}>{children}</AircraftFleetContext.Provider>
  )
}

export function useAircraftFleet() {
  const ctx = useContext(AircraftFleetContext)
  if (!ctx) throw new Error('useAircraftFleet must be used within AircraftFleetProvider')
  return ctx
}

export type { AircraftStatus }
