import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  meta?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, meta, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 bg-white px-6 py-4">
      <div>
        <h1 className="text-xl font-bold text-navy-800">{title}</h1>
        {meta && <div className="mt-1 flex items-center gap-3 text-sm text-navy-500">{meta}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
