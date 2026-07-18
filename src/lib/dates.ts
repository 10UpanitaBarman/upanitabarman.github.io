export function addWorkingDays(isoDate: string, days: number): string {
  const date = new Date(isoDate + 'T00:00:00')
  let remaining = days
  while (remaining > 0) {
    date.setDate(date.getDate() + 1)
    const day = date.getDay()
    if (day !== 0 && day !== 6) {
      remaining -= 1
    }
  }
  return date.toISOString().slice(0, 10)
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function daysAgo(n: number): string {
  const date = new Date()
  date.setDate(date.getDate() - n)
  return date.toISOString().slice(0, 10)
}

export function daysFromNow(n: number): string {
  const date = new Date()
  date.setDate(date.getDate() + n)
  return date.toISOString().slice(0, 10)
}

export function isoDateTimeDaysAgo(n: number, hour = 9, minute = 0): string {
  const date = new Date()
  date.setDate(date.getDate() - n)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

export function formatDate(isoDate: string | null): string {
  if (!isoDate) return '—'
  const date = new Date(isoDate + 'T00:00:00')
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(isoDateTime: string): string {
  const date = new Date(isoDateTime)
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isPastDate(isoDate: string | null): boolean {
  if (!isoDate) return false
  return isoDate < todayIso()
}

export function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso + 'T00:00:00')
  const to = new Date(toIso + 'T00:00:00')
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
}

export function daysSince(isoDate: string): number {
  return daysBetween(isoDate.slice(0, 10), todayIso())
}
