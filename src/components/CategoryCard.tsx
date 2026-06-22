import { useState } from 'react'
import type { CategoryCard as CategoryCardType } from '../types'
import { StatusBadge, StatusDot } from './StatusBadge'
import { EditCategoryModal } from './members/EditCategoryModal'

interface CategoryCardProps {
  category: CategoryCardType
  editable?: boolean
  onEdit?: (updates: Partial<CategoryCardType>) => void
}

export function CategoryCard({ category, editable = true, onEdit }: CategoryCardProps) {
  const [editing, setEditing] = useState(false)
  const issueCount = category.items.filter(
    (item) => item.status !== 'operational' && item.status !== 'in-use',
  ).length

  return (
    <>
      <article className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/20 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.06]">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl"
              aria-hidden
            >
              {category.icon}
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">{category.title}</h2>
              <p className="mt-0.5 text-sm text-slate-300">{category.summary}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={category.status} label={category.statusLabel} compact />
            {editable && onEdit && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium text-sky-300 hover:bg-white/5"
              >
                Edit
              </button>
            )}
            {category.id === 'weather' && (
              <span className="rounded-lg border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-500">
                Live
              </span>
            )}
          </div>
        </header>

        <ul className="flex flex-1 flex-col gap-2">
          {category.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-black/20 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <StatusDot status={item.status} />
                <span className="truncate text-sm font-medium text-slate-100">{item.name}</span>
              </div>
              {item.detail && (
                <span className="shrink-0 text-right text-xs text-slate-400">{item.detail}</span>
              )}
            </li>
          ))}
        </ul>

        {category.notes && (
          <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100/90">
            {category.notes}
          </p>
        )}

        {issueCount > 0 && !category.notes && (
          <p className="mt-4 text-xs text-slate-500">
            {issueCount} item{issueCount === 1 ? '' : 's'} need attention
          </p>
        )}
      </article>

      {editing && onEdit && (
        <EditCategoryModal
          category={category}
          onSave={onEdit}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  )
}
