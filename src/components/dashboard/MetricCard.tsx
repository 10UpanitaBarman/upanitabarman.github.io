import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  tone: string
}

export function MetricCard({ label, value, icon: Icon, tone }: MetricCardProps) {
  return (
    <div className="rounded-md border border-navy-100 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-navy-500">{label}</p>
        <span className={`flex h-7 w-7 items-center justify-center rounded ${tone}`}>
          <Icon size={14} className="text-white" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-navy-800">{value}</p>
    </div>
  )
}
