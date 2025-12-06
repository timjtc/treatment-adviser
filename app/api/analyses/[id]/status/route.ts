import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

const VALID_STATUSES = ['pending', 'approved', 'modified', 'rejected'] as const

type Status = (typeof VALID_STATUSES)[number]

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const status = (body?.status || '').toLowerCase()

    if (!VALID_STATUSES.includes(status as Status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const result = await query(
      `UPDATE analysis_runs SET status = $1 WHERE id = $2 RETURNING id`,
      [status, id]
    )

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error('Failed to update analysis status', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
