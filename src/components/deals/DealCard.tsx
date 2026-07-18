import { ChevronRight } from 'lucide-react'
import type { Deal } from '../../types'
import { useApp } from '../../context/AppContext'
import { dealStages } from '../../lib/badgeStyles'
import { formatDate, daysSince } from '../../lib/dates'
import type { DealStage } from '../../types'

interface DealCardProps {
  deal: Deal
  onOpen: () => void
}

export function DealCard({ deal, onOpen }: DealCardProps) {
  const { getCompany, getContact, changeDealStage } = useApp()
  const company = getCompany(deal.companyId)
  const contact = deal.contactId ? getContact(deal.contactId) : undefined
  const currentIndex = dealStages.indexOf(deal.stage)
  const nextStage = dealStages[currentIndex + 1]

  return (
    <div className="rounded-md border border-navy-100 bg-white p-3 shadow-card hover:border-hsorange-300">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <p className="text-sm font-semibold text-navy-800 leading-snug">{deal.name}</p>
        <p className="mt-0.5 text-xs text-navy-500">{company?.name}</p>
        <p className="mt-1.5 text-sm font-bold text-hsorange-600">€{deal.value.toLocaleString('en-GB')}</p>
        <div className="mt-2 flex flex-col gap-0.5 text-[11px] text-navy-400">
          <span>Contact: {contact ? `${contact.firstName} ${contact.lastName}` : '—'}</span>
          <span>Owner: {deal.owner}</span>
          <span>Source: {deal.sourceConference}</span>
          <span>Application: {deal.amperiaApplicationArea}</span>
          <span>Next activity: {formatDate(deal.nextActivityDate)}</span>
          <span>First demo: {formatDate(deal.firstDemoDate)}</span>
          <span>{daysSince(deal.stageEnteredAt)} days in stage</span>
        </div>
      </button>
      <div className="mt-2.5 flex items-center gap-1.5">
        <select
          value={deal.stage}
          onChange={(e) => changeDealStage(deal.id, e.target.value as DealStage)}
          className="flex-1 rounded border border-navy-200 bg-navy-50 px-1.5 py-1 text-[11px] text-navy-600 focus:border-hsorange-500 focus:outline-none"
          aria-label={`Change stage for ${deal.name}`}
        >
          {dealStages.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {nextStage && (
          <button
            type="button"
            title={`Move to ${nextStage}`}
            onClick={() => changeDealStage(deal.id, nextStage)}
            className="rounded border border-navy-200 p-1 text-navy-500 hover:bg-navy-100"
          >
            <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
