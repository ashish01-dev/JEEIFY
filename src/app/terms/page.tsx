'use client'

import Link from 'next/link'
import BackButton from '@/components/layout/BackButton'

const SECTIONS = [
  { title: '1. Acceptance of Terms', text: 'By accessing or using JEEIFY ("the Service"), you agree to be bound by these terms. If you do not agree to these terms, do not use the Service.' },
  { title: '2. Description of Service', text: 'JEEIFY provides a personal study tracking dashboard designed for JEE aspirants. The Service includes syllabus tracking, timetable planning, pomodoro timer, test analysis, and progress analytics. The Service is provided "as is" without warranty of any kind.' },
  { title: '3. User Accounts', text: 'You are responsible for maintaining the confidentiality of your Google account credentials used to sign in. You are responsible for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.' },
  { title: '4. Data Storage & Sync', text: 'Your study data is stored locally in your browser via IndexedDB. When you sign in with Google, data may be synced to our Supabase cloud servers to enable cross-device access. You can export or delete your data at any time from the Settings page.' },
  { title: '5. Acceptable Use', text: 'You agree not to misuse the Service for any unlawful purpose. This includes but is not limited to attempting to disrupt the Service, accessing other users\' data, or using the Service for any purpose other than personal study tracking.' },
  { title: '6. Limitation of Liability', text: 'JEEIFY and its creators are not liable for any direct, indirect, incidental, special, or consequential damages arising from the use or inability to use the Service. This includes but is not limited to loss of data, loss of study time, or exam performance.' },
  { title: '7. Changes to Terms', text: 'We reserve the right to update these terms at any time. Changes will be effective immediately upon posting. Continued use of the Service after changes constitutes acceptance of the updated terms.' },
  { title: '8. Termination', text: 'We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, and without prior notice. Upon termination, your right to use the Service will immediately cease.' },
  { title: '9. Contact', text: 'For questions about these terms, reach out via our Contact page.' },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg)' }}>
      <nav className="relative max-w-[1100px] mx-auto w-full px-5 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-[9px]">
            <img src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg" alt="logo" loading="lazy" decoding="async" style={{ height: 24, filter: 'var(--c-logo-filter)' }} />
            <span className="text-[18px] font-bold tracking-[-0.3px]" style={{ color: 'var(--c-text)' }}>JEEIFY</span>
          </Link>
        </div>
        <div className="absolute bottom-0 left-5 right-5 h-px" style={{ background: 'var(--c-border)' }} />
      </nav>

      <main className="max-w-[700px] mx-auto px-5 py-16 md:py-24">
        <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-1px] mb-2" style={{ color: 'var(--c-text)' }}>Terms &amp; Conditions</h1>
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
          <Link href="/privacy" className="btn-secondary text-sm px-4 py-2.5 rounded-[40px]">Privacy Policy</Link>
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
