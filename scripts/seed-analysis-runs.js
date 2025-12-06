const { Pool } = require('pg')

function buildConnectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL

  const host = process.env.DB_URL
  const user = process.env.DB_USER
  const password = process.env.DB_PASSWORD
  const dbName = process.env.DB_NAME || 'postgres'
  const port = process.env.DB_PORT || '5432'

  if (!host || !user || !password) return null

  const enc = encodeURIComponent
  return `postgres://${enc(user)}:${enc(password)}@${host}:${port}/${dbName}`
}

const connectionString = buildConnectionString()

if (!connectionString) {
  console.error('Database connection is not configured. Set DATABASE_URL or DB_URL/DB_USER/DB_PASSWORD.')
  process.exit(1)
}

const pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 30_000 })

const samples = [
  {
    patient_name: 'Alice Nguyen',
    primary_complaint: 'Hair loss follow-up',
    risk_score: 'LOW',
    status: 'pending',
    treatment_plan: {
      summary: 'Continue topical minoxidil; monitor scalp irritation.',
      meds: [{ name: 'Minoxidil 5% topical', dose: '1 mL nightly', duration: '90 days' }],
      follow_up: 'Reassess shedding and regrowth in 12 weeks.'
    },
    patient_data: { age: 39, sex: 'F', vitals: { bp: '118/72' }, notes: 'No cardiovascular history.' },
    metadata: { source: 'seed-script', note: 'Low-risk sample' }
  },
  {
    patient_name: 'Brian Lopez',
    primary_complaint: 'Erectile dysfunction with hypertension',
    risk_score: 'MEDIUM',
    status: 'approved',
    treatment_plan: {
      summary: 'Daily tadalafil with safety monitoring; counsel on nitrate avoidance.',
      meds: [{ name: 'Tadalafil', dose: '5 mg daily', caution: 'Do not combine with nitrates.' }],
      follow_up: 'BP check and adverse effects review in 4 weeks.'
    },
    patient_data: { age: 47, sex: 'M', comorbidities: ['hypertension'], meds: ['amlodipine'] },
    metadata: { source: 'seed-script', note: 'Approved example' }
  },
  {
    patient_name: 'Dana Kim',
    primary_complaint: 'Chest discomfort during exercise',
    risk_score: 'HIGH',
    status: 'rejected',
    treatment_plan: {
      summary: 'Defer ED pharmacotherapy; escalate to cardiology evaluation.',
      actions: ['Order stress test', 'Hold PDE5 inhibitors until cleared']
    },
    patient_data: { age: 52, sex: 'F', flags: ['Refer to cardiology'], vitals: { bp: '142/86' } },
    metadata: { source: 'seed-script', note: 'Rejected until cardiology review' }
  }
]

async function seed() {
  const client = await pool.connect()
  try {
    const inserted = []
    for (const sample of samples) {
      const res = await client.query(
        `INSERT INTO analysis_runs (
           patient_name,
           primary_complaint,
           risk_score,
           status,
           treatment_plan,
           patient_data,
           metadata
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          sample.patient_name,
          sample.primary_complaint,
          sample.risk_score,
          sample.status,
          sample.treatment_plan,
          sample.patient_data,
          sample.metadata
        ]
      )
      inserted.push(res.rows[0].id)
    }

    console.log(`Inserted ${inserted.length} analysis runs:`)
    inserted.forEach((id) => console.log(` - ${id}`))
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch((err) => {
  console.error('Failed to seed analysis runs', err)
  process.exit(1)
})
