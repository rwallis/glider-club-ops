import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { SignupFlight, SignupFlightStatus } from '../types'
import type { LocationCheck } from '../utils/geolocation'

const STORAGE_KEY = 'flf-signup-sheet-v2'

interface CheckInResult {
  ok: boolean
  message?: string
}

interface SignupContextValue {
  flights: SignupFlight[]
  holdingFlights: SignupFlight[]
  queuedFlights: SignupFlight[]
  activeFlights: SignupFlight[]
  completedFlights: SignupFlight[]
  addFlight: (
    pilotName: string,
    glider: string,
    instructor: string,
    location: LocationCheck,
  ) => void
  checkInFlight: (id: string, location: LocationCheck) => CheckInResult
  updateFlight: (id: string, updates: Partial<SignupFlight>) => void
  startFlight: (id: string) => void
  endFlight: (id: string) => void
  cancelFlight: (id: string) => void
  removeFlight: (id: string) => void
  clearCompleted: () => void
}

const SignupContext = createContext<SignupContextValue | null>(null)

function normalizeFlight(raw: SignupFlight): SignupFlight {
  const locationStatus = raw.locationStatus ?? 'on-field'
  const status =
    raw.status === 'queued' && locationStatus !== 'on-field'
      ? 'holding'
      : raw.status

  return {
    ...raw,
    status,
    locationStatus,
    distanceMiles: raw.distanceMiles ?? null,
    checkedInAt: raw.checkedInAt ?? null,
  }
}

function loadFlights(): SignupFlight[] {
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY)
    if (rawV2) {
      return (JSON.parse(rawV2) as SignupFlight[]).map(normalizeFlight)
    }

    const rawV1 = localStorage.getItem('flf-signup-sheet-v1')
    if (!rawV1) return []

    const migrated = (JSON.parse(rawV1) as SignupFlight[]).map((f) =>
      normalizeFlight({
        ...f,
        locationStatus: 'on-field',
        distanceMiles: null,
        checkedInAt: null,
      }),
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
    localStorage.removeItem('flf-signup-sheet-v1')
    return migrated
  } catch {
    return []
  }
}

function persist(flights: SignupFlight[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flights))
}

function nowTime(): string {
  return new Date().toTimeString().slice(0, 5)
}

function newId(): string {
  return crypto.randomUUID()
}

export function SignupProvider({ children }: { children: ReactNode }) {
  const [flights, setFlights] = useState<SignupFlight[]>(loadFlights)

  const save = useCallback((next: SignupFlight[]) => {
    setFlights(next)
    persist(next)
  }, [])

  const addFlight = useCallback(
    (pilotName: string, glider: string, instructor: string, location: LocationCheck) => {
      const onField = location.locationStatus === 'on-field'
      const entry: SignupFlight = {
        id: newId(),
        pilotName: pilotName.trim(),
        glider,
        instructor: instructor.trim(),
        startTime: null,
        endTime: null,
        status: onField ? 'queued' : 'holding',
        locationStatus: location.locationStatus,
        distanceMiles: location.distanceMiles,
        checkedInAt: onField ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
      }
      save([...flights, entry])
    },
    [flights, save],
  )

  const checkInFlight = useCallback(
    (id: string, location: LocationCheck): CheckInResult => {
      const flight = flights.find((f) => f.id === id)
      if (!flight || flight.status !== 'holding') {
        return { ok: false, message: 'Signup not found or already checked in.' }
      }

      if (location.locationStatus !== 'on-field') {
        if (location.locationStatus === 'remote') {
          const miles = location.distanceMiles?.toFixed(1) ?? '?'
          return {
            ok: false,
            message: `Still ${miles} mi from the field. Move within 2 mi to check in.`,
          }
        }
        return {
          ok: false,
          message: 'Location unavailable. Allow location access and try again.',
        }
      }

      save(
        flights.map((f) =>
          f.id === id
            ? {
                ...f,
                status: 'queued',
                locationStatus: 'on-field',
                distanceMiles: location.distanceMiles,
                checkedInAt: new Date().toISOString(),
              }
            : f,
        ),
      )
      return { ok: true }
    },
    [flights, save],
  )

  const updateFlight = useCallback(
    (id: string, updates: Partial<SignupFlight>) => {
      save(flights.map((f) => (f.id === id ? { ...f, ...updates } : f)))
    },
    [flights, save],
  )

  const setStatus = useCallback(
    (id: string, status: SignupFlightStatus, extra: Partial<SignupFlight> = {}) => {
      save(flights.map((f) => (f.id === id ? { ...f, status, ...extra } : f)))
    },
    [flights, save],
  )

  const startFlight = useCallback(
    (id: string) => {
      const flight = flights.find((f) => f.id === id)
      if (!flight || flight.status !== 'queued') return
      setStatus(id, 'flying', { startTime: flight.startTime ?? nowTime(), endTime: null })
    },
    [flights, setStatus],
  )

  const endFlight = useCallback(
    (id: string) => {
      const flight = flights.find((f) => f.id === id)
      if (!flight) return
      setStatus(id, 'completed', { endTime: flight.endTime ?? nowTime() })
    },
    [flights, setStatus],
  )

  const cancelFlight = useCallback(
    (id: string) => {
      setStatus(id, 'cancelled')
    },
    [setStatus],
  )

  const removeFlight = useCallback(
    (id: string) => {
      save(flights.filter((f) => f.id !== id))
    },
    [flights, save],
  )

  const clearCompleted = useCallback(() => {
    save(flights.filter((f) => f.status !== 'completed' && f.status !== 'cancelled'))
  }, [flights, save])

  const holdingFlights = useMemo(
    () => flights.filter((f) => f.status === 'holding'),
    [flights],
  )

  const queuedFlights = useMemo(
    () => flights.filter((f) => f.status === 'queued'),
    [flights],
  )

  const activeFlights = useMemo(
    () => flights.filter((f) => f.status === 'queued' || f.status === 'flying'),
    [flights],
  )

  const completedFlights = useMemo(
    () => flights.filter((f) => f.status === 'completed' || f.status === 'cancelled'),
    [flights],
  )

  const value = useMemo(
    () => ({
      flights,
      holdingFlights,
      queuedFlights,
      activeFlights,
      completedFlights,
      addFlight,
      checkInFlight,
      updateFlight,
      startFlight,
      endFlight,
      cancelFlight,
      removeFlight,
      clearCompleted,
    }),
    [
      flights,
      holdingFlights,
      queuedFlights,
      activeFlights,
      completedFlights,
      addFlight,
      checkInFlight,
      updateFlight,
      startFlight,
      endFlight,
      cancelFlight,
      removeFlight,
      clearCompleted,
    ],
  )

  return <SignupContext.Provider value={value}>{children}</SignupContext.Provider>
}

export function useSignup() {
  const ctx = useContext(SignupContext)
  if (!ctx) throw new Error('useSignup must be used within SignupProvider')
  return ctx
}
