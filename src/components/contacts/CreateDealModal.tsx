import { useMemo, useState } from 'react'
import type { Contact, DealStage } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { FormField, inputClasses, selectClasses } from '../ui/FormField'
import { useApp } from '../../context/AppContext'
import { OWNERS } from '../../data/seedData'
import { dealStages } from '../../lib/badgeStyles'
import { daysFromNow } from '../../lib/dates'

function shortConference(conference: string | null): string {
  if (!conference) return 'ESACT 2026'
  return conference.split('–')[0]?.trim() ?? conference
}

interface CreateDealModalProps {
  contact: Contact
  onClose: () => void
}

export function CreateDealModal({ contact, onClose }: CreateDealModalProps) {
  const { createDeal, getCompany } = useApp()
  const company = getCompany(contact.companyId)

  const applicationOrTarget = contact.amperiaApplicationArea ?? contact.quantificationTarget ?? 'Amperia Opportunity'
  const defaultConference = contact.mostRecentConference ?? 'ESACT 2026 – Salzburg'

  const defaultName = useMemo(
    () => `${company?.name ?? 'Unknown company'} – ${applicationOrTarget} – ${shortConference(defaultConference)}`,
    [company, applicationOrTarget, defaultConference],
  )

  const [name, setName] = useState(defaultName)
  const [stage, setStage] = useState<DealStage>('Qualified Instrument Opportunity')
  const [owner, setOwner] = useState(contact.owner)
  const [leadSource] = useState('Conference/Event')
  const [sourceConference, setSourceConference] = useState(defaultConference)
  const [applicationArea, setApplicationArea] = useState(contact.amperiaApplicationArea ?? '')
  const [quantificationTarget, setQuantificationTarget] = useState(contact.quantificationTarget ?? '')
  const [currentMethod, setCurrentMethod] = useState(contact.currentMeasurementMethod ?? '')
  const [challenge, setChallenge] = useState(contact.primaryMeasurementChallenge ?? '')
  const [nextStep, setNextStep] = useState(contact.agreedNextStep ?? 'Technical call to confirm evaluation scope')
  const [nextStepDate, setNextStepDate] = useState(contact.nextStepDate ?? daysFromNow(7))
  const [firstDemoDate, setFirstDemoDate] = useState(daysFromNow(14))
  const [value, setValue] = useState(120000)

  const handleCreate = () => {
    createDeal(contact.id, {
      name,
      stage,
      owner,
      leadSource,
      sourceConference,
      amperiaApplicationArea: applicationArea,
      quantificationTarget,
      currentMeasurementMethod: currentMethod,
      measurementChallenge: challenge,
      agreedNextStep: nextStep,
      nextStepDate: nextStepDate || null,
      firstDemoDate: firstDemoDate || null,
      value,
    })
    onClose()
  }

  return (
    <Modal
      title="Create deal"
      subtitle={`${contact.firstName} ${contact.lastName} · ${company?.name ?? ''}`}
      onClose={onClose}
      width="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={!name.trim()}>
            Create
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        <div className="col-span-2">
          <FormField label="Deal name" required>
            <input className={inputClasses} value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
        </div>

        <FormField label="Pipeline">
          <input className={inputClasses} value="Instrument Sales Pipeline" disabled />
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
          <select className={selectClasses} value={owner} onChange={(e) => setOwner(e.target.value)}>
            {OWNERS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Company">
          <input className={inputClasses} value={company?.name ?? ''} disabled />
        </FormField>

        <FormField label="Primary contact">
          <input className={inputClasses} value={`${contact.firstName} ${contact.lastName}`} disabled />
        </FormField>
        <FormField label="Lead source">
          <input className={inputClasses} value={leadSource} disabled />
        </FormField>

        <FormField label="Source conference">
          <input className={inputClasses} value={sourceConference} onChange={(e) => setSourceConference(e.target.value)} />
        </FormField>
        <FormField label="Estimated deal value (€)">
          <input
            type="number"
            className={inputClasses}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
        </FormField>

        <FormField label="Amperia application area">
          <input className={inputClasses} value={applicationArea} onChange={(e) => setApplicationArea(e.target.value)} />
        </FormField>
        <FormField label="Quantification target">
          <input
            className={inputClasses}
            value={quantificationTarget}
            onChange={(e) => setQuantificationTarget(e.target.value)}
          />
        </FormField>

        <FormField label="Current measurement method">
          <input className={inputClasses} value={currentMethod} onChange={(e) => setCurrentMethod(e.target.value)} />
        </FormField>
        <FormField label="Measurement challenge">
          <input className={inputClasses} value={challenge} onChange={(e) => setChallenge(e.target.value)} />
        </FormField>

        <div className="col-span-2">
          <FormField label="Agreed next step">
            <input className={inputClasses} value={nextStep} onChange={(e) => setNextStep(e.target.value)} />
          </FormField>
        </div>

        <FormField label="Next-step date">
          <input
            type="date"
            className={inputClasses}
            value={nextStepDate ?? ''}
            onChange={(e) => setNextStepDate(e.target.value)}
          />
        </FormField>
        <FormField label="First demo date">
          <input
            type="date"
            className={inputClasses}
            value={firstDemoDate ?? ''}
            onChange={(e) => setFirstDemoDate(e.target.value)}
          />
        </FormField>
      </div>
    </Modal>
  )
}
