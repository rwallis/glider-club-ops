import { useMemo, useState } from 'react'
import type { AircraftRecord, AnnualUrgency } from '../data/aircraftFleet'
import { useAircraftFleet } from '../context/AircraftFleetContext'
import { annualUrgency, daysUntilDue, formatDaysLabel } from '../utils/annualDue'
import { fleetBoardSection, type FleetBoardSection } from '../utils/fleetBoard'

type BoardFilter = 'all' | 'up' | 'down' | 'attention'

const SECTION_META: Record<FleetBoardSection, { title: string; blurb: string }> = {
  tow: {
    title: 'Tow planes',
    blurb: 'Launch aircraft',
  },
  'two-seat': {
    title: '2-seat gliders',
    blurb: '2-33s and Grob',
  },
  'single-seat': {
    title: 'Single-seat gliders',
    blurb: '1-26s and 1-36',
  },
}

const SECTION_ORDER: FleetBoardSection[] = ['tow', 'two-seat', 'single-seat']

const URGENCY_STYLES: Record<
  AnnualUrgency,
  { bar: string; chip: string }
> = {
  green: {
    bar: 'bg-emerald-400',
    chip: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
  },
  amber: {
    bar: 'bg-amber-400',
    chip: 'bg-amber-500/15 text-amber-200 ring-amber-400/35',
  },
  red: {
    bar: 'bg-rose-400',
    chip: 'bg-rose-500/15 text-rose-300 ring-rose-400/35',
  },
  unknown: {
    bar: 'bg-slate-400',
    chip: 'bg-slate-500/20 text-slate-300 ring-slate-400/30',
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
  const subtitle = [aircraft.type, aircraft.color, aircraft.category === 'tow' ? 'Tow' : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <article
      className={`relative overflow-hidden rounded-lg border bg-white/[0.04] ${
        aircraft.status === 'Down' ? 'border-rose-400/25' : 'border-white/10'
      }`}
    >
      <div className={`absolute inset-y-0 left-0 w-1 ${urgencyUi.bar}`} aria-hidden />

      <div className="space-y-1.5 p-2.5 pl-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-lg leading-none tracking-tight text-white">
              {aircraft.tail}
            </h2>
            <p className="mt-0.5 truncate text-[11px] text-sky-200/70">{subtitle}</p>
          </div>
          <span
            className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${
              aircraft.status === 'Up'
                ? 'bg-emerald-500/30 text-emerald-100 ring-emerald-400/55'
                : 'bg-rose-500/30 text-rose-100 ring-rose-400/55'
            }`}
          >
            Ops {aircraft.status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
          <span
            className={`inline-flex items-center rounded px-1.5 py-0.5 font-medium ring-1 ring-inset ${urgencyUi.chip}`}
          >
            Due {aircraft.dueMmYy ?? '—'} · {formatDaysLabel(days)}
          </span>
          <span className="font-medium text-slate-200">
            Hrs {aircraft.hoursSinceAnnual != null ? aircraft.hoursSinceAnnual : '—'}
          </span>
        </div>

        {aircraft.status === 'Down' ? (
          <p className="truncate text-[11px] text-slate-300">
            {aircraft.reasonGrounded || <span className="text-amber-300">Needs reason</span>}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-1.5 print:hidden">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="text-[11px] font-medium text-sky-300 hover:text-sky-200"
          >
            {editing ? 'Close' : 'Edit'}
          </button>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() =>
                updateAircraft(aircraft.id, {
                  status: 'Up',
                  reasonGrounded: null,
                })
              }
              className="rounded px-1.5 py-0.5 text-[11px] text-emerald-300 ring-1 ring-emerald-400/30 hover:bg-emerald-500/10"
            >
              Up
            </button>
            <button
              type="button"
              onClick={() =>
                updateAircraft(aircraft.id, {
                  status: 'Down',
                  reasonGrounded: aircraft.reasonGrounded || 'Needs reason',
                })
              }
              className="rounded px-1.5 py-0.5 text-[11px] text-rose-300 ring-1 ring-rose-400/30 hover:bg-rose-500/10"
            >
              Down
            </button>
          </div>
        </div>

        {editing ? (
          <div className="space-y-1.5 rounded-md bg-black/25 p-2 ring-1 ring-white/10 print:hidden">
            <label className="block text-[11px] text-slate-400">
              Annual due (MM/YY)
              <input
                className="mt-0.5 w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-sky-400/50"
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
            <label className="block text-[11px] text-slate-400">
              Last annual
              <input
                className="mt-0.5 w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-sky-400/50"
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
            <label className="block text-[11px] text-slate-400">
              Hours since last annual
              <input
                type="number"
                min={0}
                step={0.1}
                className="mt-0.5 w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-sky-400/50"
                defaultValue={aircraft.hoursSinceAnnual ?? ''}
                placeholder="0.0"
                onBlur={(e) => {
                  const raw = e.target.value.trim()
                  const next = raw === '' ? null : Number(raw)
                  if (next !== aircraft.hoursSinceAnnual && (next == null || Number.isFinite(next))) {
                    updateAircraft(aircraft.id, { hoursSinceAnnual: next })
                  }
                }}
              />
            </label>
            <label className="block text-[11px] text-slate-400">
              Reason grounded
              <input
                className="mt-0.5 w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-sky-400/50"
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
      if (filter === 'attention') {
        const u = annualUrgency(a.dueMmYy)
        return a.status === 'Down' || u === 'red' || u === 'amber' || u === 'unknown'
      }
      return true
    })
  }, [sorted, filter])

  const sections = useMemo(() => {
    return SECTION_ORDER.map((id) => ({
      id,
      ...SECTION_META[id],
      aircraft: visible.filter((a) => fleetBoardSection(a) === id),
    })).filter((s) => s.aircraft.length > 0)
  }, [visible])

  const upCount = fleet.filter((a) => a.status === 'Up').length
  const downCount = fleet.filter((a) => a.status === 'Down').length

  return (
    <main className="mx-auto max-w-6xl px-3 py-3 sm:px-4 lg:px-5 print:max-w-none print:px-2 print:py-1">
      <div className="mb-2.5 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <h1 className="font-display text-xl leading-tight text-white sm:text-2xl">
            Aircraft status
          </h1>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Tow · 2-seat · single-seat — hours since last annual
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-300 ring-1 ring-emerald-400/30">
            {upCount} Up
          </span>
          <span className="rounded-md bg-rose-500/15 px-2 py-0.5 font-medium text-rose-300 ring-1 ring-rose-400/30">
            {downCount} Down
          </span>
          <button
            type="button"
            onClick={resetToSeed}
            className="text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline print:hidden"
          >
            Reset seed
          </button>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap gap-1 print:hidden">
        {(
          [
            ['all', 'All'],
            ['down', 'Ops Down'],
            ['up', 'Ops Up'],
            ['attention', 'Needs attention'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
              filter === id
                ? 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-400/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={`fleet-section-${section.id}`}>
            <div className="mb-1 flex items-baseline gap-2">
              <h2
                id={`fleet-section-${section.id}`}
                className="font-display text-sm text-white sm:text-base"
              >
                {section.title}
              </h2>
              <p className="text-[10px] text-slate-500">{section.blurb}</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3 lg:grid-cols-4">
              {section.aircraft.map((aircraft) => (
                <AircraftCard key={aircraft.id} aircraft={aircraft} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 text-center text-sm text-slate-400">No aircraft in this filter.</p>
      ) : null}
    </main>
  )
}
