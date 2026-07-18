interface BarListProps {
  title: string
  data: { label: string; value: number }[]
  barColor?: string
}

export function BarList({ title, data, barColor = 'bg-hsorange-500' }: BarListProps) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="rounded-md border border-navy-100 bg-white p-4 shadow-card">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-navy-400">{title}</p>
      <div className="flex flex-col gap-2.5">
        {data.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-navy-600">{row.label}</span>
              <span className="font-semibold text-navy-800">{row.value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-100">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${(row.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-xs text-navy-300">No data</p>}
      </div>
    </div>
  )
}
