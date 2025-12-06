import { Pool } from 'pg'

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

// Shared pool for the app. Guards against missing config so build doesn't crash.
export const pool = connectionString
  ? new Pool({ connectionString, max: 5, idleTimeoutMillis: 30_000 })
  : null

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  if (!pool) throw new Error('Database connection is not configured. Set DATABASE_URL or DB_URL/DB_USER/DB_PASSWORD.')
  const client = await pool.connect()
  try {
    const res = await client.query<T>(text, params)
    return res.rows
  } finally {
    client.release()
  }
}
