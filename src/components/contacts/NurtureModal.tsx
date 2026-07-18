import { useState } from 'react'
import type { Contact } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { FormField, inputClasses, textareaClasses } from '../ui/FormField'
import { useApp } from '../../context/AppContext'
import { daysFromNow } from '../../lib/dates'

interface NurtureModalProps {
  contact: Contact
  onClose: () => void
}

export function NurtureModal({ contact, onClose }: NurtureModalProps) {
  const { nurtureContact } = useApp()
  const [reason, setReason] = useState('No active purchasing project at this time')
  const [followUpDate, setFollowUpDate] = useState(daysFromNow(90))
  const [notes, setNotes] = useState('')

  const handleSave = () => {
    nurtureContact(contact.id, { reason, followUpDate, notes })
    onClose()
  }

  return (
    <Modal
      title="Nurture contact"
      subtitle={`${contact.firstName} ${contact.lastName}`}
      onClose={onClose}
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!reason.trim() || !followUpDate}>
            Save
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Nurture reason" required>
          <input className={inputClasses} value={reason} onChange={(e) => setReason(e.target.value)} />
        </FormField>
        <FormField label="Future follow-up date" required>
          <input
            type="date"
            className={inputClasses}
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </FormField>
        <FormField label="Notes">
          <textarea
            className={textareaClasses}
            rows={4}
            placeholder="Add context for the next commercial team member who picks this up…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormField>
      </div>
    </Modal>
  )
}
