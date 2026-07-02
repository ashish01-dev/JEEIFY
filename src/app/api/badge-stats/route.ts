import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const BATCHES = [
  { name: 'Beginner', chapters: 5 },
  { name: 'Intermediate', chapters: 15 },
  { name: 'Advanced', chapters: 30 },
  { name: 'Expert', chapters: 50 },
  { name: 'Master', chapters: 75 },
]

function getBatchId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_')
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return req.cookies.getAll() }, setAll() {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return NextResponse.json({
        batches: BATCHES.map(b => ({ id: getBatchId(b.name), name: b.name, chapters: b.chapters, percentage: 0, totalUsers: 0, owners: 0 })),
        totalUsers: 0,
      })
    }

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })

    const { count: totalUsers } = await sb
      .from('progress')
      .select('user_id', { count: 'exact', head: true })

    const { data: doneData } = await sb
      .from('progress')
      .select('user_id')
      .eq('status', 'done')

    if (!doneData || !totalUsers) {
      return NextResponse.json({
        batches: BATCHES.map(b => ({ id: getBatchId(b.name), name: b.name, chapters: b.chapters, percentage: 0, totalUsers: totalUsers || 0, owners: 0 })),
        totalUsers: totalUsers || 0,
      })
    }

    const userCounts: Record<string, number> = {}
    for (const row of doneData) {
      userCounts[row.user_id] = (userCounts[row.user_id] || 0) + 1
    }
    const uniqueUsers = Object.keys(userCounts).length
    const total = Math.max(totalUsers, uniqueUsers)

    const batches = BATCHES.map(b => {
      const owners = Object.values(userCounts).filter(c => c >= b.chapters).length
      return {
        id: getBatchId(b.name),
        name: b.name,
        chapters: b.chapters,
        percentage: total > 0 ? Math.round((owners / total) * 100) : 0,
        totalUsers: total,
        owners,
      }
    })

    return NextResponse.json({ batches, totalUsers: total })
  } catch (err) {
    console.error('Badge stats error:', err)
    return NextResponse.json({ error: 'Failed to fetch badge stats' }, { status: 500 })
  }
}
