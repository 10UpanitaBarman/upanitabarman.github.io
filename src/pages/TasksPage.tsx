import { useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/ui/PageHeader'
import { Tabs } from '../components/ui/Tabs'
import { Badge } from '../components/ui/Badge'
import { FilterSelect } from '../components/ui/FilterSelect'
import { EmptyState } from '../components/ui/EmptyState'
import { ContactPreviewPanel } from '../components/contacts/ContactPreviewPanel'
import { OWNERS } from '../data/seedData'
import { taskPriorityTone, taskStatusTone } from '../lib/badgeStyles'
import { isPastDate, todayIso } from '../lib/dates'
import type { CrmTask, TaskQueue } from '../types'

type QueueTab = 'all' | TaskQueue | 'overdue' | 'due-today' | 'upcoming' | 'completed'

const tabs: { key: QueueTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'Conference Follow-up', label: 'Conference Follow-up' },
  { key: 'Conference Deal Decisions', label: 'Conference Deal Decisions' },
  { key: 'Management Review', label: 'Management Review' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'due-today', label: 'Due Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
]

function matchesTab(task: CrmTask, tab: QueueTab): boolean {
  const today = todayIso()
  switch (tab) {
    case 'all':
      return true
    case 'overdue':
      return task.status === 'Not started' && isPastDate(task.dueDate)
    case 'due-today':
      return task.status === 'Not started' && task.dueDate === today
    case 'upcoming':
      return task.status === 'Not started' && task.dueDate > today
    case 'completed':
      return task.status === 'Completed'
    default:
      return task.queue === tab
  }
}

export function TasksPage() {
  const { tasks, getContact, getCompany, completeTask, updateTaskDueDate, updateTaskOwner } = useApp()
  const [tab, setTab] = useState<QueueTab>('all')
  const [queueFilter, setQueueFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [openContactId, setOpenContactId] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      tasks
        .filter((t) => matchesTab(t, tab))
        .filter((t) => !queueFilter || t.queue === queueFilter)
        .filter((t) => !statusFilter || t.status === statusFilter)
        .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1)),
    [tasks, tab, queueFilter, statusFilter],
  )

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Tasks" meta={<span>{tasks.length} records</span>} />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="flex flex-wrap items-center gap-2 border-b border-navy-100 bg-white px-6 py-3">
        <FilterSelect
          label="Queue"
          value={queueFilter}
          options={['Conference Follow-up', 'Conference Deal Decisions', 'Management Review', 'General']}
          onChange={setQueueFilter}
        />
        <FilterSelect label="Status" value={statusFilter} options={['Not started', 'Completed']} onChange={setStatusFilter} />
      </div>

      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No tasks in this queue" description="Try a different tab or clear your filters." />
        ) : (
          <table className="w-full min-w-[1300px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50 text-left text-xs font-semibold text-navy-500">
                <th className="w-10 px-3 py-2" />
                <th className="px-3 py-2">Task title</th>
                <th className="px-3 py-2">Associated contact</th>
                <th className="px-3 py-2">Associated company</th>
                <th className="px-3 py-2">Due date</th>
                <th className="px-3 py-2">Priority</th>
                <th className="px-3 py-2">Task type</th>
                <th className="px-3 py-2">Queue</th>
                <th className="px-3 py-2">Assigned owner</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => {
                const contact = task.contactId ? getContact(task.contactId) : undefined
                const company = task.companyId ? getCompany(task.companyId) : undefined
                const overdue = task.status === 'Not started' && isPastDate(task.dueDate)
                return (
                  <tr key={task.id} className="border-b border-navy-50 hover:bg-navy-50/60 align-top">
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={task.status === 'Completed'}
                        onChange={() => task.status === 'Not started' && completeTask(task.id)}
                        disabled={task.status === 'Completed'}
                        aria-label={`Mark ${task.title} complete`}
                      />
                    </td>
                    <td className="px-3 py-2.5 max-w-xs">
                      <p
                        className={`font-medium ${
                          task.isDecisionTask || task.isTriageTask ? 'text-hsorange-700' : 'text-navy-800'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.notes && <p className="mt-0.5 text-xs text-navy-400">{task.notes}</p>}
                    </td>
                    <td className="px-3 py-2.5">
                      {contact ? (
                        <button
                          type="button"
                          onClick={() => setOpenContactId(contact.id)}
                          className="text-hsteal-600 hover:underline"
                        >
                          {contact.firstName} {contact.lastName}
                        </button>
                      ) : (
                        <span className="text-navy-300">Unlinked</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-navy-600">{company?.name ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      <input
                        type="date"
                        value={task.dueDate}
                        onChange={(e) => updateTaskDueDate(task.id, e.target.value)}
                        className={`rounded border px-1.5 py-1 text-xs ${
                          overdue ? 'border-red-300 text-red-600' : 'border-navy-200 text-navy-600'
                        }`}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge tone={taskPriorityTone[task.priority]}>{task.priority}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-navy-600">{task.type}</td>
                    <td className="px-3 py-2.5 text-navy-600">{task.queue}</td>
                    <td className="px-3 py-2.5">
                      <select
                        value={task.owner}
                        onChange={(e) => updateTaskOwner(task.id, e.target.value)}
                        className="rounded border border-navy-200 px-1.5 py-1 text-xs text-navy-600"
                      >
                        {[...OWNERS, task.owner].filter((o, i, arr) => arr.indexOf(o) === i).map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge tone={taskStatusTone[task.status]}>{task.status}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {openContactId && <ContactPreviewPanel contactId={openContactId} onClose={() => setOpenContactId(null)} />}
    </div>
  )
}
