import type { ActivityItem, Contact, CrmTask, WorkflowTestStep } from '../types'
import { addWorkingDays, isPastDate, todayIso } from './dates'
import { COMMERCIAL_MANAGER } from '../data/seedData'

export const WORKFLOW_CONFERENCE_SCOPE = 'ESACT 2026 – Salzburg'

let activityCounter = 0
export function makeActivity(item: Omit<ActivityItem, 'id' | 'timestamp'>): ActivityItem {
  activityCounter += 1
  return {
    id: `wf-act-${Date.now()}-${activityCounter}`,
    timestamp: new Date().toISOString(),
    ...item,
  }
}

let taskCounter = 0
export function makeTaskId(prefix: string): string {
  taskCounter += 1
  return `${prefix}-${Date.now()}-${taskCounter}`
}

export interface WorkflowOutcome {
  contact: Contact
  newTasks: CrmTask[]
  outcome: 'decision-created' | 'escalated' | 'missing-followup' | 'skipped'
  reason: string
}

const excludedStatuses: Contact['qualificationStatus'][] = ['Nurture', 'Closed Out', 'Deal Created']

/**
 * Evaluates a single contact against the "Conference Follow-up – Open Task
 * Without Deal" workflow. Mirrors the visual workflow builder logic 1:1.
 */
export function evaluateContactForWorkflow(
  contact: Contact,
  allTasks: CrmTask[],
): WorkflowOutcome {
  const linkedTasks = contact.taskIds.map((id) => allTasks.find((t) => t.id === id)).filter((t): t is CrmTask => Boolean(t))

  const openFollowUpTask = linkedTasks.find(
    (t) => t.queue === 'Conference Follow-up' && t.status === 'Not started',
  )
  const openDecisionTask = linkedTasks.find(
    (t) => t.isDecisionTask && t.status === 'Not started',
  )

  const hasDeal = contact.dealIds.length > 0
  const isExcludedStatus = excludedStatuses.includes(contact.qualificationStatus)

  // Already resolved (has a deal, or a final commercial decision was made)
  if (hasDeal || isExcludedStatus) {
    return {
      contact,
      newTasks: [],
      outcome: 'skipped',
      reason: hasDeal
        ? 'Contact already has an associated deal.'
        : `Qualification status "${contact.qualificationStatus}" already reflects a commercial decision.`,
    }
  }

  // Branch: contact already enrolled and awaiting a decision — check for escalation
  if (contact.exceptionStatus === 'Decision Required' && openDecisionTask) {
    const overdue = isPastDate(openDecisionTask.dueDate)
    if (overdue) {
      return {
        contact,
        newTasks: [],
        outcome: 'escalated',
        reason: 'Decision task is overdue by more than two working days with no recorded decision.',
      }
    }
    return {
      contact,
      newTasks: [],
      outcome: 'skipped',
      reason: 'Decision task is still within its two working day window.',
    }
  }

  // Trigger: contact has an open Conference Follow-up task, no deal, and no decision yet
  if (openFollowUpTask && contact.mostRecentConference) {
    const dueDate = addWorkingDays(todayIso(), 2)
    const decisionTask: CrmTask = {
      id: makeTaskId('tk-decision'),
      title: `DECISION REQUIRED – Create Amperia deal or close out: ${contact.firstName} ${contact.lastName}`,
      type: 'To-do',
      queue: 'Conference Deal Decisions',
      priority: 'High',
      status: 'Not started',
      dueDate,
      owner: contact.owner,
      contactId: contact.id,
      companyId: contact.companyId,
      isDecisionTask: true,
      createdAt: todayIso(),
      notes: 'Created automatically by workflow: Conference Follow-up – Open Task Without Deal.',
    }
    return {
      contact,
      newTasks: [decisionTask],
      outcome: 'decision-created',
      reason: 'Open Conference Follow-up task with no associated deal — decision task created.',
    }
  }

  // Data-quality catch: conference contact, never engaged, no task of any kind at all
  if (
    !openFollowUpTask &&
    linkedTasks.length === 0 &&
    contact.mostRecentConference &&
    contact.qualificationStatus === 'New – Unreviewed'
  ) {
    const triageTask: CrmTask = {
      id: makeTaskId('tk-triage'),
      title: `TRIAGE REQUIRED – No conference follow-up recorded: ${contact.firstName} ${contact.lastName}`,
      type: 'To-do',
      queue: 'Conference Follow-up',
      priority: 'Medium',
      status: 'Not started',
      dueDate: addWorkingDays(todayIso(), 2),
      owner: contact.owner,
      contactId: contact.id,
      companyId: contact.companyId,
      isTriageTask: true,
      createdAt: todayIso(),
      notes: 'Created automatically: conference contact has no recorded follow-up task.',
    }
    return {
      contact,
      newTasks: [triageTask],
      outcome: 'missing-followup',
      reason: 'Conference contact has no recorded follow-up task and no deal.',
    }
  }

  return {
    contact,
    newTasks: [],
    outcome: 'skipped',
    reason: 'No workflow condition matched.',
  }
}

