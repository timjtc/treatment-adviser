import Link from 'next/link'
import { query } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

async function getPatients() {
  if (!process.env.DATABASE_URL && !(process.env.DB_URL && process.env.DB_USER && process.env.DB_PASSWORD)) {
    return { rows: null, error: 'Database not configured' }
  }

  try {
    const rows = await query<{
      patient_id: string
      name: string
      last_visit: string | null
      last_complaint: string | null
      risk_score: string | null
    }>(
      `WITH latest_visit AS (
         SELECT v.id, v.patient_id, v.visit_date, v.primary_complaint, v.risk_score,
                ROW_NUMBER() OVER (PARTITION BY v.patient_id ORDER BY v.visit_date DESC) AS rn
           FROM visits v
       )
       SELECT p.id AS patient_id,
              CONCAT(p.first_name, ' ', p.last_name) AS name,
              lv.visit_date AS last_visit,
              lv.primary_complaint AS last_complaint,
              COALESCE(lv.risk_score, 'LOW') AS risk_score
         FROM patients p
         LEFT JOIN latest_visit lv ON lv.patient_id = p.id AND lv.rn = 1
        ORDER BY COALESCE(lv.visit_date, p.created_at) DESC
        LIMIT 50`
    )
    return { rows, error: null }
  } catch (error) {
    console.error('Failed to load patients', error)
    return { rows: null, error: 'Failed to load patients' }
  }
}

export default async function PatientsPage() {
  const { rows, error } = await getPatients()

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Doctor Workspace</p>
            <h1 className="text-3xl font-bold text-slate-900">Patients</h1>
            <p className="text-slate-600">Most recent patients and their last visit.</p>
          </div>
          <Link href="/intake" className="text-sm text-primary hover:underline">New patient intake</Link>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>All patients</CardTitle>
            <CardDescription>Newest first (max 50).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && <div className="text-sm text-red-600">{error}</div>}
            {!error && rows && rows.length === 0 && (
              <div className="text-sm text-slate-600">No patients yet.</div>
            )}
            {!error && rows?.map((p) => (
              <div key={p.patient_id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2">
                <div>
                  <div className="font-semibold text-slate-900">{p.name}</div>
                  <div className="text-sm text-slate-600">{p.last_complaint || 'No visits recorded'}</div>
                  <div className="text-xs text-slate-500">Last visit: {p.last_visit ? new Date(p.last_visit).toLocaleString() : 'N/A'}</div>
                </div>
                <Badge className={p.risk_score === 'HIGH' ? 'bg-red-600' : p.risk_score === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-600'}>
                  {(p.risk_score || 'LOW').toUpperCase()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
