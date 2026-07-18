import { useMemo } from 'react'
import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardList, HandCoins, Timer, Users, UserX } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/ui/PageHeader'
import { MetricCard } from '../components/dashboard/MetricCard'
import { BarList } from '../components/dashboard/BarList'
import { RunWorkflowDemoButton } from '../components/workflow/RunWorkflowDemoButton'
import { OWNERS, CONFERENCES } from '../data/seedData'
import { qualificationStatuses } from '../lib/badgeStyles'
import { daysBetween } from '../lib/dates'

export function DashboardPage() {
  const { contacts, deals } = useApp()

  const conferenceContacts = useMemo(() => contacts.filter((c) => c.mostRecentConference), [contacts])
  const activeDeals = useMemo(() => deals.filter((d) => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost'), [deals])

  const metrics = [
    { label: 'Total Conference Contacts', value: conferenceContacts.length, icon: Users, tone: 'bg-navy-600' },
    { label: 'Active Conference Deals', value: activeDeals.length, icon: HandCoins, tone: 'bg-hsteal-500' },
    { label: 'Decision Required', value: contacts.filter((c) => c.exceptionStatus === 'Decision Required').length, icon: ClipboardList, tone: 'bg-hsorange-500' },
    { label: 'Missing Follow-up', value: contacts.filter((c) => c.exceptionStatus === 'Missing Follow-up').length, icon: UserX, tone: 'bg-red-500' },
    { label: 'Escalated', value: contacts.filter((c) => c.exceptionStatus === 'Escalated').length, icon: AlertTriangle, tone: 'bg-red-600' },
    { label: 'Demo Scheduled', value: deals.filter((d) => d.stage === 'Demo Scheduled').length, icon: CalendarClock, tone: 'bg-purple-500' },
    { label: 'Nurture', value: contacts.filter((c) => c.qualificationStatus === 'Nurture').length, icon: Timer, tone: 'bg-yellow-500' },
    { label: 'Closed Out', value: contacts.filter((c) => c.qualificationStatus === 'Closed Out').length, icon: CheckCircle2, tone: 'bg-navy-400' },
  ]

  const byQualification = qualificationStatuses.map((status) => ({
    label: status,
    value: contacts.filter((c) => c.qualificationStatus === status).length,
  }))

  const dealStageOrder = [
    'Qualified Instrument Opportunity',
    'Technical Discovery',
    'Demo Proposed',
    'Demo Scheduled',
    'Technical Evaluation',
    'Commercial Proposal',
    'Procurement / Commercial Review',
    'Closed Won',
    'Closed Lost',
  ] as const
  const byStage = dealStageOrder.map((stage) => ({ label: stage, value: deals.filter((d) => d.stage === stage).length }))

  const byConference = CONFERENCES.map((conf) => ({
    label: conf,
    value: contacts.filter((c) => c.mostRecentConference === conf).length,
  }))

  const followUpOutcome = ['No Exception', 'Decision Required', 'Missing Follow-up', 'Escalated', 'Resolved'].map((status) => ({
    label: status,
    value: contacts.filter((c) => c.exceptionStatus === status).length,
  }))

  const byOwner = OWNERS.map((owner) => ({ label: owner, value: contacts.filter((c) => c.owner === owner).length }))

  const avgDaysToFollowUp = useMemo(() => {
    const samples: number[] = []
    conferenceContacts.forEach((c) => {
      const imported = c.activity.find((a) => a.title.startsWith('Contact imported'))
      const firstFollowUp = [...c.activity]
        .filter((a) => a.title === 'Follow-up task created')
        .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))[0]
      if (imported && firstFollowUp) {
        samples.push(daysBetween(imported.timestamp.slice(0, 10), firstFollowUp.timestamp.slice(0, 10)))
      }
    })
    if (samples.length === 0) return 0
    return Math.round((samples.reduce((a, b) => a + b, 0) / samples.length) * 10) / 10
  }, [conferenceContacts])

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Conference Lead Performance"
        meta={
          <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-500">
            Demo data · figures are fictional
          </span>
        }
        actions={<RunWorkflowDemoButton />}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BarList title="Conference contacts by qualification status" data={byQualification} />
          <BarList title="Deals by stage" data={byStage} barColor="bg-hsteal-500" />
          <BarList title="Contacts by conference" data={byConference} barColor="bg-purple-500" />
          <BarList title="Follow-up outcome" data={followUpOutcome} barColor="bg-red-400" />
          <BarList title="Contacts by owner" data={byOwner} barColor="bg-blue-500" />
          <div className="rounded-md border border-navy-100 bg-white p-4 shadow-card">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-navy-400">Average days to first follow-up</p>
            <p className="text-3xl font-bold text-navy-800">{avgDaysToFollowUp} days</p>
            <p className="mt-1 text-xs text-navy-400">Average time between conference import and first follow-up task creation (fictional demo data).</p>
          </div>
        </div>
      </div>
    </div>
  )
}
