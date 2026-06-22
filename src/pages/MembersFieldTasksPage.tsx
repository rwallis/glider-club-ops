import { useState, type FormEvent } from 'react'
import { PilotNameField } from '../components/members/PilotNameField'
import { TASK_CATEGORY_IDS } from '../data/fieldTasks'
import { useClubStatus } from '../context/ClubStatusContext'
import { useFieldTasks } from '../context/FieldTasksContext'
import type { FieldTask, FieldTaskStatus } from '../types'

function taskStatusLabel(status: FieldTaskStatus) {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'assigned':
      return 'Assigned'
    case 'complete':
      return 'Complete'
  }
}

function taskStatusClass(status: FieldTaskStatus) {
  switch (status) {
    case 'pending':
      return 'bg-amber-500/15 text-amber-200 ring-amber-400/30'
    case 'assigned':
      return 'bg-sky-500/15 text-sky-300 ring-sky-400/30'
    case 'complete':
      return 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30'
  }
}

function TaskCard({ task }: { task: FieldTask }) {
  const { setTaskStatus, removeTask } = useFieldTasks()
  const [assignee, setAssignee] = useState(task.assignedMember ?? '')
  const [completer, setCompleter] = useState(task.completedBy ?? task.assignedMember ?? '')

  return (
    <article className="rounded-xl border border-white/10 bg-black/25 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3
            className={`font-medium text-white ${task.status === 'complete' ? 'text-slate-400 line-through' : ''}`}
          >
            {task.title}
          </h3>
          {task.notes && <p className="mt-1 text-sm text-slate-400">{task.notes}</p>}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
            {task.assignedMember && task.status !== 'complete' && (
              <span>Assigned: {task.assignedMember}</span>
            )}
            {task.completedBy && task.status === 'complete' && (
              <span>Completed by: {task.completedBy}</span>
            )}
          </div>
        </div>
        <span
          className={`shrink-0 self-start rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${taskStatusClass(task.status)}`}
        >
          {taskStatusLabel(task.status)}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-white/5 pt-4">
        {task.status === 'pending' && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1">
              <span className="text-xs text-slate-500">Assign member</span>
              <PilotNameField
                id={`assign-${task.id}`}
                value={assignee}
                onChange={setAssignee}
                placeholder="Member name"
              />
            </label>
            <button
              type="button"
              disabled={!assignee.trim()}
              onClick={() => setTaskStatus(task.id, 'assigned', assignee)}
              className="min-h-[44px] rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
            >
              Assign
            </button>
          </div>
        )}

        {task.status === 'assigned' && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1">
              <span className="text-xs text-slate-500">Mark complete (member)</span>
              <PilotNameField
                id={`complete-${task.id}`}
                value={completer}
                onChange={setCompleter}
                placeholder="Who completed this?"
              />
            </label>
            <button
              type="button"
              disabled={!completer.trim()}
              onClick={() => setTaskStatus(task.id, 'complete', completer)}
              className="min-h-[44px] rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              Complete
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
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
    </article>
  )
}

function CategoryTaskSection({ categoryId }: { categoryId: string }) {
  const { categories } = useClubStatus()
  const { tasksByCategory, addTask } = useFieldTasks()
  const category = categories.find((c) => c.id === categoryId)
  const tasks = tasksByCategory(categoryId)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [assignee, setAssignee] = useState('')

  if (!category) return null

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    addTask(categoryId, title, { notes, assignedMember: assignee })
    setTitle('')
    setNotes('')
    setAssignee('')
  }

  const openCount = tasks.filter((t) => t.status !== 'complete').length

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl">
            {category.icon}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">{category.title}</h2>
            <p className="mt-0.5 text-sm text-slate-400">{category.summary}</p>
          </div>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
          {openCount} open · {tasks.length} total
        </span>
      </header>

      {category.notes && (
        <p className="mt-3 rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
          {category.notes}
        </p>
      )}

      <ul className="mt-3 space-y-1 text-xs text-slate-500">
        {category.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-2">
            <span className="text-slate-400">{item.name}</span>
            <span>{item.detail}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-500">No work items for this area yet.</p>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>

      <form onSubmit={handleAdd} className="mt-5 border-t border-white/10 pt-4">
        <p className="text-xs font-medium text-slate-400">Add work item</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="What needs to be done?"
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white sm:col-span-2"
          />
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
          />
          <PilotNameField
            id={`new-${categoryId}`}
            value={assignee}
            onChange={setAssignee}
            placeholder="Assign now (optional)"
          />
        </div>
        <button
          type="submit"
          className="mt-2 min-h-[40px] rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
        >
          Add to {category.title}
        </button>
      </form>
    </section>
  )
}

export function MembersFieldTasksPage() {
  const { tasks } = useFieldTasks()
  const openTotal = tasks.filter((t) => t.status !== 'complete').length
  const assignedTotal = tasks.filter((t) => t.status === 'assigned').length

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-sky-400/80">
          Field maintenance
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Work items by area
        </h1>
        <p className="mt-2 text-sm text-slate-400 sm:text-base">
          Track jobs tied to each briefing board card — assign members, mark complete, and add new
          tasks for the field.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3 sm:max-w-lg">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-2xl font-semibold text-white">{openTotal}</p>
          <p className="text-xs text-slate-500">Open</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-2xl font-semibold text-sky-300">{assignedTotal}</p>
          <p className="text-xs text-slate-500">Assigned</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-2xl font-semibold text-emerald-300">
            {tasks.filter((t) => t.status === 'complete').length}
          </p>
          <p className="text-xs text-slate-500">Done</p>
        </div>
      </div>

      <div className="space-y-6">
        {TASK_CATEGORY_IDS.map((categoryId) => (
          <CategoryTaskSection key={categoryId} categoryId={categoryId} />
        ))}
      </div>
    </div>
  )
}
