import { useState } from 'react'
import { Play, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { WorkflowResultsModal } from './WorkflowResultsModal'
import { useApp } from '../../context/AppContext'
import type { WorkflowRunResult } from '../../types'

export function RunWorkflowDemoButton({ className = '' }: { className?: string }) {
  const { runWorkflowDemo } = useApp()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WorkflowRunResult | null>(null)

  const handleClick = () => {
    setLoading(true)
    window.setTimeout(() => {
      const runResult = runWorkflowDemo()
      setLoading(false)
      setResult(runResult)
    }, 1000)
  }

  return (
    <>
      <Button variant="primary" onClick={handleClick} disabled={loading} className={className}>
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
        {loading ? 'Running workflow…' : 'Run Workflow Demo'}
      </Button>
      {result && <WorkflowResultsModal result={result} onClose={() => setResult(null)} />}
    </>
  )
}
