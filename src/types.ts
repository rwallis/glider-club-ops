export type StatusLevel = 'operational' | 'in-use' | 'maintenance' | 'unavailable' | 'caution'

export interface StatusItem {
  id: string
  name: string
  status: StatusLevel
  detail?: string
  updatedAt?: string
}

export interface CategoryCard {
  id: string
  title: string
  icon: string
  summary: string
  status: StatusLevel
  items: StatusItem[]
  notes?: string
}

export interface ClubSnapshot {
  clubName: string
  fieldName: string
  lastUpdated: string
  flyingDay: boolean
  categories: CategoryCard[]
}
