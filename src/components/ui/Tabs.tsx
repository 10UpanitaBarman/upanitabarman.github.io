interface TabsProps<T extends string> {
  tabs: { key: T; label: string; count?: number }[]
  active: T
  onChange: (key: T) => void
}

export function Tabs<T extends string>({ tabs, active, onChange }: TabsProps<T>) {
  return (
    <div className="flex items-center gap-1 border-b border-navy-100 px-1 overflow-x-auto scrollbar-thin">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
            active === tab.key
              ? 'border-hsorange-500 text-navy-800'
              : 'border-transparent text-navy-500 hover:text-navy-700'
          }`}
        >
          {tab.label}
          {typeof tab.count === 'number' && (
            <span className={`ml-1.5 text-xs ${active === tab.key ? 'text-navy-500' : 'text-navy-400'}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
