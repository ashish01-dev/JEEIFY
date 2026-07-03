'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [msg, setMsg] = useState('Completing sign‑in…')

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) { router.replace('/auth?error=missing_config'); return }

    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')

    const finish = async () => {
      if (code) {
        // PKCE OAuth flow (Google sign-in)
        try {
          const { error } = await sb.auth.exchangeCodeForSession(code)
          if (error) { router.replace('/auth?error=auth_failed'); return }
        } catch { router.replace('/auth?error=auth_failed'); return }
      }
      // Hash fragment flow (email confirmation) — handled automatically by the browser client
      // Wait briefly for the client to process any hash fragment
      await new Promise(r => setTimeout(r, 1500))
      const { data: { user } } = await sb.auth.getUser()
      if (user) {
        router.replace('/dashboard')
      } else {
        setMsg('Sign‑in could not be completed. Redirecting…')
        setTimeout(() => router.replace('/auth?error=auth_failed'), 2000)
      }
    }
    finish()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--c-bg)' }}>
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--c-border)', borderTopColor: 'var(--c-blue)' }} />
      <p className="text-sm" style={{ color: 'var(--c-muted)' }}>{msg}</p>
    </div>
  )
}
