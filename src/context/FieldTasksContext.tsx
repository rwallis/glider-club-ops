import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { defaultFieldTasks } from '../data/fieldTasks'
import type { FieldTask, FieldTaskStatus } from '../types'

const STORAGE_KEY = 'flf-field-tasks-v1'

interface FieldTasksContextValue {
  tasks: FieldTask[]
  tasksByCategory: (categoryId: string) => FieldTask[]
  addTask: (
    categoryId: string,
    title: string,
    options?: { notes?: string; assignedMember?: string },
  ) => void
  updateTask: (id: string, updates: Partial<FieldTask>) => void
  setTaskStatus: (
    id: string,
    status: FieldTaskStatus,
    member?: string | null,
  ) => void
  removeTask: (id: string) => void
}

const FieldTasksContext = createContext<FieldTasksContextValue | null>(null)

function loadTasks(): FieldTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(defaultFieldTasks)
    const parsed = JSON.parse(raw) as FieldTask[]
    return parsed.length ? parsed : structuredClone(defaultFieldTasks)
  } catch {
    return structuredClone(defaultFieldTasks)
  }
}

function persist(tasks: FieldTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function newId(): string {
  return crypto.randomUUID()
}

export function FieldTasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<FieldTask[]>(loadTasks)

  const save = useCallback((next: FieldTask[]) => {
    setTasks(next)
    persist(next)
  }, [])

  const addTask = useCallback(
    (
      categoryId: string,
      title: string,
      options: { notes?: string; assignedMember?: string } = {},
    ) => {
      const trimmed = title.trim()
      if (!trimmed) return
      const assigned = options.assignedMember?.trim() || null
      const ts = new Date().toISOString()
      const entry: FieldTask = {
        id: newId(),
        categoryId,
        title: trimmed,
        notes: options.notes?.trim() || undefined,
        status: assigned ? 'assigned' : 'pending',
        assignedMember: assigned,
        completedBy: null,
        createdAt: ts,
        updatedAt: ts,
      }
      save([...tasks, entry])
    },
    [tasks, save],
  )

  const updateTask = useCallback(
    (id: string, updates: Partial<FieldTask>) => {
      save(
        tasks.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t,
        ),
      )
    },
    [tasks, save],
  )

  const setTaskStatus = useCallback(
    (id: string, status: FieldTaskStatus, member?: string | null) => {
      save(
        tasks.map((t) => {
          if (t.id !== id) return t
          const ts = new Date().toISOString()
          if (status === 'pending') {
            return {
              ...t,
              status,
              assignedMember: null,
              completedBy: null,
              updatedAt: ts,
            }
          }
          if (status === 'assigned') {
            return {
              ...t,
              status,
              assignedMember: member?.trim() || t.assignedMember,
              completedBy: null,
              updatedAt: ts,
            }
          }
          return {
            ...t,
            status: 'complete',
            completedBy: member?.trim() || t.completedBy || t.assignedMember,
            updatedAt: ts,
          }
        }),
      )
    },
    [tasks, save],
  )

  const removeTask = useCallback(
    (id: string) => {
      save(tasks.filter((t) => t.id !== id))
    },
    [tasks, save],
  )

  const tasksByCategory = useCallback(
    (categoryId: string) => tasks.filter((t) => t.categoryId === categoryId),
    [tasks],
  )

  const value = useMemo(
    () => ({
      tasks,
      tasksByCategory,
      addTask,
      updateTask,
      setTaskStatus,
      removeTask,
    }),
    [tasks, tasksByCategory, addTask, updateTask, setTaskStatus, removeTask],
  )

  return <FieldTasksContext.Provider value={value}>{children}</FieldTasksContext.Provider>
}

export function useFieldTasks() {
  const ctx = useContext(FieldTasksContext)
  if (!ctx) throw new Error('useFieldTasks must be used within FieldTasksProvider')
  return ctx
}
