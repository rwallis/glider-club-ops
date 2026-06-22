import { useState } from 'react'
import type { CategoryCard as CategoryCardType } from '../../types'
import { StatusBadge } from '../StatusBadge'
import { EditCategoryModal } from './EditCategoryModal'

interface OperationsChecklistCardProps {
  category: CategoryCardType
  onToggleCheck: (itemId: string, checked: boolean) => void
  onEdit: (updates: Partial<CategoryCardType>) => void
}

export function OperationsChecklistCard({
  category,
  onToggleCheck,
  onEdit,
}: OperationsChecklistCardProps) {
  const [editing, setEditing] = useState(false)
  const checkedCount = category.items.filter((i) => i.checked).length

  return (
    <>
      <article className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/20 backdrop-blur-sm sm:col-span-2 xl:col-span-3">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">
              {category.icon}
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">{category.title}</h2>
              <p className="mt-0.5 text-sm text-slate-300">{category.summary}</p>
              <p className="mt-1 text-xs text-slate-500">
                {checkedCount} of {category.items.length} confirmed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={category.status} compact />
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium text-sky-300 hover:bg-white/5"
            >
              Edit
            </button>
          </div>
        </header>

        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {category.items.map((item) => (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3 transition hover:border-sky-500/30 has-[:checked]:border-emerald-500/40 has-[:checked]:bg-emerald-500/5">
                <input
                  type="checkbox"
                  checked={Boolean(item.checked)}
                  onChange={(e) => onToggleCheck(item.id, e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/40 text-sky-500 focus:ring-sky-500/50"
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-sm font-medium ${item.checked ? 'text-emerald-200 line-through decoration-emerald-400/50' : 'text-slate-100'}`}
                  >
                    {item.name}
                  </span>
                  {item.detail && (
                    <span className="mt-0.5 block text-xs text-slate-400">{item.detail}</span>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>

        {category.notes && (
          <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100/90">
            {category.notes}
          </p>
        )}
      </article>

      {editing && (
        <EditCategoryModal
          category={category}
          onSave={onEdit}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  )
}
