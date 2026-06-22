import type { StatusLevel } from '../types'

const statusConfig: Record<
  StatusLevel,
  { label: string; dot: string; badge: string }
> = {
  operational: {
    label: 'Operational',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
  },
  'in-use': {
    label: 'In use',
    dot: 'bg-sky-400',
    badge: 'bg-sky-500/15 text-sky-300 ring-sky-400/30',
  },
  maintenance: {
    label: 'Maintenance',
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  },
  unavailable: {
    label: 'Unavailable',
    dot: 'bg-rose-400',
    badge: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
  },
  caution: {
    label: 'Caution',
    dot: 'bg-orange-400',
    badge: 'bg-orange-500/15 text-orange-300 ring-orange-400/30',
  },
}

interface StatusBadgeProps {
  status: StatusLevel
  compact?: boolean
}

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const config = statusConfig[status]

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${config.badge}`}
        title={config.label}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${config.badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

export function StatusDot({ status }: { status: StatusLevel }) {
  return (
    <span
      className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusConfig[status].dot}`}
      title={statusConfig[status].label}
    />
  )
}
