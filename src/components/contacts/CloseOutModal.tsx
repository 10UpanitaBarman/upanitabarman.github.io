import { useState } from 'react'
import type { Contact } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { FormField, selectClasses } from '../ui/FormField'
import { useApp } from '../../context/AppContext'
import { closeOutReasons } from '../../lib/badgeStyles'

interface CloseOutModalProps {
  contact: Contact
  onClose: () => void
}

export function CloseOutModal({ contact, onClose }: CloseOutModalProps) {
  const { closeOutContact } = useApp()
  const [reason, setReason] = useState('')

  const handleSave = () => {
    if (!reason) return
    closeOutContact(contact.id, reason)
    onClose()
  }

  return (
    <Modal
      title="Close out contact"
      subtitle={`${contact.firstName} ${contact.lastName}`}
      onClose={onClose}
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!reason}>
            Save
          </Button>
        </>
      }
    >
      <FormField label="Close-out reason" required>
        <select className={selectClasses} value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="" disabled>
            Select a reason…
          </option>
          {closeOutReasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </FormField>
    </Modal>
  )
}
