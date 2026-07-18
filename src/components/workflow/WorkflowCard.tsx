import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface WorkflowCardProps {
  icon: LucideIcon
  iconTone: string
  title: string
  children: ReactNode
}

export function WorkflowCard({ icon: Icon, iconTone, title, children }: WorkflowCardProps) {
  return (
    <div className="w-[420px] rounded-lg border border-navy-100 bg-white p-4 shadow-card">
      <div className="mb-2.5 flex items-center gap-2.5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconTone}`}>
          <Icon size={15} className="text-white" />
        </span>
        <p className="text-sm font-bold text-navy-800">{title}</p>
      </div>
      {children}
    </div>
  )
}

export function WorkflowConnector({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="h-5 w-px bg-navy-200" />
      <button
        type="button"
        onClick={onAdd}
        className="flex h-6 w-6 items-center justify-center rounded-full border border-navy-300 bg-white text-navy-400 hover:border-hsorange-400 hover:text-hsorange-500"
        aria-label="Add step"
        title="Add step"
      >
        +
      </button>
      <div className="h-5 w-px bg-navy-200" />
    </div>
  )
}
