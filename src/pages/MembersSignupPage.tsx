import { useState, type FormEvent } from 'react'
import { PilotNameField } from '../components/members/PilotNameField'
import { CLUB_GLIDERS } from '../data/gliders'
import { useSignup } from '../context/SignupContext'
import type { SignupFlight } from '../types'

function statusLabel(status: SignupFlight['status']) {
  switch (status) {
    case 'queued':
      return 'Queued'
    case 'flying':
      return 'Flying'
    case 'completed':
      return 'Completed'
    case 'cancelled':
      return 'Cancelled'
  }
}

function statusClass(status: SignupFlight['status']) {
  switch (status) {
    case 'queued':
      return 'bg-sky-500/15 text-sky-300 ring-sky-400/30'
    case 'flying':
      return 'bg-amber-500/15 text-amber-200 ring-amber-400/30'
    case 'completed':
      return 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30'
    case 'cancelled':
      return 'bg-slate-500/15 text-slate-400 ring-slate-500/30'
  }
}

function timeInputClass(disabled: boolean) {
  return `min-h-[44px] w-full min-w-0 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-base text-white sm:text-sm ${
    disabled ? 'opacity-50' : ''
  }`
}

function FlightActions({ flight }: { flight: SignupFlight }) {
  const { startFlight, endFlight, cancelFlight, removeFlight } = useSignup()

  return (
    <div className="flex flex-wrap gap-2">
      {flight.status === 'queued' && (
        <button
          type="button"
          onClick={() => startFlight(flight.id)}
          className="min-h-[44px] flex-1 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 sm:flex-none"
        >
          Start
        </button>
      )}
      {flight.status === 'flying' && (
        <button
          type="button"
          onClick={() => endFlight(flight.id)}
          className="min-h-[44px] flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 sm:flex-none"
        >
          Land
        </button>
      )}
      {(flight.status === 'flying' || flight.status === 'completed') && (
        <button
          type="button"
          onClick={() => cancelFlight(flight.id)}
          className="min-h-[44px] rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          Cancel
        </button>
      )}
      {(flight.status === 'cancelled' || flight.status === 'completed') && (
        <button
          type="button"
          onClick={() => removeFlight(flight.id)}
          className="min-h-[44px] rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white"
        >
          Remove
        </button>
      )}
    </div>
  )
}

function FlightCard({
  flight,
  variant,
}: {
  flight: SignupFlight
  variant: 'active' | 'history'
}) {
  const { updateFlight, removeFlight } = useSignup()

  return (
    <article className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-white">{flight.pilotName}</h3>
          <p className="mt-0.5 text-sm text-slate-300">{flight.glider}</p>
          {flight.instructor && (
            <p className="mt-1 text-xs text-slate-500">CFI: {flight.instructor}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClass(flight.status)}`}
        >
          {statusLabel(flight.status)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Start</span>
          <input
            type="time"
            value={flight.startTime ?? ''}
            onChange={(e) => updateFlight(flight.id, { startTime: e.target.value || null })}
            className={`mt-1 ${timeInputClass(false)}`}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">End</span>
          <input
            type="time"
            value={flight.endTime ?? ''}
            onChange={(e) => updateFlight(flight.id, { endTime: e.target.value || null })}
            className={`mt-1 ${timeInputClass(false)}`}
          />
        </label>
      </div>

      {variant === 'active' ? (
        <div className="mt-4">
          <FlightActions flight={flight} />
        </div>
      ) : (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => removeFlight(flight.id)}
            className="min-h-[44px] rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            Remove
          </button>
        </div>
      )}
    </article>
  )
}

function FlightTableRow({ flight, variant }: { flight: SignupFlight; variant: 'active' | 'history' }) {
  const { updateFlight, removeFlight } = useSignup()

  return (
    <tr className="border-b border-white/5 text-sm">
      <td className="py-3 pr-4 font-medium text-white">{flight.pilotName}</td>
      <td className="py-3 pr-4 text-slate-300">{flight.glider}</td>
      <td className="py-3 pr-4 text-slate-400">{flight.instructor || '—'}</td>
      <td className="py-3 pr-4">
        <input
          type="time"
          value={flight.startTime ?? ''}
          onChange={(e) => updateFlight(flight.id, { startTime: e.target.value || null })}
          className={timeInputClass(false)}
        />
      </td>
      <td className="py-3 pr-4">
        <input
          type="time"
          value={flight.endTime ?? ''}
          onChange={(e) => updateFlight(flight.id, { endTime: e.target.value || null })}
          className={timeInputClass(false)}
        />
      </td>
      <td className="py-3 pr-4">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass(flight.status)}`}
        >
          {statusLabel(flight.status)}
        </span>
      </td>
      <td className="py-3">
        {variant === 'active' ? (
          <FlightActions flight={flight} />
        ) : (
          <button
            type="button"
            onClick={() => removeFlight(flight.id)}
            className="min-h-[36px] rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
          >
            Remove
          </button>
        )}
      </td>
    </tr>
  )
}

