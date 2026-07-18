import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Company, Contact, CrmTask, Deal, DealStage, WorkflowRunResult } from '../types'
import { companies as seedCompanies, contacts as seedContacts, deals as seedDeals, tasks as seedTasks } from '../data/seedData'
import { todayIso } from '../lib/dates'
import {
  evaluateContactForWorkflow,
  makeActivity,
  makeTaskId,
  managementReviewTaskFor,
  WORKFLOW_CONFERENCE_SCOPE,
} from '../lib/workflowEngine'

const STORAGE_KEY = 'abselion-crm-demo-state-v1'

interface PersistedState {
  contacts: Contact[]
  deals: Deal[]
  tasks: CrmTask[]
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    if (!parsed.contacts || !parsed.deals || !parsed.tasks) return null
    return parsed
  } catch {
    return null
  }
}

function persist(state: PersistedState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable — demo still works in-memory for this session
  }
}

export interface Toast {
  id: string
  title: string
  description?: string
  variant: 'success' | 'info' | 'error'
}

export interface CreateDealInput {
  name: string
  stage: DealStage
  owner: string
  leadSource: string
  sourceConference: string
  amperiaApplicationArea: string
  quantificationTarget: string
  currentMeasurementMethod: string
  measurementChallenge: string
  agreedNextStep: string
  nextStepDate: string | null
  firstDemoDate: string | null
  value: number
}

export interface NurtureInput {
  reason: string
  followUpDate: string
  notes: string
}

