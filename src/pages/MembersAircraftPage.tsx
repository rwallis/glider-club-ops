import { useMemo, useState } from 'react'
import type { AircraftRecord, AnnualUrgency, DemoRidesStatus } from '../data/aircraftFleet'
import { useAircraftFleet } from '../context/AircraftFleetContext'
import { annualUrgency, daysUntilDue, formatDaysLabel } from '../utils/annualDue'
import { assessDemoRides } from '../utils/demoRides'

type BoardFilter = 'all' | 'up' | 'down' | 'attention' | 'demo-down'

const URGENCY_STYLES: Record<
  AnnualUrgency,
  { bar: string; chip: string; label: string }
> = {
  green: {
    bar: 'bg-emerald-400',
    chip: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
    label: 'Current',
  },
  amber: {
    bar: 'bg-amber-400',
    chip: 'bg-amber-500/15 text-amber-200 ring-amber-400/35',
    label: 'Due soon',
  },
  red: {
    bar: 'bg-rose-400',
    chip: 'bg-rose-500/15 text-rose-300 ring-rose-400/35',
    label: 'Overdue / critical',
  },
  unknown: {
    bar: 'bg-slate-400',
    chip: 'bg-slate-500/20 text-slate-300 ring-slate-400/30',
    label: 'Unknown',
  },
}

const DEMO_STYLES: Record<
  DemoRidesStatus,
  { chip: string; label: string }
> = {
  up: {
    chip: 'bg-emerald-500/20 text-emerald-300 ring-emerald-400/40',
    label: 'Demo Up',
  },
  caution: {
    chip: 'bg-amber-500/20 text-amber-200 ring-amber-400/40',
    label: 'Demo Caution',
  },
  down: {
    chip: 'bg-rose-500/20 text-rose-300 ring-rose-400/40',
    label: 'Demo Down',
  },
  na: {
    chip: 'bg-slate-500/20 text-slate-400 ring-slate-400/30',
    label: 'Demo N/A',
  },
}

function sortFleet(fleet: AircraftRecord[]) {
  return [...fleet].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'Down' ? -1 : 1
    const da = daysUntilDue(a.dueMmYy)
    const db = daysUntilDue(b.dueMmYy)
    if (da == null && db == null) return a.tail.localeCompare(b.tail)
    if (da == null) return -1
    if (db == null) return 1
    return da - db
  })
}

