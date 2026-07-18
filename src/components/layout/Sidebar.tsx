import { NavLink } from 'react-router-dom'
import { Building2, Contact2, Gauge, ListChecks, Workflow, HandCoins } from 'lucide-react'

const crmItems = [
  { to: '/contacts', label: 'Contacts', icon: Contact2 },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/deals', label: 'Deals', icon: HandCoins },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
]

const automationItems = [{ to: '/workflows', label: 'Workflows', icon: Workflow }]
const reportingItems = [{ to: '/dashboard', label: 'Dashboards', icon: Gauge }]

function NavSection({
  title,
  items,
}: {
  title: string
  items: { to: string; label: string; icon: typeof Contact2 }[]
}) {
  return (
    <div className="mb-5">
      <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-navy-400">{title}</p>
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-hsorange-50 text-hsorange-700'
                  : 'text-navy-600 hover:bg-navy-100 hover:text-navy-800'
              }`
            }
          >
            <item.icon size={17} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-navy-100 bg-white px-2 py-4">
      <div className="px-3 pb-4">
        <p className="text-[15px] font-bold text-navy-800 leading-tight">Abselion CRM Demo</p>
        <span className="mt-1 inline-flex items-center rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy-500">
          Prototype · Fictional data
        </span>
      </div>
      <NavSection title="CRM" items={crmItems} />
      <NavSection title="Automation" items={automationItems} />
      <NavSection title="Reporting" items={reportingItems} />
    </aside>
  )
}
