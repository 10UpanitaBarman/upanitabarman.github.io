import { useState } from 'react'
import { Bell, HelpCircle, RotateCcw, Search, Settings, ChevronDown } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export function Topbar() {
  const { resetDemo } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-navy-100 bg-white px-4">
      <div className="flex items-center gap-4">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-hsorange-500 text-sm font-bold text-white">
          A
        </div>
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="search"
            placeholder="Search Abselion CRM"
            className="w-72 rounded border border-navy-200 bg-navy-50 py-1.5 pl-8 pr-3 text-sm text-navy-700 placeholder:text-navy-400 focus:border-hsorange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-hsorange-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="rounded p-2 text-navy-500 hover:bg-navy-100 hover:text-navy-700"
          aria-label="Help"
          title="Help"
        >
          <HelpCircle size={18} />
        </button>
        <button
          type="button"
          className="rounded p-2 text-navy-500 hover:bg-navy-100 hover:text-navy-700"
          aria-label="Settings"
          title="Settings"
        >
          <Settings size={18} />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="rounded p-2 text-navy-500 hover:bg-navy-100 hover:text-navy-700"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={18} />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-11 z-40 w-72 rounded-md border border-navy-100 bg-white p-3 shadow-pop">
              <p className="text-xs font-semibold text-navy-500">Notifications</p>
              <p className="mt-2 text-sm text-navy-600">
                No new notifications. Run the conference follow-up workflow to generate activity.
              </p>
            </div>
          )}
        </div>

        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded p-1 hover:bg-navy-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-xs font-bold text-white">
              UB
            </div>
            <ChevronDown size={14} className="text-navy-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 z-40 w-56 rounded-md border border-navy-100 bg-white py-1 shadow-pop">
              <div className="border-b border-navy-100 px-3 py-2">
                <p className="text-sm font-semibold text-navy-800">Upanita Barman</p>
                <p className="text-xs text-navy-400">Demo user · UB</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetDemo()
                  setMenuOpen(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-navy-600 hover:bg-navy-50"
              >
                <RotateCcw size={14} />
                Reset demo data
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
