import Link from 'next/link'
import { notFound } from 'next/navigation'
import { query } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AnalysisActions } from './status-actions'

async function getAnalysis(id: string) {
  try {
    const rows = await query<{
      id: string
      patient_name: string | null
      primary_complaint: string | null
      risk_score: string | null
      status: string | null
      treatment_plan: any
      patient_data: any
      metadata: any
      created_at: string
    }>('SELECT * FROM analysis_runs WHERE id = $1 LIMIT 1', [id])
    return rows[0] || null
  } catch (error) {
    console.error('Failed to load analysis', error)
    return null
  }
}

export default async function AnalysisDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const analysis = await getAnalysis(id)
  if (!analysis) return notFound()

  const risk = (analysis.risk_score || 'LOW').toUpperCase()
  const status = (analysis.status || 'pending').toUpperCase()

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
        <Link href="/analyses">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to analyses
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Doctor Workspace</p>
            <h1 className="text-3xl font-bold text-slate-900">Analysis detail</h1>
            <p className="text-slate-600">Generated: {new Date(analysis.created_at).toLocaleString()}</p>
          </div>
          <Badge className={risk === 'HIGH' ? 'bg-red-600' : risk === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-600'}>
            {risk}
          </Badge>
        </div>

        <AnalysisActions id={analysis.id} currentStatus={analysis.status || 'pending'} />

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{analysis.patient_name || 'Unknown patient'}</CardTitle>
            <CardDescription>{analysis.primary_complaint || 'Primary complaint not provided'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-2">Treatment plan (JSON)</h2>
              <pre className="rounded-lg bg-slate-900 text-slate-100 text-sm p-4 overflow-auto whitespace-pre-wrap">{JSON.stringify(analysis.treatment_plan, null, 2)}</pre>
            </section>
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-2">Patient data (JSON)</h2>
              <pre className="rounded-lg bg-slate-900 text-slate-100 text-sm p-4 overflow-auto whitespace-pre-wrap">{JSON.stringify(analysis.patient_data, null, 2)}</pre>
            </section>
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-2">Metadata</h2>
              <pre className="rounded-lg bg-slate-900 text-slate-100 text-sm p-4 overflow-auto whitespace-pre-wrap">{JSON.stringify(analysis.metadata, null, 2)}</pre>
            </section>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
