import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useClubStatus } from '../context/ClubStatusContext'

interface RankedCount {
  name: string
  count: number
}

interface YearHours {
  year: number
  hours: number
}

interface OpsStatsPayload {
  asOf: string
  from: string
  to: string
  source: string
  flightRows: number
  currentYear: number
  flightsByMember: RankedCount[]
  towsByPilot: RankedCount[]
  hoursByYear: YearHours[]
  cached?: boolean
  error?: string
}

function RankList({
  items,
  unit,
  empty,
}: {
  items: RankedCount[]
  unit: string
  empty: string
}) {
  if (!items.length) {
    return <p className="mt-6 text-sm text-slate-500">{empty}</p>
  }

  const max = items[0]?.count || 1

  return (
    <ol className="mt-5 space-y-2.5">
      {items.map((row, index) => (
        <li key={row.name} className="grid grid-cols-[2rem_1fr_auto] items-baseline gap-3">
          <span className="font-display text-lg tabular-nums text-sky-400/70">{index + 1}</span>
          <div className="min-w-0">
            <p className="truncate text-[15px] text-slate-100 sm:text-base">{row.name}</p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-sky-400/50 transition-[width] duration-700 ease-out"
                style={{ width: `${Math.max(6, (row.count / max) * 100)}%` }}
              />
            </div>
          </div>
          <span className="tabular-nums text-sm font-medium text-slate-300">
            {row.count}
            <span className="ml-1 text-[11px] font-normal text-slate-500">{unit}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

export function MembersOpsStatsPage() {
  const { snapshot } = useClubStatus()
  const { logout } = useAuth()
  const [data, setData] = useState<OpsStatsPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load(force = false) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/glidingops-stats${force ? '?force=1' : ''}`)
      const json = (await res.json()) as OpsStatsPayload
      if (!res.ok) throw new Error(json.error || 'Stats unavailable')
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stats unavailable')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(false)
  }, [])

  const maxYearHours = Math.max(1, ...(data?.hoursByYear.map((y) => y.hours) ?? [1]))

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-[100rem] flex-col px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl animate-float-slow" />
        <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-cyan-400/5 blur-3xl animate-float-slower" />
      </div>

      <header className="relative mb-8 flex shrink-0 items-start justify-between gap-4 sm:mb-10">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-sky-400/80">
            {snapshot.clubName}
          </p>
          <h1 className="mt-1 font-display text-3xl text-white sm:text-4xl lg:text-5xl">
            Ops stats
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400 sm:text-base">
            Flight activity from GlidingOps All Flights Report
            {data ? ` · ${data.currentYear} season + five-year hours` : ''}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => void load(true)}
            className="rounded-md px-2.5 py-1.5 text-xs text-slate-300 ring-1 ring-white/10 hover:bg-white/5 disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
          <Link
            to="/members/aircraft"
            className="rounded-md px-2.5 py-1.5 text-xs text-slate-400 ring-1 ring-white/10 hover:bg-white/5 hover:text-slate-200"
          >
            Aircraft
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-md px-2.5 py-1.5 text-xs text-slate-500 hover:bg-white/5 hover:text-slate-300"
          >
            Sign out
          </button>
        </div>
      </header>

      {error ? (
        <p className="relative rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-400/30">
          {error}
        </p>
      ) : null}

      {loading && !data ? (
        <p className="relative mt-16 text-center text-sm text-slate-500">
          Pulling All Flights Report…
        </p>
      ) : null}

      {data ? (
        <div className="relative grid flex-1 gap-10 lg:grid-cols-3 lg:gap-12">
          <section aria-labelledby="stats-flights">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              {data.currentYear}
            </p>
            <h2 id="stats-flights" className="font-display text-2xl text-white sm:text-3xl">
              Flights by member
            </h2>
            <p className="mt-1 text-sm text-slate-500">PIC and P2 seats on timed glider flights</p>
            <RankList
              items={data.flightsByMember}
              unit="fl"
              empty="No timed glider flights this year yet."
            />
          </section>

          <section aria-labelledby="stats-tows">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              {data.currentYear}
            </p>
            <h2 id="stats-tows" className="font-display text-2xl text-white sm:text-3xl">
              Tows by pilot
            </h2>
            <p className="mt-1 text-sm text-slate-500">Aerotows credited to the tow pilot</p>
            <RankList
              items={data.towsByPilot}
              unit="tows"
              empty="No aerotows logged this year yet."
            />
          </section>

          <section aria-labelledby="stats-hours">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              {data.hoursByYear[0]?.year}–{data.hoursByYear.at(-1)?.year}
            </p>
            <h2 id="stats-hours" className="font-display text-2xl text-white sm:text-3xl">
              Glider hours
            </h2>
            <p className="mt-1 text-sm text-slate-500">Total timed glider flight time by year</p>
            <ul className="mt-6 space-y-4">
              {data.hoursByYear.map((row) => (
                <li key={row.year}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-xl text-slate-200">{row.year}</span>
                    <span className="tabular-nums text-lg font-medium text-sky-200">
                      {row.hours.toFixed(1)}
                      <span className="ml-1 text-xs font-normal text-slate-500">hrs</span>
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500/40 to-cyan-300/50 transition-[width] duration-700 ease-out"
                      style={{ width: `${Math.max(4, (row.hours / maxYearHours) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      {data ? (
        <footer className="relative mt-10 border-t border-white/10 pt-4 text-[11px] text-slate-500">
          {data.source} · {data.flightRows} rows
          {data.cached ? ' · cached' : ''} · as of {data.asOf}
        </footer>
      ) : null}
    </main>
  )
}
