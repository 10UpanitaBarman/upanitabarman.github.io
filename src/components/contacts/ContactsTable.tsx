import type { Contact, Company, CrmTask, Deal } from '../../types'
import { Badge } from '../ui/Badge'
import { EmptyState } from '../ui/EmptyState'
import { qualificationStatusTone, exceptionStatusTone } from '../../lib/badgeStyles'
import { formatDate } from '../../lib/dates'
import { fullName, nextActivityDateFor, openTasksFor, dealsFor } from '../../lib/contactHelpers'
import { Users } from 'lucide-react'

export interface ColumnVisibility {
  jobTitle: boolean
  owner: boolean
  nextActivity: boolean
  openTasks: boolean
  deals: boolean
}

interface ContactsTableProps {
  contacts: Contact[]
  companies: Company[]
  tasks: CrmTask[]
  deals: Deal[]
  columns: ColumnVisibility
  selected: string[]
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onOpenContact: (id: string) => void
}

export function ContactsTable({
  contacts,
  companies,
  tasks,
  deals,
  columns,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  onOpenContact,
}: ContactsTableProps) {
  if (contacts.length === 0) {
    return <EmptyState icon={Users} title="No contacts match these filters" description="Try adjusting your search or filters, or switch to a different saved view." />
  }

  const companyName = (id: string) => companies.find((c) => c.id === id)?.name ?? '—'

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1400px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-navy-100 bg-navy-50 text-left text-xs font-semibold text-navy-500">
            <th className="w-10 px-3 py-2">
              <input
                type="checkbox"
                checked={selected.length === contacts.length && contacts.length > 0}
                onChange={onToggleSelectAll}
                aria-label="Select all contacts"
              />
            </th>
            <th className="px-3 py-2">Contact name</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Company</th>
            {columns.jobTitle && <th className="px-3 py-2">Job title</th>}
            {columns.owner && <th className="px-3 py-2">Contact owner</th>}
            <th className="px-3 py-2">Most recent conference</th>
            <th className="px-3 py-2">Conference qualification status</th>
            {columns.openTasks && <th className="px-3 py-2">Open tasks</th>}
            {columns.deals && <th className="px-3 py-2">Associated deals</th>}
            {columns.nextActivity && <th className="px-3 py-2">Next activity date</th>}
            <th className="px-3 py-2">Conference exception status</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => {
            const openCount = openTasksFor(contact, tasks).length
            const dealCount = dealsFor(contact, deals).length
            const nextActivity = nextActivityDateFor(contact, tasks, deals)
            return (
              <tr key={contact.id} className="border-b border-navy-50 hover:bg-navy-50/60">
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={selected.includes(contact.id)}
                    onChange={() => onToggleSelect(contact.id)}
                    aria-label={`Select ${fullName(contact)}`}
                  />
                </td>
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => onOpenContact(contact.id)}
                    className="font-semibold text-hsteal-600 hover:underline"
                  >
                    {fullName(contact)}
                  </button>
                  {contact.dataQualityFlag && (
                    <span className="ml-1.5 text-[10px] font-semibold text-hsorange-500">⚠ Data quality</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-navy-500">{contact.email}</td>
                <td className="px-3 py-2.5 text-navy-700">{companyName(contact.companyId)}</td>
                {columns.jobTitle && <td className="px-3 py-2.5 text-navy-500">{contact.jobTitle}</td>}
                {columns.owner && <td className="px-3 py-2.5 text-navy-500">{contact.owner}</td>}
                <td className="px-3 py-2.5 text-navy-500">{contact.mostRecentConference ?? '—'}</td>
                <td className="px-3 py-2.5">
                  <Badge tone={qualificationStatusTone[contact.qualificationStatus]}>{contact.qualificationStatus}</Badge>
                </td>
                {columns.openTasks && <td className="px-3 py-2.5 text-navy-700">{openCount}</td>}
                {columns.deals && <td className="px-3 py-2.5 text-navy-700">{dealCount}</td>}
                {columns.nextActivity && <td className="px-3 py-2.5 text-navy-500">{formatDate(nextActivity)}</td>}
                <td className="px-3 py-2.5">
                  <Badge tone={exceptionStatusTone[contact.exceptionStatus]}>{contact.exceptionStatus}</Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
