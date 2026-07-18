import { useMemo, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/ui/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

export function WorkflowsPage() {
  const { tasks, addToast } = useApp()
  const navigate = useNavigate()
  const [showMore, setShowMore] = useState(false)

  const enrolled = useMemo(() => new Set(tasks.filter((t) => t.isDecisionTask).map((t) => t.contactId)).size, [tasks])

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Workflows"
        meta={<span>1 active workflow</span>}
        actions={
          <Button
            variant="primary"
            onClick={() => addToast({ title: 'Create workflow', description: 'Not available in this fictional prototype.', variant: 'info' })}
          >
            <Plus size={15} /> Create workflow
          </Button>
        }
      />

      <div className="p-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50 text-left text-xs font-semibold text-navy-500">
              <th className="rounded-tl px-4 py-2">Workflow name</th>
              <th className="px-3 py-2">Object type</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Enrolled</th>
              <th className="px-3 py-2">Last updated</th>
              <th className="px-3 py-2">Created by</th>
              <th className="rounded-tr px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-navy-50 bg-white hover:bg-navy-50/60">
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => navigate('/workflows/conference-followup')}
                  className="font-semibold text-hsteal-600 hover:underline"
                >
                  Conference Follow-up – Open Task Without Deal
                </button>
                <p className="mt-0.5 text-xs text-navy-400">Prompts a commercial decision when a conference contact has no deal.</p>
              </td>
              <td className="px-3 py-3 text-navy-600">Contact</td>
              <td className="px-3 py-3">
                <Badge tone="green">On</Badge>
              </td>
              <td className="px-3 py-3 text-navy-700">{enrolled}</td>
              <td className="px-3 py-3 text-navy-500">Today</td>
              <td className="px-3 py-3 text-navy-500">Jordan Blake (SVP Commercial)</td>
              <td className="px-3 py-3">
                <div className="relative flex items-center justify-end gap-1">
                  <Button size="sm" variant="secondary" onClick={() => navigate('/workflows/conference-followup')}>
                    Edit
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowMore((v) => !v)}
                    className="rounded p-1.5 text-navy-400 hover:bg-navy-100"
                    aria-label="More options"
                  >
                    <ChevronDown size={14} />
                  </button>
                  {showMore && (
                    <div className="absolute right-0 top-9 z-30 w-44 rounded-md border border-navy-100 bg-white py-1 shadow-pop">
                      {['Clone workflow', 'Export workflow', 'Deactivate'].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setShowMore(false)
                            addToast({ title: item, description: 'Not available in this fictional prototype.', variant: 'info' })
                          }}
                          className="block w-full px-3 py-1.5 text-left text-xs text-navy-600 hover:bg-navy-50"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
