import { AlertTriangle, CheckCircle2, ClipboardList, Users } from 'lucide-react'
import type { WorkflowRunResult } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { formatDateTime } from '../../lib/dates'

interface WorkflowResultsModalProps {
  result: WorkflowRunResult
  onClose: () => void
}

export function WorkflowResultsModal({ result, onClose }: WorkflowResultsModalProps) {
  const rows = [
    { label: 'Contacts reviewed', value: result.contactsReviewed, icon: Users, tone: 'text-navy-600' },
    { label: 'Decision task created', value: result.decisionTasksCreated, icon: ClipboardList, tone: 'text-hsorange-600' },
    {
      label: 'Missing follow-up task created',
      value: result.missingFollowupTasksCreated,
      icon: AlertTriangle,
      tone: 'text-red-600',
    },
    { label: 'Contact escalated', value: result.contactsEscalated, icon: AlertTriangle, tone: 'text-red-600' },
    { label: 'Contacts skipped (already resolved)', value: result.contactsSkipped, icon: CheckCircle2, tone: 'text-green-600' },
  ]

  return (
    <Modal
      title="Workflow run complete"
      subtitle={`Conference Follow-up – Open Task Without Deal · ${formatDateTime(result.timestamp)}`}
      onClose={onClose}
      width="md"
      footer={
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="flex flex-col divide-y divide-navy-100 rounded border border-navy-100">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <row.icon size={16} className={row.tone} />
              <span className="text-sm text-navy-700">{row.label}</span>
            </div>
            <span className="text-sm font-bold text-navy-800">{row.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-navy-400">
        Results are reflected immediately in Contacts, Tasks, the Management Review queue and Dashboard metrics.
      </p>
    </Modal>
  )
}
