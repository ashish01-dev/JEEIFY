import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { ALL_PYQS } from '@/data/pyqs'
import type { PYQEntry } from '@/data/pyqs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const subject = searchParams.get('subject')
  const chapterId = searchParams.get('chapterId')
  const year = searchParams.get('year')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Try Supabase first
  if (supabaseUrl && supabaseKey) {
    try {
      const sb = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      })
      let query = sb.from('pyq_questions').select('*')
      if (subject) query = query.eq('subject', subject)
      if (chapterId) query = query.eq('chapterId', chapterId)
      if (year) query = query.eq('year', parseInt(year))
      query = query.order('id', { ascending: true })

      const { data, error } = await query
      if (!error && data && data.length > 0) {
        return NextResponse.json({ questions: data, source: 'cloud' })
      }
    } catch {}
  }

  // Fallback to local data
  let questions = ALL_PYQS
  if (subject) questions = questions.filter(q => q.subject === subject)
  if (chapterId) questions = questions.filter(q => q.chapterId === chapterId)
  if (year) questions = questions.filter(q => q.year === parseInt(year))

  return NextResponse.json({ questions, source: 'local' })
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey || !serviceKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })

    // Upsert all questions
    const questions = ALL_PYQS.map(q => ({
      id: q.id,
      year: q.year,
      session: q.session,
      shift: q.shift,
      subject: q.subject,
      chapterId: q.chapterId,
      chapterName: q.chapterName,
      question: q.question,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      topic: q.topic || null,
      difficulty: q.difficulty || 'medium',
    }))

    const { error } = await admin.from('pyq_questions').upsert(questions, {
      onConflict: 'id',
      ignoreDuplicates: false,
    })

    if (error) throw error
    return NextResponse.json({ success: true, count: questions.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
