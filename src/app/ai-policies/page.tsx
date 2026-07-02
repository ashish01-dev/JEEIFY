'use client'

import Link from 'next/link'
import BackButton from '@/components/layout/BackButton'

const SECTIONS = [
  { title: 'Third-Party AI Providers', text: 'Our AI features use third-party APIs including NVIDIA AI Studio, which may process your study queries to generate responses. We carefully select providers that align with our privacy standards. No personal identifiable information beyond your study data is shared with these services.' },
  { title: 'Data Privacy', text: 'Your study data stays on your device via IndexedDB and is optionally synced to your Supabase account for cloud backup. We do not sell or share your data with third parties for advertising or other non-essential purposes.' },
  { title: 'How Recommendations Are Generated', text: 'Recommendations are generated using your study history, chapter completion status, estimated chapter duration, revision gaps, exam date, and available study time. No external data or profiling is used.' },
  { title: 'Data Storage & Sync', text: 'All your data is stored locally in your browser using IndexedDB. If you connect a Supabase account, your data is synced to the cloud for backup and cross-device access. You can export or delete all your data at any time from the Settings page.' },
  { title: 'Limitations', text: 'AI recommendations are based on available data and estimated progress. They may not always reflect your current preparation level accurately. Always use your own judgment when planning your study schedule.' },
  { title: 'Protecting Your Data', text: 'Communication with third-party AI APIs is encrypted. We do not store AI conversation history on our servers.' },
]

export default function AIPoliciesPage() {
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
        <h1 className="text-[clamp(28px,3vw,40px)] font-medium tracking-[-1px] mb-3" style={{ color: 'var(--c-text)' }}>
          AI Policies
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--c-muted)' }}>
          How we use AI, third-party APIs, and protect your data.
        </p>

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
          <Link href="/privacy" className="btn-secondary text-sm px-4 py-2.5 rounded-[40px]">Privacy Policy</Link>
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
