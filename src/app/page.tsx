'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import LandingNav from '@/components/layout/LandingNav'
import { useUser } from '@/lib/useUser'

const FEATURES = [
  { icon: 'menu_book', label: 'Syllabus Tracker', desc: 'Track every chapter and topic across Physics, Chemistry, and Maths with real-time progress.' },
  { icon: 'map', label: 'Smart Roadmap', desc: 'Personalized study roadmap that adapts to your pace and exam timeline.' },
  { icon: 'calendar_month', label: 'Hourly Timetable', desc: 'Drag-and-drop weekly planner with subject slots, breaks, and revision blocks.' },
  { icon: 'trending_up', label: 'Progress Analytics', desc: 'Visual breakdown of completion rates, pace status, and subject-wise performance.' },
  { icon: 'timer', label: 'Pomodoro Timer', desc: 'Built-in focus timer with session tracking to optimize your study streaks.' },
  { icon: 'assignment', label: 'Test Analyzer', desc: 'Log mock test scores, track improvement, and identify weak areas.' },
]

const FAQS = [
  { q: 'Is JEEIFY really free?', a: 'Yes! The Free tier includes full syllabus tracking, timetable planner, Pomodoro timer, test score logging, activity journal, and 500 MB of storage — completely free, no credit card required.' },
  { q: 'What happens when I hit the 500 MB storage limit?', a: 'The Free version caps at 500 MB of storage. Upgrade to Pro for 5 GB storage, advanced analytics, faster support, and priority access to new features.' },
  { q: 'How does the pace tracking algorithm work?', a: 'It analyzes your daily chapter completions, study hours, and test scores against your exam date and syllabus size. It determines whether you\'re ahead, on track, or behind — and adjusts recommendations accordingly.' },
  { q: 'Can I use JEEIFY on my phone?', a: 'Absolutely. The entire app is fully responsive and works seamlessly on mobile, tablet, and desktop. The mobile layout includes a compact bottom nav bar for easy one-handed use.' },
  { q: 'How is my data stored and synced?', a: 'All your progress is stored locally via IndexedDB and synced to your account through Supabase. Your data stays safe and accessible across devices.' },
  { q: 'Can I collaborate with study partners?', a: 'The Teams plan includes collaborative dashboards, shared progress tracking, and unlimited storage — perfect for study groups and coaching centers.' },
]

const STEPS = [
  { step: '01', title: 'Connect Google', desc: 'Sign in with your Google account in under 10 seconds. No credit card needed.' },
  { step: '02', title: 'Set Your Target', desc: 'Pick your exam date and daily study goals. We calculate the perfect pace for you.' },
  { step: '03', title: 'Track Daily', desc: 'Log chapters, questions, tests, and pomodoros. Watch your progress compound daily.' },
  { step: '04', title: 'Ace the Exam', desc: 'Stay on track with smart recommendations and reach your target with confidence.' },
]

const springStagger = (i: number) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, delay: i * 0.08, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
})

const sectionFade = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
}

