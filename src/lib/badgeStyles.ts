import type { CloseOutReason, DealStage, ExceptionStatus, QualificationStatus, TaskPriority, TaskStatus } from '../types'

export type BadgeTone = 'grey' | 'blue' | 'teal' | 'purple' | 'orange' | 'green' | 'red' | 'yellow'

export const toneClasses: Record<BadgeTone, string> = {
  grey: 'bg-navy-100 text-navy-600',
  blue: 'bg-blue-100 text-blue-700',
  teal: 'bg-teal-100 text-teal-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-hsorange-100 text-hsorange-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-800',
}

export const qualificationStatusTone: Record<QualificationStatus, BadgeTone> = {
  'New – Unreviewed': 'grey',
  'Follow-up Assigned': 'blue',
  'Contact Attempted': 'blue',
  Engaged: 'teal',
  'Technical Fit Confirmed': 'purple',
  'Demo Candidate': 'purple',
  'Deal Created': 'green',
  Nurture: 'yellow',
  'Closed Out': 'grey',
}

export const exceptionStatusTone: Record<ExceptionStatus, BadgeTone> = {
  'No Exception': 'grey',
  'Decision Required': 'orange',
  'Missing Follow-up': 'red',
  Escalated: 'red',
  Resolved: 'green',
}

export const taskStatusTone: Record<TaskStatus, BadgeTone> = {
  'Not started': 'grey',
  Completed: 'green',
}

export const taskPriorityTone: Record<TaskPriority, BadgeTone> = {
  High: 'red',
  Medium: 'yellow',
  Low: 'grey',
}

export const dealStageTone: Record<DealStage, BadgeTone> = {
  'Qualified Instrument Opportunity': 'grey',
  'Technical Discovery': 'blue',
  'Demo Proposed': 'teal',
  'Demo Scheduled': 'purple',
  'Technical Evaluation': 'purple',
  'Commercial Proposal': 'orange',
  'Procurement / Commercial Review': 'orange',
  'Closed Won': 'green',
  'Closed Lost': 'red',
}

export const closeOutReasons: CloseOutReason[] = [
  'No relevant Amperia application',
  'No active development project',
  'Student or academic enquiry',
  'Supplier or vendor',
  'Duplicate contact',
  'Existing opportunity',
  'No response after follow-up',
  'Other',
]

export const dealStages: DealStage[] = [
  'Qualified Instrument Opportunity',
  'Technical Discovery',
  'Demo Proposed',
  'Demo Scheduled',
  'Technical Evaluation',
  'Commercial Proposal',
  'Procurement / Commercial Review',
  'Closed Won',
  'Closed Lost',
]

export const qualificationStatuses: QualificationStatus[] = [
  'New – Unreviewed',
  'Follow-up Assigned',
  'Contact Attempted',
  'Engaged',
  'Technical Fit Confirmed',
  'Demo Candidate',
  'Deal Created',
  'Nurture',
  'Closed Out',
]

export const exceptionStatuses: ExceptionStatus[] = [
  'No Exception',
  'Decision Required',
  'Missing Follow-up',
  'Escalated',
  'Resolved',
]
