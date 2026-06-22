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

export type SignupFlightStatus = 'holding' | 'queued' | 'flying' | 'completed' | 'cancelled'

export type SignupLocationStatus = 'on-field' | 'remote' | 'unknown'

export interface SignupFlight {
  id: string
  pilotName: string
  glider: string
  instructor: string
  startTime: string | null
  endTime: string | null
  status: SignupFlightStatus
  locationStatus: SignupLocationStatus
  distanceMiles: number | null
  checkedInAt: string | null
  createdAt: string
}

export type FieldTaskStatus = 'pending' | 'assigned' | 'complete'

export interface FieldTask {
  id: string
  categoryId: string
  title: string
  notes?: string
  status: FieldTaskStatus
  assignedMember: string | null
  completedBy: string | null
  createdAt: string
  updatedAt: string
}
