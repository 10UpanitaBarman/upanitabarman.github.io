import { useMemo, useState } from 'react'
import type { DealStage } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { FormField, inputClasses, selectClasses } from '../ui/FormField'
import { useApp } from '../../context/AppContext'
import { dealStages } from '../../lib/badgeStyles'
import { daysFromNow } from '../../lib/dates'

function shortConference(conference: string | null): string {
  if (!conference) return 'ESACT 2026'
  return conference.split('–')[0]?.trim() ?? conference
}

export function CreateStandaloneDealModal({ onClose }: { onClose: () => void }) {
  const { contacts, getCompany, createDeal } = useApp()
  const eligibleContacts = useMemo(() => contacts.filter((c) => c.dealIds.length === 0), [contacts])
  const [contactId, setContactId] = useState(eligibleContacts[0]?.id ?? '')
  const contact = contacts.find((c) => c.id === contactId)
  const company = contact ? getCompany(contact.companyId) : undefined

  const [stage, setStage] = useState<DealStage>('Qualified Instrument Opportunity')
  const [value, setValue] = useState(120000)

  if (!contact) {
    return (
      <Modal title="Create deal" onClose={onClose} width="md" footer={<Button variant="secondary" onClick={onClose}>Close</Button>}>
        <p className="text-sm text-navy-500">Every fictional contact already has an associated deal. Reset the demo to try this flow again.</p>
      </Modal>
    )
  }

  const applicationOrTarget = contact.amperiaApplicationArea ?? contact.quantificationTarget ?? 'Amperia Opportunity'
  const conference = contact.mostRecentConference ?? 'ESACT 2026 – Salzburg'
  const name = `${company?.name ?? 'Unknown company'} – ${applicationOrTarget} – ${shortConference(conference)}`

  const handleCreate = () => {
    createDeal(contact.id, {
      name,
      stage,
      owner: contact.owner,
      leadSource: 'Conference/Event',
      sourceConference: conference,
      amperiaApplicationArea: contact.amperiaApplicationArea ?? '',
      quantificationTarget: contact.quantificationTarget ?? '',
      currentMeasurementMethod: contact.currentMeasurementMethod ?? '',
      measurementChallenge: contact.primaryMeasurementChallenge ?? '',
      agreedNextStep: contact.agreedNextStep ?? 'Technical call to confirm evaluation scope',
      nextStepDate: contact.nextStepDate ?? daysFromNow(7),
      firstDemoDate: daysFromNow(14),
      value,
    })
    onClose()
  }

  return (
    <Modal
      title="Create deal"
      subtitle="Select a conference contact to associate with this deal"
      onClose={onClose}
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            Create
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Primary contact" required>
          <select className={selectClasses} value={contactId} onChange={(e) => setContactId(e.target.value)}>
            {eligibleContacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} — {getCompany(c.companyId)?.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Deal name">
          <input className={inputClasses} value={name} disabled />
        </FormField>
        <FormField label="Deal stage">
          <select className={selectClasses} value={stage} onChange={(e) => setStage(e.target.value as DealStage)}>
            {dealStages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Deal owner">
          <input className={inputClasses} value={contact.owner} disabled />
        </FormField>
        <FormField label="Estimated deal value (€)">
          <input type="number" className={inputClasses} value={value} onChange={(e) => setValue(Number(e.target.value))} />
        </FormField>
      </div>
    </Modal>
  )
}
