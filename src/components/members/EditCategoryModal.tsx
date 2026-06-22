import { useState } from 'react'
import type { CategoryCard as CategoryCardType, StatusItem, StatusLevel } from '../../types'

const STATUS_OPTIONS: StatusLevel[] = [
  'operational',
  'in-use',
  'caution',
  'maintenance',
  'unavailable',
]

interface EditCategoryModalProps {
  category: CategoryCardType
  onSave: (updates: Partial<CategoryCardType>) => void
  onClose: () => void
}

export function EditCategoryModal({ category, onSave, onClose }: EditCategoryModalProps) {
  const [summary, setSummary] = useState(category.summary)
  const [status, setStatus] = useState(category.status)
  const [notes, setNotes] = useState(category.notes ?? '')
  const [items, setItems] = useState<StatusItem[]>(category.items.map((i) => ({ ...i })))

  function updateItem(index: number, field: keyof StatusItem, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )
  }

  function handleSave() {
    onSave({
      summary,
      status,
      notes: notes.trim() || undefined,
      items,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-sky-950 p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">Edit {category.title}</h2>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-400">Summary</span>
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-400">Card status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusLevel)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-400">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            />
          </label>

          <div>
            <span className="text-xs font-medium text-slate-400">Items</span>
            <ul className="mt-2 space-y-3">
              {items.map((item, index) => (
                <li key={item.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    className="w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-sm text-white"
                    placeholder="Name"
                  />
                  <input
                    value={item.detail ?? ''}
                    onChange={(e) => updateItem(index, 'detail', e.target.value)}
                    className="mt-2 w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-slate-300"
                    placeholder="Detail"
                  />
                  <select
                    value={item.status}
                    onChange={(e) => updateItem(index, 'status', e.target.value)}
                    className="mt-2 w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
