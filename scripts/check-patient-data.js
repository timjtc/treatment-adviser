const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgres://postgres:grespost@vmi2635135.contaboserver.net:5432/postgres'
})

async function check() {
  const result = await pool.query(
    'SELECT patient_data FROM analysis_runs WHERE id = $1',
    ['984bd75f-3e3a-4805-be72-bf3942372782']
  )
  console.log(JSON.stringify(result.rows[0]?.patient_data, null, 2))
  await pool.end()
}

check().catch(console.error)
