export type StatusLevel = 'operational' | 'in-use' | 'maintenance' | 'unavailable' | 'caution'

export interface StatusItem {
  id: string
  name: string
  status: StatusLevel
  detail?: string
  updatedAt?: string
  /** Operations checklist — checked means confirmed done */
  checked?: boolean
}

export interface CategoryCard {
  id: string
  title: string
  icon: string
  summary: string
  status: StatusLevel
  items: StatusItem[]
  notes?: string
  statusLabel?: string
}

export interface ClubSnapshot {
  clubName: string
  fieldName: string
  lastUpdated: string
  flyingDay: boolean
  categories: CategoryCard[]
}

export type SignupFlightStatus = 'queued' | 'flying' | 'completed' | 'cancelled'

export interface SignupFlight {
  id: string
  pilotName: string
  glider: string
  instructor: string
  startTime: string | null
  endTime: string | null
  status: SignupFlightStatus
  createdAt: string
}
