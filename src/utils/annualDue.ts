import type { AnnualUrgency } from '../data/aircraftFleet'

const AMBER_DAYS = 60
const RED_DAYS = 14

/** Parse MM/YY as end-of-month date (local). */
export function parseDueMmYy(dueMmYy: string | null | undefined): Date | null {
  if (!dueMmYy) return null
  const match = String(dueMmYy).trim().match(/^(\d{1,2})\s*\/\s*(\d{2})$/)
  if (!match) return null
  const month = Number(match[1])
  const yy = Number(match[2])
  if (month < 1 || month > 12) return null
  const year = 2000 + yy
  // Day 0 of next month = last day of due month
  return new Date(year, month, 0, 23, 59, 59, 999)
}

export function daysUntilDue(dueMmYy: string | null | undefined, now = new Date()): number | null {
  const due = parseDueMmYy(dueMmYy)
  if (!due) return null
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  return Math.round((end.getTime() - start.getTime()) / 86_400_000)
}

export function annualUrgency(dueMmYy: string | null | undefined, now = new Date()): AnnualUrgency {
  const days = daysUntilDue(dueMmYy, now)
  if (days == null) return 'unknown'
  if (days < 0 || days <= RED_DAYS) return 'red'
  if (days <= AMBER_DAYS) return 'amber'
  return 'green'
}

export function formatDaysLabel(days: number | null): string {
  if (days == null) return 'Due unknown'
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  return `${days}d left`
}

/** Default Up/Down from annual due: overdue or unknown → Down. */
export function statusFromAnnualDue(dueMmYy: string | null | undefined, now = new Date()): 'Up' | 'Down' {
  const days = daysUntilDue(dueMmYy, now)
  if (days == null || days < 0) return 'Down'
  return 'Up'
}
