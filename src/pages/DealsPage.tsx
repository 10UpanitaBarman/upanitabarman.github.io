import { useMemo, useState } from 'react'
import { LayoutGrid, Plus, Settings2, Table2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { FilterSelect } from '../components/ui/FilterSelect'
import { Badge } from '../components/ui/Badge'
import { DealCard } from '../components/deals/DealCard'
import { DealPreviewPanel } from '../components/deals/DealPreviewPanel'
import { CreateStandaloneDealModal } from '../components/deals/CreateStandaloneDealModal'
import { ContactPreviewPanel } from '../components/contacts/ContactPreviewPanel'
import { OWNERS, CONFERENCES } from '../data/seedData'
import { dealStages, dealStageTone } from '../lib/badgeStyles'
import { formatDate } from '../lib/dates'

type ViewMode = 'board' | 'table'

export function DealsPage() {
  const { deals, getCompany, getContact, addToast } = useApp()
  const [mode, setMode] = useState<ViewMode>('board')
  const [owner, setOwner] = useState('')
  const [conference, setConference] = useState('')
  const [openDealId, setOpenDealId] = useState<string | null>(null)
  const [openContactId, setOpenContactId] = useState<string | null>(null)
  const [showCreateDeal, setShowCreateDeal] = useState(false)

  const filtered = useMemo(
    () =>
      deals.filter((d) => {
        if (owner && d.owner !== owner) return false
        if (conference && d.sourceConference !== conference) return false
        return true
      }),
    [deals, owner, conference],
  )

  const byStage = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    dealStages.forEach((stage) => map.set(stage, filtered.filter((d) => d.stage === stage)))
    return map
  }, [filtered])

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Deals"
        meta={<span>{deals.length} records</span>}
        actions={
          <>
            <div className="flex rounded border border-navy-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setMode('board')}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold ${mode === 'board' ? 'bg-navy-100 text-navy-800' : 'text-navy-500'}`}
              >
                <LayoutGrid size={13} /> Board
              </button>
              <button
                type="button"
                onClick={() => setMode('table')}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold ${mode === 'table' ? 'bg-navy-100 text-navy-800' : 'text-navy-500'}`}
              >
                <Table2 size={13} /> Table
              </button>
            </div>
            <Button variant="primary" onClick={() => setShowCreateDeal(true)}>
              <Plus size={15} /> Create deal
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 border-b border-navy-100 bg-white px-6 py-3">
        <span className="rounded border border-navy-200 bg-navy-50 px-2.5 py-1.5 text-xs font-semibold text-navy-600">
          Pipeline: Instrument Sales Pipeline
        </span>
        <span className="rounded border border-navy-200 bg-navy-50 px-2.5 py-1.5 text-xs font-semibold text-navy-600">
          View: Conference-Sourced Deals
        </span>
        <FilterSelect label="Deal owner" value={owner} options={[...OWNERS]} onChange={setOwner} />
        <FilterSelect label="Conference" value={conference} options={[...CONFERENCES]} onChange={setConference} />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => addToast({ title: 'Board settings', description: 'Not available in this fictional prototype.', variant: 'info' })}
        >
          <Settings2 size={13} /> Board settings
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {mode === 'board' ? (
          <div className="flex h-full gap-3 overflow-x-auto p-4 scrollbar-thin">
            {dealStages.map((stage) => {
              const stageDeals = byStage.get(stage) ?? []
              const total = stageDeals.reduce((sum, d) => sum + d.value, 0)
              return (
                <div key={stage} className="flex w-72 shrink-0 flex-col rounded-md bg-navy-50">
                  <div className="border-b border-navy-100 px-3 py-2.5">
                    <p className="text-xs font-bold text-navy-700">{stage}</p>
                    <p className="mt-0.5 text-[11px] text-navy-400">
                      {stageDeals.length} deals · €{total.toLocaleString('en-GB')}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2 scrollbar-thin">
                    {stageDeals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} onOpen={() => setOpenDealId(deal.id)} />
                    ))}
                    {stageDeals.length === 0 && <p className="px-2 py-4 text-center text-[11px] text-navy-300">No deals</p>}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <table className="w-full min-w-[1100px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50 text-left text-xs font-semibold text-navy-500">
                <th className="px-6 py-2">Deal name</th>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Stage</th>
                <th className="px-3 py-2">Value</th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Source conference</th>
                <th className="px-3 py-2">Next activity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((deal) => {
                const company = getCompany(deal.companyId)
                const contact = deal.contactId ? getContact(deal.contactId) : undefined
                return (
                  <tr key={deal.id} className="border-b border-navy-50 hover:bg-navy-50/60">
                    <td className="px-6 py-2.5">
                      <button type="button" onClick={() => setOpenDealId(deal.id)} className="font-semibold text-hsteal-600 hover:underline">
                        {deal.name}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-navy-600">{company?.name}</td>
                    <td className="px-3 py-2.5">
                      <Badge tone={dealStageTone[deal.stage]}>{deal.stage}</Badge>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-navy-700">€{deal.value.toLocaleString('en-GB')}</td>
                    <td className="px-3 py-2.5 text-navy-600">{contact ? `${contact.firstName} ${contact.lastName}` : '—'}</td>
                    <td className="px-3 py-2.5 text-navy-600">{deal.owner}</td>
                    <td className="px-3 py-2.5 text-navy-500">{deal.sourceConference}</td>
                    <td className="px-3 py-2.5 text-navy-500">{formatDate(deal.nextActivityDate)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {openDealId && (
        <DealPreviewPanel
          dealId={openDealId}
          onClose={() => setOpenDealId(null)}
          onOpenContact={(contactId) => {
            setOpenDealId(null)
            setOpenContactId(contactId)
          }}
        />
      )}
      {openContactId && <ContactPreviewPanel contactId={openContactId} onClose={() => setOpenContactId(null)} />}
      {showCreateDeal && <CreateStandaloneDealModal onClose={() => setShowCreateDeal(false)} />}
    </div>
  )
}
