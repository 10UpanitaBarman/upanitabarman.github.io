import type { ReactNode } from 'react'
import { toneClasses, type BadgeTone } from '../../lib/badgeStyles'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'grey', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold leading-4 whitespace-nowrap ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
