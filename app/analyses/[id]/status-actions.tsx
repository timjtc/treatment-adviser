"use client"

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const statuses = [
  { key: 'approved', label: 'Approve', variant: 'default' },
  { key: 'modified', label: 'Mark as Modified', variant: 'secondary' },
  { key: 'rejected', label: 'Reject', variant: 'destructive' },
] as const

type Status = 'pending' | 'approved' | 'modified' | 'rejected'

export function AnalysisActions({ id, currentStatus }: { id: string; currentStatus: Status }) {
  const [status, setStatus] = useState<Status>(currentStatus)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const onSetStatus = (next: Status) => {
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/analyses/${id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: next }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to update status')
        }
        setStatus(next)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update status')
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-700">Status:</span>
        <Badge>{status.toUpperCase()}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Button
            key={s.key}
            variant={s.variant as any}
            size="sm"
            disabled={isPending}
            onClick={() => onSetStatus(s.key as Status)}
          >
            {s.label}
          </Button>
        ))}
      </div>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}
