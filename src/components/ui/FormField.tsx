import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, required, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-xs font-semibold text-navy-600">
        {label} {required && <span className="text-hsorange-600">*</span>}
      </label>
      {children}
      {hint && <span className="text-xs text-navy-400">{hint}</span>}
    </div>
  )
}

export const inputClasses =
  'w-full rounded border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-hsorange-500 focus:outline-none focus:ring-1 focus:ring-hsorange-500'

export const selectClasses = inputClasses
export const textareaClasses = `${inputClasses} resize-none`
