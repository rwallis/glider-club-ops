import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AircraftRecord, AnnualUrgency, DemoRidesStatus } from '../data/aircraftFleet'
import { useAircraftFleet } from '../context/AircraftFleetContext'
import { useAuth } from '../context/AuthContext'
import { useClubStatus } from '../context/ClubStatusContext'
import { annualUrgency, daysUntilDue, formatDaysLabel } from '../utils/annualDue'
import { assessDemoRides } from '../utils/demoRides'
import { fleetBoardSection, type FleetBoardSection } from '../utils/fleetBoard'

const SECTION_META: Record<FleetBoardSection, { title: string }> = {
  tow: { title: 'Tow planes' },
  'two-seat': { title: '2-seat gliders' },
  'single-seat': { title: 'Single-seat gliders' },
}

const SECTION_ORDER: FleetBoardSection[] = ['tow', 'two-seat', 'single-seat']

const URGENCY_STYLES: Record<AnnualUrgency, { bar: string; chip: string }> = {
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

const DEMO_PILL: Record<Exclude<DemoRidesStatus, 'na'>, { chip: string; label: string }> = {
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

function latestFleetStamp(fleet: AircraftRecord[]): string | null {
  const stamps = fleet
    .flatMap((a) => [a.lastUpdated, a.hoursLastEntered])
    .filter((v): v is string => Boolean(v))
    .sort()
  return stamps.length ? stamps[stamps.length - 1]! : null
}

function AircraftCard({
  aircraft,
  adminMode,
}: {
  aircraft: AircraftRecord
  adminMode: boolean
}) {
  const { updateAircraft } = useAircraftFleet()
  const [editing, setEditing] = useState(false)
  const urgency = annualUrgency(aircraft.dueMmYy)
  const days = daysUntilDue(aircraft.dueMmYy)
  const urgencyUi = URGENCY_STYLES[urgency]
  const demo = assessDemoRides(aircraft)
  const demoPill = demo.applicable && demo.status !== 'na' ? DEMO_PILL[demo.status] : null
  const subtitle = [aircraft.type, aircraft.color, aircraft.category === 'tow' ? 'Tow' : null]
    .filter(Boolean)
    .join(' · ')

  useEffect(() => {
    if (!adminMode) setEditing(false)
  }, [adminMode])

  return (
    <article
      className={`relative flex min-h-0 flex-col overflow-hidden rounded-xl border bg-white/[0.045] ${
        aircraft.status === 'Down' || demo.status === 'down'
          ? 'border-rose-400/30'
          : demo.status === 'caution'
            ? 'border-amber-400/30'
            : 'border-white/10'
      }`}
    >
      <div className={`absolute inset-y-0 left-0 w-1.5 ${urgencyUi.bar}`} aria-hidden />

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3 pl-4 sm:p-3.5 sm:pl-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-xl leading-none tracking-tight text-white sm:text-2xl lg:text-[1.65rem]">
              {aircraft.tail}
            </h2>
            <p className="mt-1 truncate text-xs text-sky-200/75 sm:text-sm">{subtitle}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-inset sm:px-3 sm:py-1.5 sm:text-sm ${
                aircraft.status === 'Up'
                  ? 'bg-emerald-500/30 text-emerald-100 ring-emerald-400/55'
                  : 'bg-rose-500/30 text-rose-100 ring-rose-400/55'
              }`}
            >
              {aircraft.status}
            </span>
            {demoPill ? (
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset sm:text-[11px] ${demoPill.chip}`}
                title={demo.detail}
              >
                {demoPill.label}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm">
          <span
            className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-medium ring-1 ring-inset ${urgencyUi.chip}`}
          >
            Due {aircraft.dueMmYy ?? '—'} · {formatDaysLabel(days)}
          </span>
          <span className="font-medium text-slate-100">
            Hrs {aircraft.hoursSinceAnnual != null ? aircraft.hoursSinceAnnual : '—'}
          </span>
        </div>

        {aircraft.status === 'Down' ? (
          <p className="truncate text-xs text-slate-300 sm:text-sm">
            {aircraft.reasonGrounded || <span className="text-amber-300">Needs reason</span>}
          </p>
        ) : null}

        {adminMode ? (
          <div className="mt-auto space-y-2 border-t border-white/5 pt-2">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="text-xs font-medium text-sky-300 hover:text-sky-200"
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
                  className="rounded px-2 py-0.5 text-xs text-emerald-300 ring-1 ring-emerald-400/30 hover:bg-emerald-500/10"
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
                  className="rounded px-2 py-0.5 text-xs text-rose-300 ring-1 ring-rose-400/30 hover:bg-rose-500/10"
                >
                  Down
                </button>
              </div>
            </div>

            {editing ? (
              <div className="space-y-1.5 rounded-md bg-black/25 p-2 ring-1 ring-white/10">
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
                      if (
                        next !== aircraft.hoursSinceAnnual &&
                        (next == null || Number.isFinite(next))
                      ) {
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
        ) : null}
      </div>
    </article>
  )
}

function WallAdminMenu({
  adminMode,
  onToggleAdmin,
  onReset,
}: {
  adminMode: boolean
  onToggleAdmin: () => void
  onReset: () => void
}) {
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md px-2 py-1 text-xs text-slate-500 ring-1 ring-white/10 hover:bg-white/5 hover:text-slate-300"
      >
        Admin
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 min-w-[11rem] overflow-hidden rounded-lg border border-white/10 bg-[#12263c] py-1 shadow-xl shadow-black/40"
        >
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
            onClick={() => {
              onToggleAdmin()
              setOpen(false)
            }}
          >
            {adminMode ? 'Exit edit mode' : 'Edit board'}
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
            onClick={() => {
              onReset()
              setOpen(false)
            }}
          >
            Reset seed
          </button>
          <Link
            to="/members"
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            Members home
          </Link>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm text-rose-300 hover:bg-white/5"
            onClick={() => {
              logout()
              setOpen(false)
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function MembersAircraftPage() {
  const { fleet, resetToSeed } = useAircraftFleet()
  const { snapshot } = useClubStatus()
  const [adminMode, setAdminMode] = useState(false)

  const sorted = useMemo(() => sortFleet(fleet), [fleet])

  const sections = useMemo(() => {
    return SECTION_ORDER.map((id) => ({
      id,
      ...SECTION_META[id],
      aircraft: sorted.filter((a) => fleetBoardSection(a) === id),
    })).filter((s) => s.aircraft.length > 0)
  }, [sorted])

  const upCount = fleet.filter((a) => a.status === 'Up').length
  const downCount = fleet.filter((a) => a.status === 'Down').length
  const updated = latestFleetStamp(fleet)

  return (
    <main className="mx-auto flex min-h-dvh max-w-[100rem] flex-col px-3 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5">
      <header className="mb-3 flex shrink-0 items-center justify-between gap-3 sm:mb-4">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-medium uppercase tracking-[0.22em] text-sky-400/75 sm:text-[11px]">
            {snapshot.clubName}
          </p>
          <h1 className="font-display text-2xl leading-tight text-white sm:text-3xl lg:text-4xl">
            Aircraft status
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
            <span className="rounded-md bg-emerald-500/15 px-2 py-1 font-semibold text-emerald-300 ring-1 ring-emerald-400/30 sm:px-2.5">
              {upCount} Up
            </span>
            <span className="rounded-md bg-rose-500/15 px-2 py-1 font-semibold text-rose-300 ring-1 ring-rose-400/30 sm:px-2.5">
              {downCount} Down
            </span>
          </div>
          {updated ? (
            <p className="hidden text-[11px] text-slate-500 md:block">Updated {updated}</p>
          ) : null}
          {adminMode ? (
            <span className="rounded-md bg-sky-500/15 px-2 py-1 text-[11px] font-medium text-sky-200 ring-1 ring-sky-400/30">
              Editing
            </span>
          ) : null}
          <WallAdminMenu
            adminMode={adminMode}
            onToggleAdmin={() => setAdminMode((v) => !v)}
            onReset={resetToSeed}
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:gap-5">
        {sections.map((section) => (
          <section
            key={section.id}
            aria-labelledby={`fleet-section-${section.id}`}
            className="flex min-h-0 flex-col gap-2"
          >
            <div className="flex items-baseline gap-2 border-b border-white/10 pb-1">
              <h2
                id={`fleet-section-${section.id}`}
                className="font-display text-sm uppercase tracking-[0.14em] text-slate-300 sm:text-base"
              >
                {section.title}
              </h2>
              <span className="text-[11px] text-slate-500">{section.aircraft.length}</span>
            </div>
            <div
              className={`grid gap-2 sm:gap-2.5 ${
                section.id === 'tow'
                  ? 'grid-cols-2 md:max-w-3xl'
                  : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}
            >
              {section.aircraft.map((aircraft) => (
                <AircraftCard key={aircraft.id} aircraft={aircraft} adminMode={adminMode} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
