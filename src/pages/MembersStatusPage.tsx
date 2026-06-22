import { CategoryCard } from '../components/CategoryCard'
import { OperationsChecklistCard } from '../components/members/OperationsChecklistCard'
import { StatusBadge } from '../components/StatusBadge'
import { useClubStatus } from '../context/ClubStatusContext'
import { useFieldWeather } from '../hooks/useFieldWeather'
import type { CategoryCard as CategoryCardType } from '../types'

function formatLastUpdated(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function countByStatus(categories: CategoryCardType[]) {
  const items = categories.flatMap((c) => c.items)
  return {
    total: items.length,
    operational: items.filter((i) => i.status === 'operational').length,
    inUse: items.filter((i) => i.status === 'in-use').length,
    attention: items.filter(
      (i) => i.status === 'maintenance' || i.status === 'unavailable' || i.status === 'caution',
    ).length,
  }
}

function mergeWeatherCategory(
  categories: CategoryCardType[],
  weather: ReturnType<typeof useFieldWeather>,
): CategoryCardType[] {
  return categories.map((category) => {
    if (category.id !== 'weather') return category

    if (weather.loading) {
      return {
        ...category,
        summary: 'Loading METAR from nearest station…',
        status: 'caution',
        statusLabel: 'Loading',
        items: category.items.map((item) => ({ ...item, detail: 'Loading…' })),
        notes: undefined,
      }
    }

    if (weather.error || !weather.weather) {
      return {
        ...category,
        summary: 'Forecast unavailable',
        status: 'caution',
        statusLabel: 'Offline',
        notes: weather.error ?? 'Could not reach Aviation Weather. Check connection and retry.',
      }
    }

    return {
      ...category,
      summary: weather.weather.summary,
      status: weather.weather.status,
      statusLabel: weather.weather.statusLabel,
      items: weather.weather.items,
      notes: weather.weather.notes,
    }
  })
}

export function MembersStatusPage() {
  const { snapshot, categories, updateCategory, toggleOpsCheck } = useClubStatus()
  const fieldWeather = useFieldWeather()
  const displayCategories = mergeWeatherCategory(categories, fieldWeather)
  const stats = countByStatus(displayCategories)
  const lastUpdated = fieldWeather.weather?.fetchedAt ?? snapshot.lastUpdated

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-sky-400/80">
            Equipment status
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Field briefing board
          </h1>
          <p className="mt-2 text-slate-300">{snapshot.fieldName}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={snapshot.flyingDay ? 'operational' : 'caution'} />
          <span className="rounded-full bg-white/5 px-3 py-1.5 text-sm text-slate-400 ring-1 ring-white/10">
            Updated {formatLastUpdated(lastUpdated)}
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
        {displayCategories.map((category) =>
          category.id === 'ops' ? (
            <OperationsChecklistCard
              key={category.id}
              category={category}
              onToggleCheck={toggleOpsCheck}
              onEdit={(updates) => updateCategory(category.id, updates)}
            />
          ) : (
            <CategoryCard
              key={category.id}
              category={category}
              editable={category.id !== 'weather'}
              onEdit={(updates) => updateCategory(category.id, updates)}
            />
          ),
        )}
      </div>
    </div>
  )
}