export interface WorkflowTestOutcome {
  steps: WorkflowTestStep[]
  enrolled: boolean
  message: string
}

/**
 * Dry-run evaluation used by the "Test workflow" panel. Does not mutate any
 * state — it only reports whether the selected contact would be enrolled.
 */
export function buildTestSteps(contact: Contact, allTasks: CrmTask[]): WorkflowTestOutcome {
  const linkedTasks = contact.taskIds.map((id) => allTasks.find((t) => t.id === id)).filter((t): t is CrmTask => Boolean(t))
  const openFollowUpTask = linkedTasks.find((t) => t.queue === 'Conference Follow-up' && t.status === 'Not started')
  const isExcludedStatus = excludedStatuses.includes(contact.qualificationStatus)

  const conferenceKnown = Boolean(contact.mostRecentConference)
  const hasOpenTask = Boolean(openFollowUpTask)
  const noDeal = contact.dealIds.length === 0
  const enrolled = conferenceKnown && hasOpenTask && noDeal && !isExcludedStatus

  const steps: WorkflowTestStep[] = [
    {
      label: 'Conference identified',
      passed: conferenceKnown,
      detail: conferenceKnown ? `Most recent conference: ${contact.mostRecentConference}` : 'No conference recorded on this contact.',
    },
    {
      label: 'Open follow-up task found',
      passed: hasOpenTask,
      detail: hasOpenTask
        ? `Open Conference Follow-up task: "${openFollowUpTask?.title}"`
        : 'No open Conference Follow-up task found for this contact.',
    },
    {
      label: 'No associated deal found',
      passed: noDeal,
      detail: noDeal ? 'Zero deals associated with this contact.' : `${contact.dealIds.length} deal(s) already associated — enrolment blocked.`,
    },
    {
      label: 'Contact enrolled',
      passed: enrolled,
      detail: enrolled
        ? 'All enrolment conditions met.'
        : isExcludedStatus
          ? `Qualification status "${contact.qualificationStatus}" already reflects a commercial decision — enrolment blocked.`
          : 'Enrolment conditions were not met.',
    },
    {
      label: 'Decision task created',
      passed: enrolled,
      detail: enrolled
        ? 'DECISION REQUIRED task would be created in the Conference Deal Decisions queue.'
        : 'Skipped — contact was not enrolled.',
    },
    {
      label: 'Owner notified',
      passed: enrolled,
      detail: enrolled ? `${contact.owner} would be notified that a commercial decision is required.` : 'Skipped — contact was not enrolled.',
    },
  ]

  return {
    steps,
    enrolled,
    message: enrolled ? 'Contact met the enrolment criteria.' : 'Contact did not meet the enrolment criteria.',
  }
}

export function managementReviewTaskFor(contact: Contact): CrmTask {
  return {
    id: makeTaskId('tk-mgmt'),
    title: `MANAGEMENT REVIEW – No commercial decision recorded: ${contact.firstName} ${contact.lastName}`,
    type: 'To-do',
    queue: 'Management Review',
    priority: 'High',
    status: 'Not started',
    dueDate: addWorkingDays(todayIso(), 1),
    owner: COMMERCIAL_MANAGER,
    contactId: contact.id,
    companyId: contact.companyId,
    createdAt: todayIso(),
    notes: 'Escalated automatically: decision task exceeded its two working day SLA with no recorded outcome.',
  }
}
