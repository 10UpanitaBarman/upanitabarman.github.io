import { useMemo, useState } from 'react'
import { ChevronDown, Columns3, Plus, SlidersHorizontal } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/ui/PageHeader'
import { Tabs } from '../components/ui/Tabs'
import { Button } from '../components/ui/Button'
import { FilterSelect } from '../components/ui/FilterSelect'
import { Modal } from '../components/ui/Modal'
import { ContactsTable, type ColumnVisibility } from '../components/contacts/ContactsTable'
import { ContactPreviewPanel } from '../components/contacts/ContactPreviewPanel'
import { DataQualityModal } from '../components/contacts/DataQualityModal'
import { RunWorkflowDemoButton } from '../components/workflow/RunWorkflowDemoButton'
import { OWNERS, CONFERENCES } from '../data/seedData'
import { qualificationStatuses, exceptionStatuses } from '../lib/badgeStyles'
import { openTasksFor, dealsFor } from '../lib/contactHelpers'
import type { Contact } from '../types'

type SavedView = 'all' | 'esact2026' | 'decision' | 'missing' | 'escalated' | 'nurture' | 'closed'

const savedViews: { key: SavedView; label: string }[] = [
  { key: 'all', label: 'All contacts' },
  { key: 'esact2026', label: 'ESACT 2026' },
  { key: 'decision', label: 'Decision required' },
  { key: 'missing', label: 'Missing follow-up' },
  { key: 'escalated', label: 'Escalated' },
  { key: 'nurture', label: 'Nurture' },
  { key: 'closed', label: 'Closed out' },
]

function matchesView(contact: Contact, view: SavedView): boolean {
  switch (view) {
    case 'all':
      return true
    case 'esact2026':
      return contact.mostRecentConference === 'ESACT 2026 – Salzburg'
    case 'decision':
      return contact.exceptionStatus === 'Decision Required'
    case 'missing':
      return contact.exceptionStatus === 'Missing Follow-up'
    case 'escalated':
      return contact.exceptionStatus === 'Escalated'
    case 'nurture':
      return contact.qualificationStatus === 'Nurture'
    case 'closed':
      return contact.qualificationStatus === 'Closed Out'
    default:
      return true
  }
}

