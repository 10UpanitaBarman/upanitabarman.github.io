import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-100 text-navy-400">
        <Icon size={20} />
      </div>
      <p className="text-sm font-semibold text-navy-700">{title}</p>
      {description && <p className="max-w-sm text-xs text-navy-400">{description}</p>}
    </div>
  )
}
