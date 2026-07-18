import { ChevronDown } from 'lucide-react'

interface FilterSelectProps {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  allLabel?: string
}

export function FilterSelect({ label, value, options, onChange, allLabel = 'All' }: FilterSelectProps) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded border border-navy-200 bg-white py-1.5 pl-2.5 pr-7 text-xs font-medium text-navy-600 hover:border-navy-300 focus:border-hsorange-500 focus:outline-none focus:ring-1 focus:ring-hsorange-500"
      >
        <option value="">
          {label}: {allLabel}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-navy-400" />
    </div>
  )
}
