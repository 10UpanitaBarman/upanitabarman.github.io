import { useState } from 'react'
import { CheckCircle2, X, XCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button } from '../ui/Button'
import { buildTestSteps, type WorkflowTestOutcome } from '../../lib/workflowEngine'
import { fullName } from '../../lib/contactHelpers'

interface TestWorkflowPanelProps {
  onClose: () => void
}

export function TestWorkflowPanel({ onClose }: TestWorkflowPanelProps) {
  const { contacts, tasks } = useApp()
  const [contactId, setContactId] = useState(contacts[0]?.id ?? '')
  const [outcome, setOutcome] = useState<WorkflowTestOutcome | null>(null)

  const contact = contacts.find((c) => c.id === contactId)

  const runTest = () => {
    if (!contact) return
    setOutcome(buildTestSteps(contact, tasks))
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-navy-900/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-40 flex h-full w-full max-w-[440px] flex-col bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4">
          <h2 className="text-base font-bold text-navy-800">Test workflow</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-navy-400 hover:bg-navy-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
          <label className="mb-1 block text-xs font-semibold text-navy-600">Select a fictional contact</label>
          <select
            value={contactId}
            onChange={(e) => {
              setContactId(e.target.value)
              setOutcome(null)
            }}
            className="w-full rounded border border-navy-200 px-3 py-2 text-sm focus:border-hsorange-500 focus:outline-none focus:ring-1 focus:ring-hsorange-500"
          >
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {fullName(c)}
              </option>
            ))}
          </select>

          <Button variant="primary" className="mt-3 w-full" onClick={runTest}>
            Run test
          </Button>

          {outcome && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-navy-400">Step-by-step result</p>
              <ol className="flex flex-col gap-2.5">
                {outcome.steps.map((step, idx) => (
                  <li key={step.label} className="flex gap-2.5 rounded border border-navy-100 p-2.5">
                    {step.passed ? (
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-500" />
                    ) : (
                      <XCircle size={16} className="mt-0.5 shrink-0 text-navy-300" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-navy-800">
                        {idx + 1}. {step.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-navy-500">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div
                className={`mt-4 rounded-md border px-3 py-2.5 text-sm font-semibold ${
                  outcome.enrolled ? 'border-green-200 bg-green-50 text-green-700' : 'border-navy-200 bg-navy-50 text-navy-600'
                }`}
              >
                {outcome.message}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
