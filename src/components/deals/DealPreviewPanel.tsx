import { X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Badge } from '../ui/Badge'
import { dealStageTone, dealStages } from '../../lib/badgeStyles'
import { formatDate, daysSince } from '../../lib/dates'
import type { Deal, DealStage } from '../../types'

interface DealPreviewPanelProps {
  dealId: string
  onClose: () => void
  onOpenContact: (contactId: string) => void
}

const fields = (deal: Deal): { label: string; value: string }[] => [
  { label: 'Deal value', value: `€${deal.value.toLocaleString('en-GB')}` },
  { label: 'Lead source', value: deal.leadSource },
  { label: 'Source conference', value: deal.sourceConference },
  { label: 'Amperia application area', value: deal.amperiaApplicationArea },
  { label: 'Quantification target', value: deal.quantificationTarget },
  { label: 'Current measurement method', value: deal.currentMeasurementMethod },
  { label: 'Measurement challenge', value: deal.measurementChallenge },
  { label: 'Agreed next step', value: deal.agreedNextStep },
  { label: 'Next-step date', value: formatDate(deal.nextStepDate) },
  { label: 'First demo date', value: formatDate(deal.firstDemoDate) },
]

export function DealPreviewPanel({ dealId, onClose, onOpenContact }: DealPreviewPanelProps) {
  const { deals, getCompany, getContact, changeDealStage } = useApp()
  const deal = deals.find((d) => d.id === dealId)
  if (!deal) return null

  const company = getCompany(deal.companyId)
  const contact = deal.contactId ? getContact(deal.contactId) : undefined

  return (
    <>
      <div className="fixed inset-0 z-40 bg-navy-900/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-40 flex h-full w-full max-w-[480px] flex-col bg-white shadow-panel">
        <div className="flex items-start justify-between border-b border-navy-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Instrument Sales Pipeline</p>
            <h2 className="mt-1 text-lg font-bold text-navy-800">{deal.name}</h2>
            <p className="text-sm text-navy-500">{company?.name}</p>
            <div className="mt-2">
              <Badge tone={dealStageTone[deal.stage]}>{deal.stage}</Badge>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-navy-400 hover:bg-navy-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
          <section className="mb-4">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-400">Deal stage</label>
            <select
              value={deal.stage}
              onChange={(e) => changeDealStage(deal.id, e.target.value as DealStage)}
              className="w-full rounded border border-navy-200 bg-white px-3 py-2 text-sm focus:border-hsorange-500 focus:outline-none focus:ring-1 focus:ring-hsorange-500"
            >
              {dealStages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-navy-400">{daysSince(deal.stageEnteredAt)} days in current stage</p>
          </section>

          <section className="mb-4 rounded border border-navy-100 p-3">
            <p className="mb-1.5 text-xs font-semibold text-navy-500">Primary contact</p>
            {contact ? (
              <button type="button" onClick={() => onOpenContact(contact.id)} className="text-sm font-semibold text-hsteal-600 hover:underline">
                {contact.firstName} {contact.lastName}
              </button>
            ) : (
              <p className="text-sm text-navy-400">No contact associated</p>
            )}
            <p className="text-xs text-navy-400">Deal owner: {deal.owner}</p>
          </section>

          <dl className="flex flex-col gap-2.5">
            {fields(deal).map((field) => (
              <div key={field.label} className="flex items-center justify-between gap-3 rounded px-1.5 py-1 hover:bg-navy-50">
                <dt className="text-xs text-navy-400">{field.label}</dt>
                <dd className="truncate text-right text-xs font-medium text-navy-700">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </>
  )
}
