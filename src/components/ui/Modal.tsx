import { type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: 'md' | 'lg' | 'xl'
}

const widthClasses: Record<NonNullable<ModalProps['width']>, string> = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({ title, subtitle, onClose, children, footer, width = 'lg' }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 p-4" role="dialog" aria-modal="true">
      <div className={`flex max-h-[90vh] w-full ${widthClasses[width]} flex-col rounded-lg bg-white shadow-pop`}>
        <div className="flex items-start justify-between border-b border-navy-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-navy-800">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-navy-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-navy-400 hover:bg-navy-100 hover:text-navy-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-navy-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}
