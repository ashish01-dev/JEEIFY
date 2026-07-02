import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const APP_PATHS = [
  '/dashboard', '/syllabus', '/timetable', '/progress', '/completion',
  '/activity', '/questions', '/tests', '/revision', '/formula-vault',
  '/settings', '/ai', '/pyq', '/backlog',
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAppPage = APP_PATHS.some(p => {
    if (p === '/ai') return pathname === '/ai'
    return pathname.startsWith(p)
  })

  if (isAppPage && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('signin', 'true')
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*', '/syllabus/:path*', '/timetable/:path*',
    '/progress/:path*', '/completion/:path*', '/activity/:path*',
    '/questions/:path*', '/tests/:path*', '/revision/:path*',
    '/formula-vault/:path*', '/settings/:path*', '/ai/:path*',
    '/pyq/:path*', '/backlog/:path*',
  ],
}