export default function LandingPage() {
  const { user } = useUser()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showSigninPrompt, setShowSigninPrompt] = useState(false)

  useEffect(() => {
    if (window.location.search.includes('signin=true')) {
      setShowSigninPrompt(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <LandingNav />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-5 py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-30 pointer-events-none" style={{ background: 'var(--c-blue)' }} />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ background: 'var(--c-blue)' }} />
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="section-eyebrow mb-6"
        >
          JEE 2027 — Command Center
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
          className="text-[clamp(42px,7vw,72px)] font-medium leading-[1.05] tracking-[-2px] max-w-4xl"
          style={{ color: 'var(--c-text)' }}
        >
          Master your JEE prep<br />
          <span className="text-[var(--c-blue)] font-semibold">with purpose.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-[15px] mt-5 max-w-lg"
          style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}
        >
          Track syllabus progress, optimize your timetable, analyze tests — a command center built for the systematic mind.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-[clamp(15px,2vw,20px)] mt-6 font-medium"
          style={{ color: 'var(--c-text)' }}
        >
          Built by a <span className="text-[var(--c-blue)]">Student</span><span className="text-[var(--c-muted)]">, for Students</span>
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex items-center gap-4 mt-8 flex-wrap justify-center"
        >
          <Link href="/auth?mode=signup" className="btn-primary">
            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
            Start Free
          </Link>
          <a href="#features" className="btn-secondary">Explore</a>
        </motion.div>
      </section>

      {/* Features */}
      <motion.section {...sectionFade} id="features" className="px-5 py-24 md:py-32 max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <p className="section-eyebrow mb-3">Capabilities</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: 'var(--c-text)' }}>
            Everything you need.<span className="text-[var(--c-muted)]"> Nothing you don&apos;t.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.label} {...springStagger(i)} className="card-base px-[22px] py-[24px] hover:-translate-y-[2px]" style={{ willChange: 'transform' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--c-tag)' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 24, color: 'var(--c-text)' }}>{f.icon}</span>
              </div>
              <h3 className="text-[15px] font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>{f.label}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--c-muted)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section {...sectionFade} className="px-5 py-24 md:py-32 max-w-[1100px] mx-auto" style={{ contentVisibility: 'auto', containIntrinsicSize: '400px' }}>
        <div className="text-center mb-16">
          <p className="section-eyebrow mb-3">How It Works</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: 'var(--c-text)' }}>
            From zero to<span className="text-[var(--c-muted)]"> hero.</span>
          </h2>
          <p className="text-[14px] mt-4 max-w-md mx-auto" style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Four simple steps to transform your preparation into a structured, trackable system.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <motion.div key={s.step} {...springStagger(i)} className="card-base px-[22px] py-[24px] hover:-translate-y-[2px]" style={{ willChange: 'transform' }}>
              <div className="text-[32px] font-bold tracking-[-1px] mb-3" style={{ color: 'var(--c-blue)' }}>{s.step}</div>
              <h3 className="text-[15px] font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>{s.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--c-muted)' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section {...sectionFade} className="px-5 py-24 md:py-32 max-w-[800px] mx-auto">
        <div className="text-center mb-12">
          <p className="section-eyebrow mb-3">FAQ</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: 'var(--c-text)' }}>
            Got questions?<span className="text-[var(--c-muted)]"> We&apos;ve got answers.</span>
          </h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="card-base transition-shadow duration-200" style={{
              boxShadow: openFaq === i ? '0 4px 20px rgba(0,0,0,0.06)' : 'var(--c-shadow)',
            }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-[22px] py-[16px] text-left"
              >
                <span className="text-[14px] font-medium pr-4" style={{ color: 'var(--c-text)' }}>{faq.q}</span>
                <span className="text-[var(--c-muted)] text-lg flex-shrink-0 transition-transform duration-200" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
              </button>
              <div className="overflow-hidden transition-all duration-300" style={{
                maxHeight: openFaq === i ? '300px' : '0px',
                opacity: openFaq === i ? 1 : 0,
              }}>
                <div className="px-[22px] pb-[16px] text-[13px] leading-relaxed" style={{ color: 'var(--c-muted)' }}>
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section {...sectionFade} className="px-5 py-24 md:py-32 text-center">
        <p className="section-eyebrow mb-4">Ready</p>
        <h2 className="text-[clamp(32px,5vw,52px)] font-medium tracking-[-1.5px] mb-4" style={{ color: 'var(--c-text)' }}>
          Ace JEE 2027.<br /><span className="text-[var(--c-muted)]">Start today.</span>
        </h2>
        <p className="text-[14px] mb-8 max-w-md mx-auto" style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
          Free. No credit card. Just your Google account and the determination to succeed.
        </p>
        <Link href="/auth?mode=signup" className="btn-primary">
          <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </span>
          Get Started Free
        </Link>
      </motion.section>

      {/* Footer is rendered by layout.tsx */}

      {showSigninPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowSigninPrompt(false)}>
          <div className="backdrop-blur-xl absolute inset-0" />
          <div className="relative z-10 animate-scaleIn rounded-[18px] px-8 py-10 text-center max-w-[340px] w-[90vw]"
            style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowSigninPrompt(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:opacity-70"
              style={{ background: 'var(--c-tag)', color: 'var(--c-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--c-text)' }}>Please sign in first</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>You need to be signed in to access your dashboard.</p>
            <Link href="/auth?mode=signup" onClick={() => setShowSigninPrompt(false)}
              className="btn-primary">Sign In</Link>
          </div>
        </div>
      )}
      <style>{`@keyframes scaleIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}.animate-scaleIn{animation:scaleIn .3s ease-out}`}</style>
    </div>
  )
}
