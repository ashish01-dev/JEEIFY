'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  { q: 'Can I use JEEIFY on my phone?', a: 'Absolutely. The entire app is fully responsive and works seamlessly on mobile, tablet, and desktop.' },
  { q: 'How is my data stored and synced?', a: 'All your progress is stored locally via IndexedDB and synced to your account through Supabase. Your data stays safe and accessible across devices.' },
  { q: 'Can I collaborate with study partners?', a: 'The Teams plan includes collaborative dashboards, shared progress tracking, and unlimited storage — perfect for study groups and coaching centers.' },
]

const STEPS = [
  { step: '01', title: 'Connect', desc: 'Sign in with your Google account in under 10 seconds. No credit card needed.' },
  { step: '02', title: 'Set Your Target', desc: 'Pick your exam date and daily study goals. We calculate the perfect pace for you.' },
  { step: '03', title: 'Track Daily', desc: 'Log chapters, questions, tests, and pomodoros. Watch your progress compound daily.' },
  { step: '04', title: 'Ace the Exam', desc: 'Stay on track with smart recommendations and reach your target with confidence.' },
]

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
})

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
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg)' }}>
      <LandingNav />

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-5 pt-28 md:pt-36 pb-20 relative overflow-hidden">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="section-eyebrow mb-5"
        >
          JEE 2027 &mdash; Command Center
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-[clamp(40px,6vw,68px)] font-semibold leading-[1.05] tracking-[-2px] max-w-4xl"
          style={{ color: 'var(--c-text)' }}
        >
          Master your JEE prep<br />
          <span style={{ color: 'var(--c-blue)' }}>with purpose.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-[16px] mt-5 max-w-lg"
          style={{ color: 'var(--c-text-secondary)', lineHeight: 1.7 }}
        >
          Track syllabus progress, optimize your timetable, analyze tests &mdash; a command center built for the systematic mind.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-[18px] mt-6 font-medium"
          style={{ color: 'var(--c-text)' }}
        >
          Built by a <span style={{ color: 'var(--c-blue)' }}>Student</span><span style={{ color: 'var(--c-muted)' }}>, for Students</span>
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex items-center gap-4 mt-8 flex-wrap justify-center"
        >
          {user ? (
            <Link href="/dashboard" className="btn-primary">
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </span>
              Start Now
            </Link>
          ) : (
            <Link href="/auth?mode=signup" className="btn-primary">
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </span>
              Start Free
            </Link>
          )}
          <a href="#features" className="btn-secondary">Explore</a>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="px-5 py-24 md:py-28 max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <p className="section-eyebrow mb-3">Capabilities</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: 'var(--c-text)' }}>
            Everything you need.<span style={{ color: 'var(--c-muted)' }}> Nothing you don&apos;t.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={f.label} {...stagger(i)} className="card-base p-6 hover:-translate-y-[2px]" style={{ willChange: 'transform' }}>
              <div className="w-11 h-11 rounded-[10px] flex items-center justify-center mb-4" style={{ background: 'var(--c-tag)' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 22, color: 'var(--c-text)' }}>{f.icon}</span>
              </div>
              <h3 className="text-[16px] font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>{f.label}</h3>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-5 py-24 md:py-28 max-w-[1100px] mx-auto" style={{ contentVisibility: 'auto', containIntrinsicSize: '400px' }}>
        <div className="text-center mb-16">
          <p className="section-eyebrow mb-3">How It Works</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: 'var(--c-text)' }}>
            From zero to<span style={{ color: 'var(--c-muted)' }}> hero.</span>
          </h2>
          <p className="text-[14px] mt-4 max-w-md mx-auto" style={{ color: 'var(--c-text-secondary)', lineHeight: 1.7 }}>
            Four simple steps to transform your preparation into a structured, trackable system.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <motion.div key={s.step} {...stagger(i)} className="card-base p-6 hover:-translate-y-[2px]" style={{ willChange: 'transform' }}>
              <div className="text-[28px] font-bold tracking-[-1px] mb-3" style={{ color: 'var(--c-text)' }}>{s.step}</div>
              <h3 className="text-[16px] font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>{s.title}</h3>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 py-24 md:py-28 max-w-[700px] mx-auto">
        <div className="text-center mb-12">
          <p className="section-eyebrow mb-3">FAQ</p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-medium tracking-[-1.5px]" style={{ color: 'var(--c-text)' }}>
            Got questions?<span style={{ color: 'var(--c-muted)' }}> We&apos;ve got answers.</span>
          </h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="card-base transition-shadow duration-200" style={{
              boxShadow: openFaq === i ? 'var(--c-shadow-hover)' : 'var(--c-shadow)',
            }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-[15px] font-medium pr-4" style={{ color: 'var(--c-text)' }}>{faq.q}</span>
                <svg
                  className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                  style={{ color: 'var(--c-muted)', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="overflow-hidden transition-all duration-300" style={{
                maxHeight: openFaq === i ? '300px' : '0px',
                opacity: openFaq === i ? 1 : 0,
              }}>
                <div className="px-5 pb-4 text-[14px] leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-5 py-24 md:py-28">
        <p className="section-eyebrow mb-4">Ready</p>
        <h2 className="text-[clamp(32px,5vw,52px)] font-medium tracking-[-1.5px] mb-4" style={{ color: 'var(--c-text)' }}>
          Ace JEE 2027.<br /><span style={{ color: 'var(--c-muted)' }}>Start today.</span>
        </h2>
        <p className="text-[14px] mb-8 max-w-md mx-auto" style={{ color: 'var(--c-text-secondary)', lineHeight: 1.7 }}>
          Free. No credit card. Just your Google account and the determination to succeed.
        </p>
        {user ? (
          <Link href="/dashboard" className="btn-primary">
            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
            Go to Dashboard
          </Link>
        ) : (
          <Link href="/auth?mode=signup" className="btn-primary">
            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
            Get Started Free
          </Link>
        )}
      </section>

      {/* Footer is rendered by layout.tsx */}

      {/* Sign-in Prompt */}
      <AnimatePresence>
        {showSigninPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowSigninPrompt(false)}
          >
            <div className="backdrop-blur-xl absolute inset-0" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative z-10 rounded-[12px] px-8 py-10 text-center max-w-[340px] w-[90vw]"
              style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowSigninPrompt(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:opacity-70"
                style={{ background: 'var(--c-tag)', color: 'var(--c-muted)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div className="text-4xl mb-4">🔒</div>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--c-text)' }}>Please sign in first</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>You need to be signed in to access your dashboard.</p>
              <Link href="/auth?mode=signup" onClick={() => setShowSigninPrompt(false)}
                className="btn-primary px-6 py-2.5">Sign In</Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
