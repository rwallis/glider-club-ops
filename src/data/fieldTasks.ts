import type { FieldTask } from '../types'

const now = new Date().toISOString()

/** Seed work items aligned with briefing board categories */
export const defaultFieldTasks: FieldTask[] = [
  {
    id: 'task-mow-se',
    categoryId: 'field',
    title: 'Mow southeast side of runway',
    status: 'pending',
    assignedMember: null,
    completedBy: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-roller-remove',
    categoryId: 'field',
    title: 'Remove field roller from runway area',
    notes: 'Stuck ~500 ft past last hangar — coordinate before mowing',
    status: 'pending',
    assignedMember: null,
    completedBy: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-pawnee-bungee',
    categoryId: 'tow-planes',
    title: 'Pawnee bungees to be replaced',
    status: 'assigned',
    assignedMember: 'Tom Barkow',
    completedBy: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-mower-canopy',
    categoryId: 'mowers',
    title: 'Mower canopy broken — repair or replace',
    status: 'complete',
    assignedMember: null,
    completedBy: 'Ron Wallis',
    createdAt: now,
    updatedAt: now,
  },
]

/** Briefing categories that accept field work items */
export const TASK_CATEGORY_IDS = [
  'field',
  'hangar',
  'gliders',
  'tow-planes',
  'launch',
  'mowers',
  'ops',
] as const
