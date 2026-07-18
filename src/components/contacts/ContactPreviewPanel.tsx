import { useState } from 'react'
import {
  Building2,
  Calendar,
  CheckSquare,
  Mail,
  MoreHorizontal,
  Phone,
  StickyNote,
  X,
} from 'lucide-react'
import type { ActivityItem, Contact } from '../../types'
import { useApp } from '../../context/AppContext'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Tabs } from '../ui/Tabs'
import { Button } from '../ui/Button'
import { qualificationStatusTone, exceptionStatusTone } from '../../lib/badgeStyles'
import { formatDate, formatDateTime } from '../../lib/dates'
import { fullName } from '../../lib/contactHelpers'
import { CreateDealModal } from './CreateDealModal'
import { NurtureModal } from './NurtureModal'
import { CloseOutModal } from './CloseOutModal'

type ActivityTab = 'Activity' | 'Notes' | 'Emails' | 'Calls' | 'Tasks' | 'Meetings'

const tabTypeMap: Record<ActivityTab, ActivityItem['type'][] | null> = {
  Activity: null,
  Notes: ['note'],
  Emails: ['email'],
  Calls: ['call'],
  Tasks: ['task'],
  Meetings: ['meeting'],
}

const quickActions = [
  { key: 'note', label: 'Note', icon: StickyNote },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'call', label: 'Call', icon: Phone },
  { key: 'task', label: 'Task', icon: CheckSquare },
  { key: 'meeting', label: 'Meeting', icon: Calendar },
  { key: 'more', label: 'More', icon: MoreHorizontal },
]

const aboutFields = (contact: Contact): { label: string; value: string }[] => [
  { label: 'Email', value: contact.email },
  { label: 'Phone', value: contact.phone },
  { label: 'Job title', value: contact.jobTitle },
  { label: 'Contact owner', value: contact.owner },
  { label: 'Lifecycle stage', value: contact.lifecycleStage },
  { label: 'Conference qualification status', value: contact.qualificationStatus },
  { label: 'Most recent conference', value: contact.mostRecentConference ?? '—' },
  { label: 'Conference interaction type', value: contact.conferenceInteractionType ?? '—' },
  { label: 'Amperia application area', value: contact.amperiaApplicationArea ?? '—' },
  { label: 'Quantification target', value: contact.quantificationTarget ?? '—' },
  { label: 'Current measurement method', value: contact.currentMeasurementMethod ?? '—' },
  { label: 'Primary measurement challenge', value: contact.primaryMeasurementChallenge ?? '—' },
  { label: 'Agreed next step', value: contact.agreedNextStep ?? '—' },
  { label: 'Next-step date', value: formatDate(contact.nextStepDate) },
  { label: 'Conference close-out reason', value: contact.conferenceCloseOutReason ?? '—' },
]

const decisionMessages: Record<string, string> = {
  'Decision Required': 'This conference contact has an open follow-up task but no associated deal.',
  'Missing Follow-up': 'No conference follow-up was ever recorded for this contact. Decide how to proceed.',
  Escalated:
    "This contact's decision task is overdue and has been escalated to management. A commercial decision is still required.",
}

interface ContactPreviewPanelProps {
  contactId: string
  onClose: () => void
}

