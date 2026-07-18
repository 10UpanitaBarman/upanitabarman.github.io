import { AlertOctagon } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useApp } from '../../context/AppContext'
import { fullName } from '../../lib/contactHelpers'

interface DataQualityModalProps {
  onClose: () => void
  onOpenContact: (contactId: string) => void
}

export function DataQualityModal({ onClose, onOpenContact }: DataQualityModalProps) {
  const { contacts } = useApp()
  const flagged = contacts.filter((c) => c.dataQualityFlag)

  return (
    <Modal
      title="Data quality"
      subtitle={`${flagged.length} record${flagged.length === 1 ? '' : 's'} need attention`}
      onClose={onClose}
      width="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        {flagged.map((c) => (
          <div key={c.id} className="flex items-start gap-3 rounded border border-navy-100 bg-navy-50 p-3">
            <AlertOctagon size={16} className="mt-0.5 shrink-0 text-hsorange-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-navy-800">{fullName(c)}</p>
              <p className="mt-0.5 text-xs text-navy-500">{c.dataQualityFlag}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => onOpenContact(c.id)}>
              Review
            </Button>
          </div>
        ))}
        {flagged.length === 0 && <p className="text-sm text-navy-400">No data quality issues found.</p>}
      </div>
    </Modal>
  )
}
