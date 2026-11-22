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
  type AircraftRecord,
  type AircraftStatus,
} from '../data/aircraftFleet'

type AircraftPatch = Partial<
  Pick<
    AircraftRecord,
    'status' | 'lastAnnual' | 'dueMmYy' | 'hoursSinceAnnual' | 'reasonGrounded'
  >
>

interface AircraftFleetContextValue {
  fleet: AircraftRecord[]
  updateAircraft: (id: string, patch: AircraftPatch) => void
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
    const parsed = JSON.parse(raw) as AircraftRecord[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return SEED_AIRCRAFT_FLEET.map((a) => ({ ...a }))
    }
    return parsed
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
        const next: AircraftRecord = {
          ...aircraft,
          ...patch,
          lastUpdated: todayIso(),
        }
        if (patch.status === 'Up') {
          next.reasonGrounded = null
        }
        return next
      })
    )
  }, [])

  const resetToSeed = useCallback(() => {
    setFleet(SEED_AIRCRAFT_FLEET.map((a) => ({ ...a })))
  }, [])

  const value = useMemo(
    () => ({ fleet, updateAircraft, resetToSeed }),
    [fleet, updateAircraft, resetToSeed]
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
