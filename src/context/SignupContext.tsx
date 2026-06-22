import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { SignupFlight, SignupFlightStatus } from '../types'

const STORAGE_KEY = 'flf-signup-sheet-v1'

interface SignupContextValue {
  flights: SignupFlight[]
  activeFlights: SignupFlight[]
  completedFlights: SignupFlight[]
  addFlight: (pilotName: string, glider: string, instructor: string) => void
  updateFlight: (id: string, updates: Partial<SignupFlight>) => void
  startFlight: (id: string) => void
  endFlight: (id: string) => void
  cancelFlight: (id: string) => void
  removeFlight: (id: string) => void
  clearCompleted: () => void
}

const SignupContext = createContext<SignupContextValue | null>(null)

function loadFlights(): SignupFlight[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SignupFlight[]) : []
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
    (pilotName: string, glider: string, instructor: string) => {
      const entry: SignupFlight = {
        id: newId(),
        pilotName: pilotName.trim(),
        glider,
        instructor: instructor.trim(),
        startTime: null,
        endTime: null,
        status: 'queued',
        createdAt: new Date().toISOString(),
      }
      save([...flights, entry])
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
      if (!flight) return
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
      activeFlights,
      completedFlights,
      addFlight,
      updateFlight,
      startFlight,
      endFlight,
      cancelFlight,
      removeFlight,
      clearCompleted,
    }),
    [
      flights,
      activeFlights,
      completedFlights,
      addFlight,
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
