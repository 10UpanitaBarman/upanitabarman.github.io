import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock,
  GitBranch,
  History,
  Play,
  Settings,
  Tag,
  UserPlus,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { WorkflowCard, WorkflowConnector } from '../components/workflow/WorkflowCard'
import { TestWorkflowPanel } from '../components/workflow/TestWorkflowPanel'
import { fullName } from '../lib/contactHelpers'

function ConditionLine({ children }: { children: string }) {
  return <p className="rounded bg-navy-50 px-2.5 py-1.5 font-mono text-[11px] leading-relaxed text-navy-600">{children}</p>
}

export function WorkflowBuilderPage() {
  const { workflowId } = useParams()
  const navigate = useNavigate()
  const { tasks, contacts, addToast } = useApp()
  const [enabled, setEnabled] = useState(true)
  const [showTest, setShowTest] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const enrolledContacts = useMemo(
    () => contacts.filter((c) => c.exceptionStatus !== 'No Exception' && c.mostRecentConference === 'ESACT 2026 – Salzburg'),
    [contacts],
  )

  const decisionTaskCount = tasks.filter((t) => t.isDecisionTask).length

  const addStub = () =>
    addToast({ title: 'Add workflow action', description: 'Adding new steps is not available in this fictional prototype.', variant: 'info' })

  return (
    <div className="flex h-full flex-col bg-navy-50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/workflows')}
            className="rounded p-1.5 text-navy-400 hover:bg-navy-100"
            aria-label="Back to workflows"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-navy-800">Conference Follow-up – Open Task Without Deal</h1>
              <Badge tone="blue">Contact-based workflow</Badge>
            </div>
            <p className="text-xs text-navy-400">Workflow ID: {workflowId} · {decisionTaskCount} decision tasks created to date</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-hsteal-600 hover:underline"
          >
            <History size={13} /> Enrolment history
          </button>
          <button
            type="button"
            onClick={() => addToast({ title: 'Settings', description: 'Not available in this fictional prototype.', variant: 'info' })}
            className="flex items-center gap-1.5 text-xs font-semibold text-navy-500 hover:underline"
          >
            <Settings size={13} /> Settings
          </button>
          <Button size="sm" variant="secondary" onClick={() => setShowTest(true)}>
            <Play size={13} /> Test
          </Button>
          <button
            type="button"
            onClick={() => setEnabled((v) => !v)}
            className={`flex items-center gap-2 rounded-full border px-1 py-1 ${enabled ? 'border-green-300 bg-green-50' : 'border-navy-200 bg-navy-100'}`}
            aria-label="Toggle workflow on or off"
          >
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${enabled ? 'text-green-700' : 'text-navy-400'}`}>
              {enabled ? 'On' : 'Off'}
            </span>
            <span className={`h-4 w-8 rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-navy-300'} relative`}>
              <span
                className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${enabled ? 'left-4' : 'left-0.5'}`}
              />
            </span>
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => addToast({ title: 'Workflow published', description: 'Conference Follow-up – Open Task Without Deal is live.', variant: 'success' })}
          >
            Review and publish
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto flex w-fit flex-col items-center">
          <WorkflowCard icon={UserPlus} iconTone="bg-hsteal-500" title="Trigger enrolment for contacts">
            <div className="flex flex-col gap-1.5">
              <ConditionLine>Most recent conference is known</ConditionLine>
              <p className="text-center text-[10px] font-bold uppercase text-navy-300">and</p>
              <ConditionLine>Associated task status is Not started</ConditionLine>
              <p className="text-center text-[10px] font-bold uppercase text-navy-300">and</p>
              <ConditionLine>Associated task queue is Conference Follow-up</ConditionLine>
              <p className="text-center text-[10px] font-bold uppercase text-navy-300">and</p>
              <ConditionLine>Number of associated deals is equal to 0</ConditionLine>
              <p className="text-center text-[10px] font-bold uppercase text-navy-300">and</p>
              <ConditionLine>Conference qualification status is not Nurture, Closed Out or Deal Created</ConditionLine>
            </div>
          </WorkflowCard>

          <WorkflowConnector onAdd={addStub} />

          <WorkflowCard icon={Tag} iconTone="bg-purple-500" title="Set property value">
            <ConditionLine>Conference exception status = Decision Required</ConditionLine>
          </WorkflowCard>

          <WorkflowConnector onAdd={addStub} />

          <WorkflowCard icon={CheckCircle2} iconTone="bg-hsorange-500" title="Create task">
            <ConditionLine>DECISION REQUIRED – Create Amperia deal or close out</ConditionLine>
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] text-navy-500">
              <span>• Assigned to contact owner</span>
              <span>• High priority</span>
              <span>• Due in two working days</span>
              <span>• Queue: Conference Deal Decisions</span>
            </div>
          </WorkflowCard>

          <WorkflowConnector onAdd={addStub} />

          <WorkflowCard icon={Bell} iconTone="bg-blue-500" title="Send internal notification">
            <ConditionLine>Notify contact owner that a commercial decision is required.</ConditionLine>
          </WorkflowCard>

          <WorkflowConnector onAdd={addStub} />

          <WorkflowCard icon={Clock} iconTone="bg-navy-500" title="Delay">
            <ConditionLine>Wait two working days</ConditionLine>
          </WorkflowCard>

          <WorkflowConnector onAdd={addStub} />

          <WorkflowCard icon={GitBranch} iconTone="bg-teal-500" title="If/then branch">
            <p className="rounded bg-navy-50 px-2.5 py-1.5 text-xs font-semibold text-navy-700">
              Has the contact been resolved?
            </p>
          </WorkflowCard>

          <div className="mt-2 flex flex-col items-center">
            <div className="h-5 w-px bg-navy-200" />
            <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
              <div className="flex flex-col items-center gap-2">
                <Badge tone="green">Branch A · Deal created</Badge>
                <div className="w-[300px] rounded-lg border border-green-200 bg-green-50/50 p-3.5">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-green-700">Condition</p>
                  <ConditionLine>Number of associated deals is greater than 0</ConditionLine>
                  <p className="mb-1.5 mt-3 text-[11px] font-bold uppercase tracking-wide text-green-700">Actions</p>
                  <div className="flex flex-col gap-1.5">
                    <ConditionLine>Qualification status = Deal Created</ConditionLine>
                    <ConditionLine>Exception status = Resolved</ConditionLine>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Badge tone="yellow">Branch B · Nurture or closed out</Badge>
                <div className="w-[300px] rounded-lg border border-yellow-200 bg-yellow-50/50 p-3.5">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-yellow-800">Condition</p>
                  <ConditionLine>Qualification status is Nurture or Closed Out</ConditionLine>
                  <p className="mb-1.5 mt-3 text-[11px] font-bold uppercase tracking-wide text-yellow-800">Action</p>
                  <ConditionLine>Exception status = Resolved</ConditionLine>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Badge tone="red">Branch C · No decision</Badge>
                <div className="w-[300px] rounded-lg border border-red-200 bg-red-50/50 p-3.5">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-red-700">Condition</p>
                  <ConditionLine>No deal and no nurture or close-out decision</ConditionLine>
                  <p className="mb-1.5 mt-3 text-[11px] font-bold uppercase tracking-wide text-red-700">Actions</p>
                  <div className="flex flex-col gap-1.5">
                    <ConditionLine>Exception status = Escalated</ConditionLine>
                    <ConditionLine>Create management-review task</ConditionLine>
                    <ConditionLine>Notify commercial manager</ConditionLine>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTest && <TestWorkflowPanel onClose={() => setShowTest(false)} />}

      {showHistory && (
        <Modal
          title="Enrolment history"
          subtitle={`${enrolledContacts.length} contacts have been enrolled in this workflow`}
          onClose={() => setShowHistory(false)}
          width="lg"
          footer={
            <Button variant="secondary" onClick={() => setShowHistory(false)}>
              Close
            </Button>
          }
        >
          <div className="flex flex-col gap-2">
            {enrolledContacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded border border-navy-100 p-3">
                <div>
                  <p className="text-sm font-semibold text-navy-800">{fullName(c)}</p>
                  <p className="text-xs text-navy-400">Owner: {c.owner}</p>
                </div>
                <Badge tone={c.exceptionStatus === 'Escalated' ? 'red' : c.exceptionStatus === 'Resolved' ? 'green' : 'orange'}>
                  {c.exceptionStatus}
                </Badge>
              </div>
            ))}
            {enrolledContacts.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <AlertTriangle size={20} className="text-navy-300" />
                <p className="text-sm text-navy-400">No contacts have been enrolled yet. Run the workflow demo from the Contacts page.</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
