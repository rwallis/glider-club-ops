import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { clubSnapshot as defaultSnapshot } from '../data/clubStatus'
import type { CategoryCard, ClubSnapshot, StatusItem, StatusLevel } from '../types'

const STORAGE_KEY = 'flf-club-status-v1'

interface ClubStatusContextValue {
  snapshot: ClubSnapshot
  categories: CategoryCard[]
  updateCategory: (id: string, updates: Partial<CategoryCard>) => void
  updateCategoryItem: (categoryId: string, itemId: string, updates: Partial<StatusItem>) => void
  toggleOpsCheck: (itemId: string, checked: boolean) => void
  resetToDefaults: () => void
  touchUpdated: () => void
}

const ClubStatusContext = createContext<ClubStatusContextValue | null>(null)

function loadSnapshot(): ClubSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(defaultSnapshot)
    const parsed = JSON.parse(raw) as ClubSnapshot
    return {
      ...defaultSnapshot,
      ...parsed,
      categories: mergeCategories(defaultSnapshot.categories, parsed.categories),
    }
  } catch {
    return structuredClone(defaultSnapshot)
  }
}

function mergeCategories(defaults: CategoryCard[], saved: CategoryCard[] | undefined): CategoryCard[] {
  if (!saved?.length) return structuredClone(defaults)
  return defaults.map((def) => {
    const match = saved.find((c) => c.id === def.id)
    return match ? { ...def, ...match, items: mergeItems(def.items, match.items) } : def
  })
}

function mergeItems(defaults: StatusItem[], saved: StatusItem[] | undefined): StatusItem[] {
  if (!saved?.length) return defaults
  const merged = defaults.map((d) => {
    const s = saved.find((i) => i.id === d.id)
    return s ? { ...d, ...s } : d
  })
  for (const item of saved) {
    if (!defaults.some((d) => d.id === item.id)) {
      merged.push(item)
    }
  }
  return merged
}

function persist(snapshot: ClubSnapshot) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}

function opsCategoryStatus(items: StatusItem[]): StatusLevel {
  const allChecked = items.every((i) => i.checked)
  const someChecked = items.some((i) => i.checked)
  if (allChecked) return 'operational'
  if (someChecked) return 'caution'
  return 'caution'
}

export function ClubStatusProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<ClubSnapshot>(loadSnapshot)

  const save = useCallback((next: ClubSnapshot) => {
    setSnapshot(next)
    persist(next)
  }, [])

  const touchUpdated = useCallback(() => {
    setSnapshot((prev) => {
      const next = { ...prev, lastUpdated: new Date().toISOString() }
      persist(next)
      return next
    })
  }, [])

  const updateCategory = useCallback(
    (id: string, updates: Partial<CategoryCard>) => {
      setSnapshot((prev) => {
        const categories = prev.categories.map((c) => (c.id === id ? { ...c, ...updates } : c))
        const next = { ...prev, categories, lastUpdated: new Date().toISOString() }
        persist(next)
        return next
      })
    },
    [],
  )

  const updateCategoryItem = useCallback(
    (categoryId: string, itemId: string, updates: Partial<StatusItem>) => {
      setSnapshot((prev) => {
        const categories = prev.categories.map((c) => {
          if (c.id !== categoryId) return c
          return {
            ...c,
            items: c.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
          }
        })
        const next = { ...prev, categories, lastUpdated: new Date().toISOString() }
        persist(next)
        return next
      })
    },
    [],
  )

  const toggleOpsCheck = useCallback((itemId: string, checked: boolean) => {
    setSnapshot((prev) => {
      const categories = prev.categories.map((c) => {
        if (c.id !== 'ops') return c
        const items = c.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                checked,
                status: (checked ? 'operational' : 'caution') as StatusLevel,
              }
            : item,
        )
        return { ...c, items, status: opsCategoryStatus(items) }
      })
      const next = { ...prev, categories, lastUpdated: new Date().toISOString() }
      persist(next)
      return next
    })
  }, [])

  const resetToDefaults = useCallback(() => {
    const next = structuredClone(defaultSnapshot)
    save(next)
  }, [save])

  const value = useMemo(
    () => ({
      snapshot,
      categories: snapshot.categories,
      updateCategory,
      updateCategoryItem,
      toggleOpsCheck,
      resetToDefaults,
      touchUpdated,
    }),
    [snapshot, updateCategory, updateCategoryItem, toggleOpsCheck, resetToDefaults, touchUpdated],
  )

  return <ClubStatusContext.Provider value={value}>{children}</ClubStatusContext.Provider>
}

export function useClubStatus() {
  const ctx = useContext(ClubStatusContext)
  if (!ctx) throw new Error('useClubStatus must be used within ClubStatusProvider')
  return ctx
}
