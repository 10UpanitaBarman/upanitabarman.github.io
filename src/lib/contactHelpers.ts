import type { Contact, CrmTask, Deal } from '../types'

export function openTasksFor(contact: Contact, tasks: CrmTask[]): CrmTask[] {
  return tasks.filter((t) => t.contactId === contact.id && t.status === 'Not started')
}

export function dealsFor(contact: Contact, deals: Deal[]): Deal[] {
  return deals.filter((d) => d.contactId === contact.id)
}

export function nextActivityDateFor(contact: Contact, tasks: CrmTask[], deals: Deal[]): string | null {
  const dates: string[] = []
  openTasksFor(contact, tasks).forEach((t) => dates.push(t.dueDate))
  dealsFor(contact, deals).forEach((d) => {
    if (d.nextActivityDate) dates.push(d.nextActivityDate)
  })
  if (contact.nextStepDate) dates.push(contact.nextStepDate)
  if (dates.length === 0) return null
  return dates.sort()[0] ?? null
}

export function fullName(contact: Contact): string {
  return `${contact.firstName} ${contact.lastName}`
}

export function initialsOf(contact: Contact): string {
  return `${contact.firstName[0] ?? ''}${contact.lastName[0] ?? ''}`.toUpperCase()
}