export function ContactsPage() {
  const { contacts, companies, tasks, deals, addToast } = useApp()
  const [view, setView] = useState<SavedView>('all')
  const [search, setSearch] = useState('')
  const [owner, setOwner] = useState('')
  const [conference, setConference] = useState('')
  const [qualification, setQualification] = useState('')
  const [exception, setException] = useState('')
  const [hasOpenTask, setHasOpenTask] = useState('')
  const [hasDeal, setHasDeal] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [dataQualityOnly, setDataQualityOnly] = useState(false)
  const [showColumnsMenu, setShowColumnsMenu] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [columns, setColumns] = useState<ColumnVisibility>({
    jobTitle: true,
    owner: true,
    nextActivity: true,
    openTasks: true,
    deals: true,
  })
  const [selected, setSelected] = useState<string[]>([])
  const [openContactId, setOpenContactId] = useState<string | null>(null)
  const [showDataQuality, setShowDataQuality] = useState(false)
  const [showCreateContact, setShowCreateContact] = useState(false)

  const filtered = useMemo(() => {
    return contacts.filter((contact) => {
      if (!matchesView(contact, view)) return false
      if (owner && contact.owner !== owner) return false
      if (conference && contact.mostRecentConference !== conference) return false
      if (qualification && contact.qualificationStatus !== qualification) return false
      if (exception && contact.exceptionStatus !== exception) return false
      if (dataQualityOnly && !contact.dataQualityFlag) return false
      if (hasOpenTask) {
        const open = openTasksFor(contact, tasks).length > 0
        if (hasOpenTask === 'yes' && !open) return false
        if (hasOpenTask === 'no' && open) return false
      }
      if (hasDeal) {
        const has = dealsFor(contact, deals).length > 0
        if (hasDeal === 'yes' && !has) return false
        if (hasDeal === 'no' && has) return false
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const company = companies.find((c) => c.id === contact.companyId)
        const haystack = `${contact.firstName} ${contact.lastName} ${contact.email} ${company?.name ?? ''}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [contacts, view, owner, conference, qualification, exception, hasOpenTask, hasDeal, dataQualityOnly, search, tasks, deals, companies])

  const viewCounts = useMemo(
    () => Object.fromEntries(savedViews.map((v) => [v.key, contacts.filter((c) => matchesView(c, v.key)).length])),
    [contacts],
  )

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const toggleSelectAll = () =>
    setSelected((prev) => (prev.length === filtered.length ? [] : filtered.map((c) => c.id)))

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Contacts"
        meta={
          <>
            <span>{contacts.length} records</span>
            <button
              type="button"
              onClick={() => setShowDataQuality(true)}
              className="font-medium text-hsteal-600 hover:underline"
            >
              Data quality
            </button>
          </>
        }
        actions={
          <>
            <RunWorkflowDemoButton />
            <div className="relative">
              <Button variant="secondary" onClick={() => setShowActionsMenu((v) => !v)}>
                Actions <ChevronDown size={14} />
              </Button>
              {showActionsMenu && (
                <div className="absolute right-0 top-10 z-30 w-52 rounded-md border border-navy-100 bg-white py-1 shadow-pop">
                  {['Export contacts', 'Import contacts', 'Merge contacts'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setShowActionsMenu(false)
                        addToast({ title: item, description: 'Not available in this fictional prototype.', variant: 'info' })
                      }}
                      className="block w-full px-3 py-2 text-left text-sm text-navy-600 hover:bg-navy-50"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button variant="primary" onClick={() => setShowCreateContact(true)}>
              <Plus size={15} /> Create contact
            </Button>
          </>
        }
      />

      <Tabs tabs={savedViews.map((v) => ({ key: v.key, label: v.label, count: viewCounts[v.key] }))} active={view} onChange={setView} />

      <div className="flex flex-wrap items-center gap-2 border-b border-navy-100 bg-white px-6 py-3">
        <input
          type="search"
          placeholder="Search contacts"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56 rounded border border-navy-200 px-3 py-1.5 text-xs focus:border-hsorange-500 focus:outline-none focus:ring-1 focus:ring-hsorange-500"
        />
        <FilterSelect label="Contact owner" value={owner} options={[...OWNERS]} onChange={setOwner} />
        <FilterSelect label="Conference" value={conference} options={[...CONFERENCES]} onChange={setConference} />
        <FilterSelect label="Qualification status" value={qualification} options={qualificationStatuses} onChange={setQualification} />
        <FilterSelect label="Exception status" value={exception} options={exceptionStatuses} onChange={setException} />
        <FilterSelect label="Has open task" value={hasOpenTask} options={['yes', 'no']} onChange={setHasOpenTask} />
        <FilterSelect label="Has associated deal" value={hasDeal} options={['yes', 'no']} onChange={setHasDeal} />
        <Button variant={showAdvanced ? 'primary' : 'secondary'} size="sm" onClick={() => setShowAdvanced((v) => !v)}>
          <SlidersHorizontal size={13} /> Advanced filters
        </Button>
        <div className="relative">
          <Button size="sm" variant="secondary" onClick={() => setShowColumnsMenu((v) => !v)}>
            <Columns3 size={13} /> Edit columns
          </Button>
          {showColumnsMenu && (
            <div className="absolute right-0 top-9 z-30 w-52 rounded-md border border-navy-100 bg-white p-2 shadow-pop">
              {(
                [
                  ['jobTitle', 'Job title'],
                  ['owner', 'Contact owner'],
                  ['nextActivity', 'Next activity date'],
                  ['openTasks', 'Open tasks'],
                  ['deals', 'Associated deals'],
                ] as [keyof ColumnVisibility, string][]
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-navy-600 hover:bg-navy-50">
                  <input
                    type="checkbox"
                    checked={columns[key]}
                    onChange={() => setColumns((prev) => ({ ...prev, [key]: !prev[key] }))}
                  />
                  {label}
                </label>
              ))}
            </div>
          )}
        </div>
        {selected.length > 0 && <span className="text-xs font-medium text-navy-500">{selected.length} selected</span>}
      </div>

      {showAdvanced && (
        <div className="flex items-center gap-3 border-b border-navy-100 bg-navy-50 px-6 py-2.5">
          <label className="flex items-center gap-2 text-xs font-medium text-navy-600">
            <input type="checkbox" checked={dataQualityOnly} onChange={(e) => setDataQualityOnly(e.target.checked)} />
            Show data quality issues only
          </label>
          <span className="text-xs text-navy-400">Advanced filters are demo-only and limited to this toggle.</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <ContactsTable
          contacts={filtered}
          companies={companies}
          tasks={tasks}
          deals={deals}
          columns={columns}
          selected={selected}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onOpenContact={setOpenContactId}
        />
      </div>

      {openContactId && <ContactPreviewPanel contactId={openContactId} onClose={() => setOpenContactId(null)} />}
      {showDataQuality && (
        <DataQualityModal
          onClose={() => setShowDataQuality(false)}
          onOpenContact={(id) => {
            setShowDataQuality(false)
            setOpenContactId(id)
          }}
        />
      )}
      {showCreateContact && (
        <Modal title="Create contact" onClose={() => setShowCreateContact(false)} width="md" footer={<Button variant="primary" onClick={() => setShowCreateContact(false)}>Close</Button>}>
          <p className="text-sm text-navy-600">
            Manual contact creation is disabled in this fictional prototype. Conference contacts are imported automatically
            from the ESACT badge scan list — try the saved views above to explore the seeded dataset.
          </p>
        </Modal>
      )}
    </div>
  )
}