interface AppContextValue {
  contacts: Contact[]
  companies: Company[]
  deals: Deal[]
  tasks: CrmTask[]
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
  getCompany: (id: string) => Company | undefined
  getContact: (id: string) => Contact | undefined
  getContactTasks: (contactId: string) => CrmTask[]
  getContactDeals: (contactId: string) => Deal[]
  createDeal: (contactId: string, input: CreateDealInput) => void
  nurtureContact: (contactId: string, input: NurtureInput) => void
  closeOutContact: (contactId: string, reason: string) => void
  completeTask: (taskId: string) => void
  updateTaskDueDate: (taskId: string, dueDate: string) => void
  updateTaskOwner: (taskId: string, owner: string) => void
  changeDealStage: (dealId: string, stage: DealStage) => void
  runWorkflowDemo: () => WorkflowRunResult
  resetDemo: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

function completeOpenTasksForContact(tasks: CrmTask[], contactId: string): CrmTask[] {
  return tasks.map((t) =>
    t.contactId === contactId && t.status === 'Not started' && (t.isDecisionTask || t.queue === 'Conference Follow-up')
      ? { ...t, status: 'Completed', completedAt: new Date().toISOString() }
      : t,
  )
}

export function AppProvider({ children }: { children: ReactNode }) {
  const persisted = loadPersisted()
  const [contacts, setContacts] = useState<Contact[]>(persisted?.contacts ?? seedContacts)
  const [deals, setDeals] = useState<Deal[]>(persisted?.deals ?? seedDeals)
  const [tasks, setTasks] = useState<CrmTask[]>(persisted?.tasks ?? seedTasks)
  const [companies] = useState<Company[]>(seedCompanies)
  const [toasts, setToasts] = useState<Toast[]>([])

  const save = useCallback((next: Partial<PersistedState>) => {
    const merged: PersistedState = {
      contacts: next.contacts ?? contacts,
      deals: next.deals ?? deals,
      tasks: next.tasks ?? tasks,
    }
    persist(merged)
  }, [contacts, deals, tasks])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setToasts((prev) => [...prev, { ...toast, id }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const getCompany = useCallback((id: string) => companies.find((c) => c.id === id), [companies])
  const getContact = useCallback((id: string) => contacts.find((c) => c.id === id), [contacts])
  const getContactTasks = useCallback(
    (contactId: string) => tasks.filter((t) => t.contactId === contactId),
    [tasks],
  )
  const getContactDeals = useCallback(
    (contactId: string) => deals.filter((d) => d.contactId === contactId),
    [deals],
  )

  const createDeal = useCallback(
    (contactId: string, input: CreateDealInput) => {
      const contact = contacts.find((c) => c.id === contactId)
      if (!contact) return
      const dealId = makeTaskId('dl')
      const newDeal: Deal = {
        id: dealId,
        name: input.name,
        pipeline: 'Instrument Sales Pipeline',
        stage: input.stage,
        owner: input.owner,
        companyId: contact.companyId,
        contactId: contact.id,
        value: input.value,
        leadSource: input.leadSource,
        sourceConference: input.sourceConference,
        amperiaApplicationArea: input.amperiaApplicationArea,
        quantificationTarget: input.quantificationTarget,
        currentMeasurementMethod: input.currentMeasurementMethod,
        measurementChallenge: input.measurementChallenge,
        agreedNextStep: input.agreedNextStep,
        nextStepDate: input.nextStepDate,
        firstDemoDate: input.firstDemoDate,
        nextActivityDate: input.nextStepDate,
        createdAt: new Date().toISOString(),
        stageEnteredAt: new Date().toISOString(),
        isFictional: true,
      }

      const nextTasks = completeOpenTasksForContact(tasks, contactId)
      const nextDeals = [...deals, newDeal]
      const nextContacts = contacts.map((c) =>
        c.id === contactId
          ? {
              ...c,
              dealIds: [...c.dealIds, dealId],
              qualificationStatus: 'Deal Created' as const,
              exceptionStatus: 'Resolved' as const,
              activity: [
                ...c.activity,
                makeActivity({
                  type: 'deal',
                  title: 'Deal associated',
                  description: `Created deal "${newDeal.name}".`,
                  actor: input.owner,
                }),
              ],
            }
          : c,
      )

      setTasks(nextTasks)
      setDeals(nextDeals)
      setContacts(nextContacts)
      save({ tasks: nextTasks, deals: nextDeals, contacts: nextContacts })
      addToast({
        title: 'Deal created',
        description: `${newDeal.name} was added to the Instrument Sales Pipeline.`,
        variant: 'success',
      })
    },
    [contacts, deals, tasks, save, addToast],
  )

  const nurtureContact = useCallback(
    (contactId: string, input: NurtureInput) => {
      const contact = contacts.find((c) => c.id === contactId)
      if (!contact) return
      const nurtureTaskId = makeTaskId('tk-nurture')
      const nurtureTask: CrmTask = {
        id: nurtureTaskId,
        title: `Nurture follow-up — ${contact.firstName} ${contact.lastName}`,
        type: 'To-do',
        queue: 'General',
        priority: 'Low',
        status: 'Not started',
        dueDate: input.followUpDate,
        owner: contact.owner,
        contactId: contact.id,
        companyId: contact.companyId,
        createdAt: todayIso(),
        notes: input.notes || input.reason,
      }

      const tasksAfterComplete = completeOpenTasksForContact(tasks, contactId)
      const nextTasks = [...tasksAfterComplete, nurtureTask]
      const nextContacts = contacts.map((c) =>
        c.id === contactId
          ? {
              ...c,
              qualificationStatus: 'Nurture' as const,
              exceptionStatus: 'Resolved' as const,
              taskIds: [...c.taskIds, nurtureTaskId],
              activity: [
                ...c.activity,
                makeActivity({
                  type: 'workflow',
                  title: 'Commercial decision recorded: Nurture',
                  description: `${input.reason}${input.notes ? ` — ${input.notes}` : ''}`,
                  actor: contact.owner,
                }),
              ],
            }
          : c,
      )

      setTasks(nextTasks)
      setContacts(nextContacts)
      save({ tasks: nextTasks, contacts: nextContacts })
      addToast({
        title: 'Contact set to Nurture',
        description: `A future follow-up task was created for ${contact.firstName} ${contact.lastName}.`,
        variant: 'success',
      })
    },
    [contacts, tasks, save, addToast],
  )

  const closeOutContact = useCallback(
    (contactId: string, reason: string) => {
      const contact = contacts.find((c) => c.id === contactId)
      if (!contact) return
      const nextTasks = completeOpenTasksForContact(tasks, contactId)
      const nextContacts = contacts.map((c) =>
        c.id === contactId
          ? {
              ...c,
              qualificationStatus: 'Closed Out' as const,
              exceptionStatus: 'Resolved' as const,
              conferenceCloseOutReason: reason as Contact['conferenceCloseOutReason'],
              activity: [
                ...c.activity,
                makeActivity({
                  type: 'workflow',
                  title: 'Commercial decision recorded: Closed Out',
                  description: `Reason: ${reason}`,
                  actor: contact.owner,
                }),
              ],
            }
          : c,
      )

      setTasks(nextTasks)
      setContacts(nextContacts)
      save({ tasks: nextTasks, contacts: nextContacts })
      addToast({
        title: 'Contact closed out',
        description: `${contact.firstName} ${contact.lastName} was closed out: ${reason}.`,
        variant: 'success',
      })
    },
    [contacts, tasks, save, addToast],
  )

  const completeTask = useCallback(
    (taskId: string) => {
      const nextTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'Completed' as const, completedAt: new Date().toISOString() } : t,
      )
      setTasks(nextTasks)
      save({ tasks: nextTasks })
      addToast({ title: 'Task completed', variant: 'success' })
    },
    [tasks, save, addToast],
  )

  const updateTaskDueDate = useCallback(
    (taskId: string, dueDate: string) => {
      const nextTasks = tasks.map((t) => (t.id === taskId ? { ...t, dueDate } : t))
      setTasks(nextTasks)
      save({ tasks: nextTasks })
      addToast({ title: 'Due date updated', variant: 'info' })
    },
    [tasks, save, addToast],
  )

  const updateTaskOwner = useCallback(
    (taskId: string, owner: string) => {
      const nextTasks = tasks.map((t) => (t.id === taskId ? { ...t, owner } : t))
      setTasks(nextTasks)
      save({ tasks: nextTasks })
      addToast({ title: 'Task owner updated', variant: 'info' })
    },
    [tasks, save, addToast],
  )

  const changeDealStage = useCallback(
    (dealId: string, stage: DealStage) => {
      const nextDeals = deals.map((d) =>
        d.id === dealId ? { ...d, stage, stageEnteredAt: new Date().toISOString() } : d,
      )
      setDeals(nextDeals)
      save({ deals: nextDeals })
      const deal = deals.find((d) => d.id === dealId)
      addToast({
        title: 'Deal stage updated',
        description: deal ? `${deal.name} moved to ${stage}.` : undefined,
        variant: 'success',
      })
    },
    [deals, save, addToast],
  )

  const runWorkflowDemo = useCallback((): WorkflowRunResult => {
    let decisionTasksCreated = 0
    let missingFollowupTasksCreated = 0
    let contactsEscalated = 0
    let contactsSkipped = 0
    const newTasksToAdd: CrmTask[] = []

    const eligibleContacts = contacts.filter((c) => c.mostRecentConference === WORKFLOW_CONFERENCE_SCOPE)

    const nextContacts = contacts.map((contact) => {
      if (contact.mostRecentConference !== WORKFLOW_CONFERENCE_SCOPE) return contact

      const result = evaluateContactForWorkflow(contact, tasks)

      if (result.outcome === 'decision-created') {
        decisionTasksCreated += 1
        newTasksToAdd.push(...result.newTasks)
        return {
          ...contact,
          exceptionStatus: 'Decision Required' as const,
          taskIds: [...contact.taskIds, ...result.newTasks.map((t) => t.id)],
          activity: [
            ...contact.activity,
            makeActivity({
              type: 'workflow',
              title: 'Enrolled in workflow: Conference Follow-up – Open Task Without Deal',
              description: 'Conference exception status set to Decision Required.',
              actor: 'Workflow automation',
            }),
            makeActivity({
              type: 'task',
              title: 'Decision task created',
              description: result.newTasks[0]?.title ?? 'DECISION REQUIRED task created.',
              actor: 'Workflow automation',
            }),
            makeActivity({
              type: 'workflow',
              title: 'Internal notification sent',
              description: `${contact.owner} notified that a commercial decision is required.`,
              actor: 'Workflow automation',
            }),
          ],
        }
      }

      if (result.outcome === 'missing-followup') {
        missingFollowupTasksCreated += 1
        newTasksToAdd.push(...result.newTasks)
        return {
          ...contact,
          exceptionStatus: 'Missing Follow-up' as const,
          taskIds: [...contact.taskIds, ...result.newTasks.map((t) => t.id)],
          activity: [
            ...contact.activity,
            makeActivity({
              type: 'workflow',
              title: 'Data quality check: Missing Follow-up',
              description: result.reason,
              actor: 'Workflow automation',
            }),
          ],
        }
      }

      if (result.outcome === 'escalated') {
        contactsEscalated += 1
        const mgmtTask = managementReviewTaskFor(contact)
        newTasksToAdd.push(mgmtTask)
        return {
          ...contact,
          exceptionStatus: 'Escalated' as const,
          taskIds: [...contact.taskIds, mgmtTask.id],
          activity: [
            ...contact.activity,
            makeActivity({
              type: 'workflow',
              title: 'Escalated — no commercial decision recorded',
              description: result.reason,
              actor: 'Workflow automation',
            }),
            makeActivity({
              type: 'task',
              title: 'Management review task created',
              description: mgmtTask.title,
              actor: 'Workflow automation',
            }),
            makeActivity({
              type: 'workflow',
              title: 'Internal notification sent',
              description: 'Commercial manager notified that this contact requires management review.',
              actor: 'Workflow automation',
            }),
          ],
        }
      }

      contactsSkipped += 1
      return contact
    })

    const nextTasks = [...tasks, ...newTasksToAdd]
    setContacts(nextContacts)
    setTasks(nextTasks)
    save({ contacts: nextContacts, tasks: nextTasks })

    return {
      contactsReviewed: eligibleContacts.length,
      decisionTasksCreated,
      missingFollowupTasksCreated,
      contactsEscalated,
      contactsSkipped,
      timestamp: new Date().toISOString(),
    }
  }, [contacts, tasks, save])

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setContacts(seedContacts)
    setDeals(seedDeals)
    setTasks(seedTasks)
    addToast({ title: 'Demo data reset', description: 'All records restored to the original seeded state.', variant: 'info' })
  }, [addToast])

  const value = useMemo<AppContextValue>(
    () => ({
      contacts,
      companies,
      deals,
      tasks,
      toasts,
      addToast,
      dismissToast,
      getCompany,
      getContact,
      getContactTasks,
      getContactDeals,
      createDeal,
      nurtureContact,
      closeOutContact,
      completeTask,
      updateTaskDueDate,
      updateTaskOwner,
      changeDealStage,
      runWorkflowDemo,
      resetDemo,
    }),
    [
      contacts,
      companies,
      deals,
      tasks,
      toasts,
      addToast,
      dismissToast,
      getCompany,
      getContact,
      getContactTasks,
      getContactDeals,
      createDeal,
      nurtureContact,
      closeOutContact,
      completeTask,
      updateTaskDueDate,
      updateTaskOwner,
      changeDealStage,
      runWorkflowDemo,
      resetDemo,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