export function ContactPreviewPanel({ contactId, onClose }: ContactPreviewPanelProps) {
  const { getContact, getCompany, getContactTasks, getContactDeals, addToast } = useApp()
  const [tab, setTab] = useState<ActivityTab>('Activity')
  const [showCreateDeal, setShowCreateDeal] = useState(false)
  const [showNurture, setShowNurture] = useState(false)
  const [showCloseOut, setShowCloseOut] = useState(false)

  const contact = getContact(contactId)
  if (!contact) return null

  const company = getCompany(contact.companyId)
  const tasks = getContactTasks(contact.id)
  const deals = getContactDeals(contact.id)
  const openTasks = tasks.filter((t) => t.status === 'Not started')

  const filteredActivity = [...contact.activity]
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .filter((item) => {
      const types = tabTypeMap[tab]
      return types === null || types.includes(item.type)
    })

  const needsDecision = ['Decision Required', 'Missing Follow-up', 'Escalated'].includes(contact.exceptionStatus)

  return (
    <>
      <div className="fixed inset-0 z-40 bg-navy-900/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-40 flex h-full w-full max-w-[560px] flex-col bg-white shadow-panel">
        <div className="flex items-start justify-between border-b border-navy-100 px-6 py-5">
          <div className="flex gap-3.5">
            <Avatar name={fullName(contact)} size="lg" />
            <div>
              <h2 className="text-lg font-bold text-navy-800">{fullName(contact)}</h2>
              <p className="text-sm text-navy-500">
                {contact.jobTitle} · {company?.name}
              </p>
              <p className="text-sm text-navy-400">{contact.email}</p>
              <p className="mt-1 text-xs text-navy-400">Owner: {contact.owner}</p>
              <div className="mt-2 flex gap-1.5">
                <Badge tone={qualificationStatusTone[contact.qualificationStatus]}>{contact.qualificationStatus}</Badge>
                <Badge tone={exceptionStatusTone[contact.exceptionStatus]}>{contact.exceptionStatus}</Badge>
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-navy-400 hover:bg-navy-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-1 border-b border-navy-100 px-6 py-3">
          {quickActions.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() =>
                addToast({
                  title: `${action.label} logged`,
                  description: 'This is a demo-only action — no external system is contacted.',
                  variant: 'info',
                })
              }
              className="flex flex-1 flex-col items-center gap-1 rounded py-1.5 text-navy-500 hover:bg-navy-50 hover:text-hsorange-600"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-navy-200">
                <action.icon size={15} />
              </span>
              <span className="text-[11px] font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {needsDecision && (
            <div className="m-4 rounded-md border border-hsorange-200 bg-hsorange-50 p-4">
              <p className="text-sm font-bold text-hsorange-700">Commercial decision required</p>
              <p className="mt-1 text-xs text-navy-600">
                {decisionMessages[contact.exceptionStatus] ?? 'This contact requires a commercial decision.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="primary" size="sm" onClick={() => setShowCreateDeal(true)}>
                  Create Deal
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowNurture(true)}>
                  Nurture
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowCloseOut(true)}>
                  Close Out
                </Button>
              </div>
            </div>
          )}

          <section className="border-b border-navy-100 px-6 py-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-navy-400">About this contact</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5">
              {aboutFields(contact).map((field) => (
                <div
                  key={field.label}
                  className="group flex items-center justify-between gap-3 rounded px-1.5 py-1 hover:bg-navy-50"
                >
                  <dt className="text-xs text-navy-400">{field.label}</dt>
                  <dd className="truncate text-right text-xs font-medium text-navy-700">{field.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="border-b border-navy-100 px-6 py-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-navy-400">Associations</h3>
            <div className="flex flex-col gap-2">
              <div className="rounded border border-navy-100 p-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-navy-500">
                  <Building2 size={13} /> Associated company
                </p>
                <p className="text-sm font-medium text-navy-800">{company?.name}</p>
                <p className="text-xs text-navy-400">
                  {company?.city}, {company?.country} · {company?.industry}
                </p>
              </div>

              <div className="rounded border border-navy-100 p-3">
                <p className="mb-1.5 text-xs font-semibold text-navy-500">Associated deals ({deals.length})</p>
                {deals.length === 0 && <p className="text-xs text-navy-400">No deals associated with this contact yet.</p>}
                {deals.map((d) => (
                  <div key={d.id} className="flex items-center justify-between border-t border-navy-50 py-1.5 first:border-t-0">
                    <span className="text-xs text-navy-700">{d.name}</span>
                    <Badge tone="purple">{d.stage}</Badge>
                  </div>
                ))}
              </div>

              <div className="rounded border border-navy-100 p-3">
                <p className="mb-1.5 text-xs font-semibold text-navy-500">Open tasks ({openTasks.length})</p>
                {openTasks.length === 0 && <p className="text-xs text-navy-400">No open tasks for this contact.</p>}
                {openTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-2 border-t border-navy-50 py-1.5 first:border-t-0">
                    <span className="text-xs text-navy-700">{t.title}</span>
                    <span className="shrink-0 text-[11px] text-navy-400">{formatDate(t.dueDate)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-6 py-4">
            <Tabs
              tabs={(['Activity', 'Notes', 'Emails', 'Calls', 'Tasks', 'Meetings'] as ActivityTab[]).map((t) => ({
                key: t,
                label: t,
              }))}
              active={tab}
              onChange={setTab}
            />
            <div className="mt-4 flex flex-col gap-4">
              {filteredActivity.length === 0 && <p className="py-6 text-center text-xs text-navy-400">No activity in this category.</p>}
              {filteredActivity.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-hsorange-400" />
                  <div className="flex-1 border-b border-navy-50 pb-3">
                    <p className="text-sm font-medium text-navy-800">{item.title}</p>
                    {item.description && <p className="mt-0.5 text-xs text-navy-500">{item.description}</p>}
                    <p className="mt-1 text-[11px] text-navy-400">
                      {formatDateTime(item.timestamp)} · {item.actor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>

      {showCreateDeal && <CreateDealModal contact={contact} onClose={() => setShowCreateDeal(false)} />}
      {showNurture && <NurtureModal contact={contact} onClose={() => setShowNurture(false)} />}
      {showCloseOut && <CloseOutModal contact={contact} onClose={() => setShowCloseOut(false)} />}
    </>
  )
}
