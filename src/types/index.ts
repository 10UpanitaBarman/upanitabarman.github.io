export type QualificationStatus =
  | 'New – Unreviewed'
  | 'Follow-up Assigned'
  | 'Contact Attempted'
  | 'Engaged'
  | 'Technical Fit Confirmed'
  | 'Demo Candidate'
  | 'Deal Created'
  | 'Nurture'
  | 'Closed Out'

export type ExceptionStatus =
  | 'No Exception'
  | 'Decision Required'
  | 'Missing Follow-up'
  | 'Escalated'
  | 'Resolved'

export type LifecycleStage =
  | 'Lead'
  | 'Marketing Qualified Lead'
  | 'Sales Qualified Lead'
  | 'Opportunity'
  | 'Customer'

export type CloseOutReason =
  | 'No relevant Amperia application'
  | 'No active development project'
  | 'Student or academic enquiry'
  | 'Supplier or vendor'
  | 'Duplicate contact'
  | 'Existing opportunity'
  | 'No response after follow-up'
  | 'Other'

export interface ActivityItem {
  id: string
  timestamp: string
  type:
    | 'system'
    | 'note'
    | 'email'
    | 'call'
    | 'task'
    | 'meeting'
    | 'deal'
    | 'workflow'
  title: string
  description?: string
  actor: string
}

export interface Contact {
  id: string
  firstName: string
  lastName: string
  jobTitle: string
  companyId: string
  email: string
  phone: string
  owner: string
  lifecycleStage: LifecycleStage
  qualificationStatus: QualificationStatus
  exceptionStatus: ExceptionStatus
  mostRecentConference: string | null
  conferenceInteractionType: string | null
  amperiaApplicationArea: string | null
  quantificationTarget: string | null
  currentMeasurementMethod: string | null
  primaryMeasurementChallenge: string | null
  agreedNextStep: string | null
  nextStepDate: string | null
  conferenceCloseOutReason: CloseOutReason | null
  dealIds: string[]
  taskIds: string[]
  activity: ActivityItem[]
  isFictional: true
  dataQualityFlag?: string
}

export interface Company {
  id: string
  name: string
  industry: string
  city: string
  country: string
  isFictional: true
}

export type DealStage =
  | 'Qualified Instrument Opportunity'
  | 'Technical Discovery'
  | 'Demo Proposed'
  | 'Demo Scheduled'
  | 'Technical Evaluation'
  | 'Commercial Proposal'
  | 'Procurement / Commercial Review'
  | 'Closed Won'
  | 'Closed Lost'

export interface Deal {
  id: string
  name: string
  pipeline: 'Instrument Sales Pipeline'
  stage: DealStage
  owner: string
  companyId: string
  contactId: string | null
  value: number
  leadSource: string
  sourceConference: string
  amperiaApplicationArea: string
  quantificationTarget: string
  currentMeasurementMethod: string
  measurementChallenge: string
  agreedNextStep: string
  nextStepDate: string | null
  firstDemoDate: string | null
  nextActivityDate: string | null
  createdAt: string
  stageEnteredAt: string
  isFictional: true
}

export type TaskType = 'To-do' | 'Email' | 'Call'
export type TaskPriority = 'High' | 'Medium' | 'Low'
export type TaskStatus = 'Not started' | 'Completed'
export type TaskQueue =
  | 'Conference Follow-up'
  | 'Conference Deal Decisions'
  | 'Management Review'
  | 'General'

export interface CrmTask {
  id: string
  title: string
  type: TaskType
  queue: TaskQueue
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  owner: string
  contactId: string | null
  companyId: string | null
  isDecisionTask?: boolean
  isTriageTask?: boolean
  createdAt: string
  completedAt?: string
  notes?: string
}

export interface WorkflowTestStep {
  label: string
  passed: boolean
  detail: string
}

export interface WorkflowRunResult {
  contactsReviewed: number
  decisionTasksCreated: number
  missingFollowupTasksCreated: number
  contactsEscalated: number
  contactsSkipped: number
  timestamp: string
}
