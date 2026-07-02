'use client'

import Link from 'next/link'
import BackButton from '@/components/layout/BackButton'

const SECTIONS = [
  { title: '1. Information We Collect', text: 'We collect your Google account email and name when you sign in via Google OAuth. Study progress data — including chapter completion, test scores, pomodoro sessions, and daily plans — is stored locally in your browser via IndexedDB and optionally synced to our Supabase cloud servers when you are signed in.' },
  { title: '2. How We Use Information', text: 'Your data is used solely to provide the JEE study tracking service. We use your email for authentication and account identification. Study data powers your dashboard, progress tracking, pace calculations, and personalized recommendations. We do not sell, share, or distribute your personal information to third parties.' },
  { title: '3. Data Storage', text: 'Primary storage is in your browser via IndexedDB — your data stays on your device by default. Cloud sync via Supabase is optional and only occurs when you sign in with your Google account. You can disable sync at any time from the Settings page.' },
  { title: '4. Third-Party Services', text: 'We use Google OAuth for authentication and Supabase for optional cloud sync and file storage. Both services operate under their own privacy policies. We do not control how these third parties handle your data.' },
  { title: '5. Your Rights', text: 'You can export, clear, or delete all your data at any time from the Settings page. You can also sign out to stop cloud sync. If you wish to have your account data permanently removed from our servers, contact us via the Contact page.' },
  { title: '6. Cookies', text: 'We use essential cookies for authentication and theme preferences. No tracking cookies or analytics cookies are used. You can clear your cookies at any time through your browser settings.' },
  { title: '7. Contact', text: 'For privacy concerns or data removal requests, reach out via our Contact page.' },
  { title: '8. Changes to This Policy', text: 'We may update this privacy policy from time to time. Continued use of the service after changes constitutes acceptance of the updated policy.' },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg)' }}>
      <nav className="relative max-w-[1100px] mx-auto w-full px-5 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-[9px]">
            <img src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg" alt="logo" style={{ height: 24, filter: 'var(--c-logo-filter)' }} />
            <span className="text-[18px] font-bold tracking-[-0.3px]" style={{ color: 'var(--c-text)' }}>JEEIFY</span>
          </Link>
        </div>
        <div className="absolute bottom-0 left-5 right-5 h-px" style={{ background: 'var(--c-border)' }} />
      </nav>

      <main className="max-w-[700px] mx-auto px-5 py-16 md:py-24">
        <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-1px] mb-2" style={{ color: 'var(--c-text)' }}>Privacy Policy</h1>
        <p className="text-[13px] mb-10" style={{ color: 'var(--c-caption)' }}>Last updated: June 2026</p>

        <div className="space-y-4">
          {SECTIONS.map(s => (
            <div key={s.title} className="card-base p-5">
              <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--c-text)' }}>{s.title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>{s.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-10">
          <BackButton />
          <Link href="/terms" className="btn-secondary text-sm px-4 py-2.5 rounded-[40px]">Terms & Conditions</Link>
          <Link href="/ai-policies" className="btn-secondary text-sm px-4 py-2.5 rounded-[40px]">AI Policies</Link>
        </div>
      </main>

      <footer className="py-8 px-5 max-w-[1100px] mx-auto text-center">
        <div className="flex items-center justify-center gap-4 text-xs mb-3" style={{ color: 'var(--c-caption)' }}>
          <Link href="/terms" className="hover:underline" style={{ color: 'var(--c-muted)' }}>Terms & Conditions</Link>
          <Link href="/privacy" className="hover:underline" style={{ color: 'var(--c-muted)' }}>Privacy Policy</Link>
          <Link href="/contact" className="hover:underline" style={{ color: 'var(--c-muted)' }}>Contact</Link>
        </div>
        <p className="text-[12px]" style={{ color: 'var(--c-caption)' }}>&copy; 2026 JEEIFY. All rights reserved.</p>
      </footer>
    </div>
  )
}