function FlightList({
  flights,
  variant,
  emptyMessage,
}: {
  flights: SignupFlight[]
  variant: 'active' | 'history'
  emptyMessage: string
}) {
  if (flights.length === 0) {
    return <p className="mt-4 text-sm text-slate-500">{emptyMessage}</p>
  }

  return (
    <>
      <div className="mt-4 space-y-3 lg:hidden">
        {flights.map((flight) => (
          <FlightCard key={flight.id} flight={flight} variant={variant} />
        ))}
      </div>

      <div className="mt-4 hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
              <th className="pb-2 pr-4">Pilot</th>
              <th className="pb-2 pr-4">Glider</th>
              <th className="pb-2 pr-4">Instructor</th>
              <th className="pb-2 pr-4">Start</th>
              <th className="pb-2 pr-4">End</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody className={variant === 'history' ? 'opacity-90' : undefined}>
            {flights.map((flight) => (
              <FlightTableRow key={flight.id} flight={flight} variant={variant} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function MembersSignupPage() {
  const { activeFlights, completedFlights, addFlight, clearCompleted } = useSignup()
  const [pilotName, setPilotName] = useState('')
  const [glider, setGlider] = useState<string>(CLUB_GLIDERS[0])
  const [instructor, setInstructor] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!pilotName.trim()) return
    addFlight(pilotName, glider, instructor)
    setPilotName('')
    setInstructor('')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-sky-400/80">Flight line</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Glider signup sheet
        </h1>
        <p className="mt-2 text-sm text-slate-400 sm:text-base">
          Queue flights, record start and end times, then land or remove once complete.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:mb-8 sm:p-5"
      >
        <h2 className="text-sm font-semibold text-white">Add to queue</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block sm:col-span-2 lg:col-span-1">
            <span className="text-xs text-slate-400">Pilot name</span>
            <PilotNameField
              id="signup-pilot"
              value={pilotName}
              onChange={setPilotName}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">Glider</span>
            <select
              value={glider}
              onChange={(e) => setGlider(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-base text-white sm:text-sm"
            >
              {CLUB_GLIDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">Instructor (optional)</span>
            <input
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-base text-white sm:text-sm"
              placeholder="CFI name"
            />
          </label>
          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <button
              type="submit"
              className="min-h-[48px] w-full rounded-lg bg-sky-500 py-3 text-sm font-semibold text-white hover:bg-sky-400"
            >
              Add to queue
            </button>
          </div>
        </div>
      </form>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-white">Active queue ({activeFlights.length})</h2>
        <FlightList flights={activeFlights} variant="active" emptyMessage="No flights queued." />
      </section>

      {completedFlights.length > 0 && (
        <section className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:mt-6 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-slate-300">
              Completed / cancelled ({completedFlights.length})
            </h2>
            <button
              type="button"
              onClick={clearCompleted}
              className="min-h-[44px] rounded-lg px-3 text-xs text-slate-500 hover:bg-white/5 hover:text-white"
            >
              Clear all
            </button>
          </div>
          <FlightList
            flights={completedFlights}
            variant="history"
            emptyMessage="No completed flights."
          />
        </section>
      )}
    </div>
  )
}