function AircraftCard({ aircraft }: { aircraft: AircraftRecord }) {
  const { updateAircraft } = useAircraftFleet()
  const [editing, setEditing] = useState(false)
  const urgency = annualUrgency(aircraft.dueMmYy)
  const days = daysUntilDue(aircraft.dueMmYy)
  const urgencyUi = URGENCY_STYLES[urgency]
  const demo = assessDemoRides(aircraft)
  const demoUi = DEMO_STYLES[demo.status]
  const subtitle = [aircraft.type, aircraft.color, aircraft.category === 'tow' ? 'Tow' : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-white/[0.04] shadow-lg shadow-black/20 backdrop-blur-sm ${
        aircraft.status === 'Down' || demo.status === 'down'
          ? 'border-rose-400/25'
          : demo.status === 'caution'
            ? 'border-amber-400/25'
            : 'border-white/10'
      }`}
    >
      <div className={`absolute inset-y-0 left-0 w-1.5 ${urgencyUi.bar}`} aria-hidden />

      <div className="space-y-4 p-4 pl-5 sm:p-5 sm:pl-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-white sm:text-3xl">
              {aircraft.tail}
            </h2>
            <p className="mt-0.5 text-sm text-sky-200/70">{subtitle}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${
                aircraft.status === 'Up'
                  ? 'bg-emerald-500/20 text-emerald-300 ring-emerald-400/40'
                  : 'bg-rose-500/20 text-rose-300 ring-rose-400/40'
              }`}
            >
              Ops {aircraft.status}
            </span>
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${demoUi.chip}`}
              title={demo.detail}
            >
              {demoUi.label}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${urgencyUi.chip}`}
          >
            Due {aircraft.dueMmYy ?? '—'} · {formatDaysLabel(days)}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Last annual</dt>
            <dd className="mt-0.5 text-slate-200">{aircraft.lastAnnual ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Hours since</dt>
            <dd className="mt-0.5 text-slate-200">
              {aircraft.hoursSinceAnnual != null ? aircraft.hoursSinceAnnual : '—'}
              {demo.estimatedExtraHours > 0 ? (
                <span className="block text-xs text-amber-200/80">
                  ~{demo.effectiveHours?.toFixed(1)} est. (+{demo.estimatedExtraHours} weekends)
                </span>
              ) : null}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs uppercase tracking-wide text-slate-400">Demo rides</dt>
            <dd className="mt-0.5 text-slate-200">{demo.detail}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs uppercase tracking-wide text-slate-400">Grounded reason</dt>
            <dd className="mt-0.5 text-slate-200">
              {aircraft.status === 'Down' ? (
                aircraft.reasonGrounded ? (
                  aircraft.reasonGrounded
                ) : (
                  <span className="text-amber-300">Needs reason</span>
                )
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs uppercase tracking-wide text-slate-400">Last updated</dt>
            <dd className="mt-0.5 text-slate-400">
              {aircraft.lastUpdated ?? '—'}
              {aircraft.hoursLastEntered
                ? ` · hours entered ${aircraft.hoursLastEntered}`
                : ''}
            </dd>
          </div>
        </dl>

        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="text-xs font-medium text-sky-300 hover:text-sky-200"
          >
            {editing ? 'Close' : 'Edit'}
          </button>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() =>
                updateAircraft(aircraft.id, {
                  status: 'Up',
                  reasonGrounded: null,
                })
              }
              className="rounded-md px-2 py-1 text-xs text-emerald-300 ring-1 ring-emerald-400/30 hover:bg-emerald-500/10"
            >
              Mark Up
            </button>
            <button
              type="button"
              onClick={() =>
                updateAircraft(aircraft.id, {
                  status: 'Down',
                  reasonGrounded: aircraft.reasonGrounded || 'Needs reason',
                })
              }
              className="rounded-md px-2 py-1 text-xs text-rose-300 ring-1 ring-rose-400/30 hover:bg-rose-500/10"
            >
              Mark Down
            </button>
          </div>
        </div>

        {editing ? (
          <div className="space-y-3 rounded-xl bg-black/25 p-3 ring-1 ring-white/10">
            <label className="block text-xs text-slate-400">
              Annual due (MM/YY)
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
                defaultValue={aircraft.dueMmYy ?? ''}
                placeholder="05/27"
                onBlur={(e) => {
                  const value = e.target.value.trim() || null
                  if (value !== aircraft.dueMmYy) {
                    updateAircraft(aircraft.id, { dueMmYy: value })
                  }
                }}
              />
            </label>
            <label className="block text-xs text-slate-400">
              Last annual
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
                defaultValue={aircraft.lastAnnual ?? ''}
                placeholder="05/25"
                onBlur={(e) => {
                  const value = e.target.value.trim() || null
                  if (value !== aircraft.lastAnnual) {
                    updateAircraft(aircraft.id, { lastAnnual: value })
                  }
                }}
              />
            </label>
            <label className="block text-xs text-slate-400">
              Hours since last annual
              <input
                type="number"
                min={0}
                step={0.1}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
                defaultValue={aircraft.hoursSinceAnnual ?? ''}
                placeholder="Required for demo rides"
                onBlur={(e) => {
                  const raw = e.target.value.trim()
                  const next = raw === '' ? null : Number(raw)
                  if (next !== aircraft.hoursSinceAnnual && (next == null || Number.isFinite(next))) {
                    updateAircraft(aircraft.id, { hoursSinceAnnual: next })
                  }
                }}
              />
            </label>
            <label className="block text-xs text-slate-400">
              Reason grounded
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
                defaultValue={aircraft.reasonGrounded ?? ''}
                placeholder={aircraft.status === 'Down' ? 'Required when Down' : '—'}
                onBlur={(e) => {
                  const value = e.target.value.trim() || null
                  if (value !== aircraft.reasonGrounded) {
                    updateAircraft(aircraft.id, { reasonGrounded: value })
                  }
                }}
              />
            </label>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function MembersAircraftPage() {
  const { fleet, resetToSeed } = useAircraftFleet()
  const [filter, setFilter] = useState<BoardFilter>('all')

  const sorted = useMemo(() => sortFleet(fleet), [fleet])

  const visible = useMemo(() => {
    return sorted.filter((a) => {
      if (filter === 'up') return a.status === 'Up'
      if (filter === 'down') return a.status === 'Down'
      if (filter === 'demo-down') return assessDemoRides(a).status === 'down'
      if (filter === 'attention') {
        const u = annualUrgency(a.dueMmYy)
        const demo = assessDemoRides(a)
        return (
          a.status === 'Down' ||
          u === 'red' ||
          u === 'amber' ||
          u === 'unknown' ||
          demo.status === 'down' ||
          demo.status === 'caution'
        )
      }
      return true
    })
  }, [sorted, filter])

  const upCount = fleet.filter((a) => a.status === 'Up').length
  const downCount = fleet.filter((a) => a.status === 'Down').length
  const demoDownCount = fleet.filter((a) => assessDemoRides(a).status === 'down').length

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-400/80">
            Fleet board
          </p>
          <h1 className="font-display mt-1 text-3xl text-white sm:text-4xl">Aircraft status</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-300/90">
            Ops Up/Down plus Demo Rides for gliders (not tow planes). Missing hours or ≥95h → demo
            down; ≥85h → yellow. Stale hours add 5h per weekend since last entry.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-emerald-300 ring-1 ring-emerald-400/30">
            {upCount} Ops Up
          </span>
          <span className="rounded-lg bg-rose-500/15 px-3 py-1.5 text-rose-300 ring-1 ring-rose-400/30">
            {downCount} Ops Down
          </span>
          <span className="rounded-lg bg-rose-500/15 px-3 py-1.5 text-rose-200 ring-1 ring-rose-400/30">
            {demoDownCount} Demo Down
          </span>
          <button
            type="button"
            onClick={resetToSeed}
            className="text-xs text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline"
          >
            Reset seed
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1">
        {(
          [
            ['all', 'All'],
            ['down', 'Ops Down'],
            ['up', 'Ops Up'],
            ['demo-down', 'Demo Down'],
            ['attention', 'Needs attention'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === id
                ? 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-400/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((aircraft) => (
          <AircraftCard key={aircraft.id} aircraft={aircraft} />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-400">No aircraft in this filter.</p>
      ) : null}
    </main>
  )
}
