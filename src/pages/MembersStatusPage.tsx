import { Link } from 'react-router-dom'
import { clubSnapshot } from '../data/clubStatus'
import { CategoryCard } from '../components/CategoryCard'
import { StatusBadge } from '../components/StatusBadge'
import { images } from '../data/images'
import { useAuth } from '../context/AuthContext'

function formatLastUpdated(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function countByStatus() {
  const items = clubSnapshot.categories.flatMap((c) => c.items)
  return {
    total: items.length,
    operational: items.filter((i) => i.status === 'operational').length,
    inUse: items.filter((i) => i.status === 'in-use').length,
    attention: items.filter(
      (i) => i.status === 'maintenance' || i.status === 'unavailable' || i.status === 'caution',
    ).length,
  }
}

export function MembersStatusPage() {
  const { logout } = useAuth()
  const stats = countByStatus()

  return (
    <div className="members-dark min-h-screen">
      <header className="border-b border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-sky-200 hover:text-white">
            <img src={images.logo} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-sky-700" />
            <span className="hidden text-sm font-medium sm:inline">{clubSnapshot.clubName}</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-300 ring-1 ring-sky-400/30">
              Members
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-sky-400/80">
              Equipment status
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Field briefing board
            </h1>
            <p className="mt-2 text-slate-300">{clubSnapshot.fieldName}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={clubSnapshot.flyingDay ? 'operational' : 'caution'} />
            <span className="rounded-full bg-white/5 px-3 py-1.5 text-sm text-slate-400 ring-1 ring-white/10">
              Updated {formatLastUpdated(clubSnapshot.lastUpdated)}
            </span>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Tracked items', value: stats.total },
            { label: 'Ready', value: stats.operational },
            { label: 'In use', value: stats.inUse },
            { label: 'Needs attention', value: stats.attention },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {clubSnapshot.categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  )
}
