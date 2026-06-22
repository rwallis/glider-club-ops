import { useState, type FormEvent } from 'react'
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

function FlightRow({
  flight,
  showActions,
}: {
  flight: SignupFlight
  showActions: boolean
}) {
  const { updateFlight, startFlight, endFlight, cancelFlight, removeFlight } = useSignup()

  return (
    <tr className="border-b border-white/5 text-sm">
      <td className="py-3 pr-3 font-medium text-white">{flight.pilotName}</td>
      <td className="py-3 pr-3 text-slate-300">{flight.glider}</td>
      <td className="hidden py-3 pr-3 text-slate-400 sm:table-cell">{flight.instructor || '—'}</td>
      <td className="py-3 pr-3">
        <input
          type="time"
          value={flight.startTime ?? ''}
          disabled={flight.status === 'completed' || flight.status === 'cancelled'}
          onChange={(e) => updateFlight(flight.id, { startTime: e.target.value || null })}
          className="rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white disabled:opacity-50"
        />
      </td>
      <td className="py-3 pr-3">
        <input
          type="time"
          value={flight.endTime ?? ''}
          disabled={flight.status === 'queued' || flight.status === 'cancelled'}
          onChange={(e) => updateFlight(flight.id, { endTime: e.target.value || null })}
          className="rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white disabled:opacity-50"
        />
      </td>
      <td className="py-3 pr-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass(flight.status)}`}
        >
          {statusLabel(flight.status)}
        </span>
      </td>
      <td className="py-3">
        {showActions ? (
          <div className="flex flex-wrap gap-1">
            {flight.status === 'queued' && (
              <button
                type="button"
                onClick={() => startFlight(flight.id)}
                className="rounded bg-sky-600 px-2 py-1 text-xs text-white hover:bg-sky-500"
              >
                Start
              </button>
            )}
            {flight.status === 'flying' && (
              <button
                type="button"
                onClick={() => endFlight(flight.id)}
                className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-500"
              >
                Land
              </button>
            )}
            {(flight.status === 'flying' || flight.status === 'completed') && (
              <button
                type="button"
                onClick={() => cancelFlight(flight.id)}
                className="rounded border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
            )}
            {(flight.status === 'cancelled' || flight.status === 'completed') && (
              <button
                type="button"
                onClick={() => removeFlight(flight.id)}
                className="rounded border border-white/10 px-2 py-1 text-xs text-slate-400 hover:text-white"
              >
                Remove
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => removeFlight(flight.id)}
            className="text-xs text-slate-500 hover:text-white"
          >
            Remove
          </button>
        )}
      </td>
    </tr>
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-sky-400/80">Flight line</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Glider signup sheet</h1>
        <p className="mt-2 text-slate-400">
          Queue flights, record start and end times, then cancel or remove once complete.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
      >
        <h2 className="text-sm font-semibold text-white">Add to queue</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-xs text-slate-400">Pilot name</span>
            <input
              value={pilotName}
              onChange={(e) => setPilotName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              placeholder="Name"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">Glider</span>
            <select
              value={glider}
              onChange={(e) => setGlider(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
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
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              placeholder="CFI name"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-sky-500 py-2 text-sm font-semibold text-white hover:bg-sky-400"
            >
              Add to queue
            </button>
          </div>
        </div>
      </form>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold text-white">Active queue ({activeFlights.length})</h2>
        {activeFlights.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No flights queued.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-2 pr-3">Pilot</th>
                  <th className="pb-2 pr-3">Glider</th>
                  <th className="hidden pb-2 pr-3 sm:table-cell">Instructor</th>
                  <th className="pb-2 pr-3">Start</th>
                  <th className="pb-2 pr-3">End</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeFlights.map((flight) => (
                  <FlightRow key={flight.id} flight={flight} showActions />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {completedFlights.length > 0 && (
        <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-slate-300">
              Completed / cancelled ({completedFlights.length})
            </h2>
            <button
              type="button"
              onClick={clearCompleted}
              className="text-xs text-slate-500 hover:text-white"
            >
              Clear all
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left opacity-80">
              <tbody>
                {completedFlights.map((flight) => (
                  <FlightRow key={flight.id} flight={flight} showActions={false} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
