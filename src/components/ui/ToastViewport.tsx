import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const iconFor = {
  success: <CheckCircle2 size={18} className="text-green-500" />,
  info: <Info size={18} className="text-blue-500" />,
  error: <XCircle size={18} className="text-red-500" />,
}

export function ToastViewport() {
  const { toasts, dismissToast } = useApp()

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-2.5 rounded-md border border-navy-100 bg-white px-4 py-3 shadow-pop animate-[fadeIn_0.15s_ease-out]"
        >
          {iconFor[toast.variant]}
          <div className="flex-1">
            <p className="text-sm font-semibold text-navy-800">{toast.title}</p>
            {toast.description && <p className="mt-0.5 text-xs text-navy-500">{toast.description}</p>}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="text-navy-300 hover:text-navy-600"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
