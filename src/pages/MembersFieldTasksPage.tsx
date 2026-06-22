import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PilotNameField } from '../components/members/PilotNameField'
import { TASK_CATEGORY_IDS } from '../data/fieldTasks'
import { useClubStatus } from '../context/ClubStatusContext'
import { useFieldTasks } from '../context/FieldTasksContext'
import type { FieldTask } from '../types'

type StatusFilter = 'open' | 'assigned' | 'done' | 'all'

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'done', label: 'Done' },
  { id: 'all', label: 'All' },
]

function matchesFilter(task: FieldTask, filter: StatusFilter) {
  switch (filter) {
    case 'open':
      return task.status === 'pending'
    case 'assigned':
      return task.status === 'assigned'
    case 'done':
      return task.status === 'complete'
    case 'all':
      return true
  }
}

function memberLine(task: FieldTask) {
  if (task.status === 'complete' && task.completedBy) return `Done · ${task.completedBy}`
  if (task.status === 'assigned' && task.assignedMember) return task.assignedMember
  return null
}

function TaskRow({
  task,
  expanded,
  onToggle,
}: {
  task: FieldTask
  expanded: boolean
  onToggle: () => void
}) {
  const { setTaskStatus, removeTask } = useFieldTasks()
  const [member, setMember] = useState(task.assignedMember ?? task.completedBy ?? '')

  const done = task.status === 'complete'
  const meta = memberLine(task)

  return (
    <li className="border-b border-white/5 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-white/[0.03] sm:px-4"
      >
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            task.status === 'pending'
              ? 'bg-amber-400'
              : task.status === 'assigned'
                ? 'bg-sky-400'
                : 'bg-emerald-400'
          }`}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className={`block text-sm font-medium ${done ? 'text-slate-500 line-through' : 'text-white'}`}>
            {task.title}
          </span>
          {meta && <span className="mt-0.5 block text-xs text-slate-500">{meta}</span>}
          {task.notes && !expanded && (
            <span className="mt-0.5 block truncate text-xs text-slate-600">{task.notes}</span>
          )}
        </span>
        <span className="shrink-0 text-slate-500" aria-hidden>
          {expanded ? '▴' : '▾'}
        </span>
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-white/5 bg-black/20 px-3 py-3 sm:px-4">
          {task.notes && <p className="text-xs leading-relaxed text-slate-400">{task.notes}</p>}

          {task.status !== 'complete' && (
            <label className="block">
              <span className="text-xs text-slate-500">
                {task.status === 'pending' ? 'Assign to' : 'Completed by'}
              </span>
              <PilotNameField
                id={`task-member-${task.id}`}
                value={member}
                onChange={setMember}
                placeholder="Member name"
              />
            </label>
          )}

          <div className="flex flex-wrap gap-2">
            {task.status === 'pending' && (
              <button
                type="button"
                disabled={!member.trim()}
                onClick={() => setTaskStatus(task.id, 'assigned', member)}
                className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
              >
                Assign
              </button>
            )}
            {task.status === 'assigned' && (
              <button
                type="button"
                disabled={!member.trim()}
                onClick={() => setTaskStatus(task.id, 'complete', member)}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                Mark complete
              </button>
            )}
            {task.status !== 'pending' && (
              <button
                type="button"
                onClick={() => setTaskStatus(task.id, 'pending')}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Reopen
              </button>
            )}
            <button
              type="button"
              onClick={() => removeTask(task.id)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-500 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

export function MembersFieldTasksPage() {
  const { categories } = useClubStatus()
  const { tasks, tasksByCategory, addTask } = useFieldTasks()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open')
  const [areaFilter, setAreaFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newCategory, setNewCategory] = useState<string>(TASK_CATEGORY_IDS[0])
  const [newTitle, setNewTitle] = useState('')
  const [newAssignee, setNewAssignee] = useState('')

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  )

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!matchesFilter(task, statusFilter)) return false
      if (areaFilter !== 'all' && task.categoryId !== areaFilter) return false
      return true
    })
  }, [tasks, statusFilter, areaFilter])

  const grouped = useMemo(() => {
    return TASK_CATEGORY_IDS.map((id) => ({
      id,
      category: categoryMap.get(id),
      tasks: filteredTasks.filter((t) => t.categoryId === id),
    })).filter((g) => g.tasks.length > 0)
  }, [filteredTasks, categoryMap])

  const openCount = tasks.filter((t) => t.status !== 'complete').length

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    addTask(newCategory, newTitle, { assignedMember: newAssignee })
    setNewTitle('')
    setNewAssignee('')
    setShowAdd(false)
    setStatusFilter(newAssignee.trim() ? 'assigned' : 'open')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-widest text-sky-400/80">Field work</p>
        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Work items</h1>
        <p className="mt-2 text-sm text-slate-400">
          {openCount} open ·{' '}
          <Link to="/members" className="text-sky-400 hover:text-sky-300">
            View briefing board
          </Link>
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setStatusFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              statusFilter === f.id
                ? 'bg-sky-500/25 text-sky-200 ring-1 ring-sky-400/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-slate-400">
          <span className="shrink-0">Area</span>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          >
            <option value="all">All areas</option>
            {TASK_CATEGORY_IDS.map((id) => {
              const cat = categoryMap.get(id)
              if (!cat) return null
              const count = tasksByCategory(id).filter((t) => matchesFilter(t, statusFilter)).length
              return (
                <option key={id} value={id}>
                  {cat.icon} {cat.title} ({count})
                </option>
              )
            })}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="shrink-0 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
        >
          {showAdd ? 'Cancel' : 'Add task'}
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="mb-5 rounded-xl border border-white/10 bg-white/[0.03] p-4"
        >
          <div className="grid gap-3">
            <label className="block">
              <span className="text-xs text-slate-500">Area</span>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              >
                {TASK_CATEGORY_IDS.map((id) => {
                  const cat = categoryMap.get(id)
                  return cat ? (
                    <option key={id} value={id}>
                      {cat.title}
                    </option>
                  ) : null
                })}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Task</span>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                placeholder="What needs to be done?"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Assign to (optional)</span>
              <PilotNameField
                id="new-task-assignee"
                value={newAssignee}
                onChange={setNewAssignee}
                placeholder="Member name"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-3 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
          >
            Save task
          </button>
        </form>
      )}

      {grouped.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-slate-500">
          No tasks match this filter.
        </p>
      ) : (
        <div className="space-y-5">
          {grouped.map(({ id, category, tasks: groupTasks }) => (
            <section key={id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
              <header className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
                <span aria-hidden>{category?.icon}</span>
                <h2 className="text-sm font-semibold text-slate-200">{category?.title}</h2>
                <span className="ml-auto text-xs text-slate-500">{groupTasks.length}</span>
              </header>
              <ul>
                {groupTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    expanded={expandedId === task.id}
                    onToggle={() => setExpandedId((cur) => (cur === task.id ? null : task.id))}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
