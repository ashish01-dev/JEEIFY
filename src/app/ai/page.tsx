'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { X, TrendingUp, TrendingDown, AlertCircle, Clock, CheckCircle2, RefreshCw, Target, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useProgressStore } from '@/store/progressStore'
import { useGamificationStore } from '@/store/gamificationStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUser } from '@/lib/useUser'
import { db } from '@/lib/db'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import syllabusData from '@/data/syllabus.json'
import type { SyllabusData, Subject, Chapter, TestEntry, BacklogItem, StudySession } from '@/types'

const syllabus = syllabusData as unknown as SyllabusData
const SUBJECTS: Subject[] = ['physics', 'chemistry', 'maths']
const SUBJECT_LABELS: Record<Subject, string> = { physics: 'Physics', chemistry: 'Chemistry', maths: 'Maths' }
const SUBJECT_COLORS: Record<Subject, string> = { physics: '#3b82f6', chemistry: '#10b981', maths: '#f59e0b' }
const SUBJECT_EMOJIS: Record<Subject, string> = { physics: '⚡', chemistry: '🧪', maths: '📐' }

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'; if (h < 17) return 'Good Afternoon'; return 'Good Evening'
}

function retentionPercent(d: number): number {
  return Math.max(20, Math.min(98, 100 - d * 2.5))
}

function estimateHours(chapter: Chapter): number {
  const t = Math.max(1, chapter.topics.filter(x => !x.deleted).length)
  const w = chapter.weightage === 'high' ? 1.5 : chapter.weightage === 'medium' ? 1 : 0.7
  return Math.round(t * 0.75 * w)
}

const INFO_DATA: Record<string, { title: string; body: string }> = {
  mastery: {
    title: 'How Current Mastery is calculated',
    body: 'Your mastery percentage is the ratio of completed chapters to total chapters across all three subjects (Physics, Chemistry, Maths). A chapter is considered "completed" when its status is marked as done in your syllabus tracker.'
  },
  backlog_risk: {
    title: 'How Backlog Risk is calculated',
    body: 'Based on the Ebbinghaus Forgetting Curve. Each chapter\'s retention decays daily from 98% after study. Chapters below 50% retention are flagged as "urgent" — they need immediate revision to prevent permanent memory loss.'
  },
  recall: {
    title: 'How Active Recall is calculated',
    body: 'Your current study streak (consecutive days with at least one study session logged). Combined with your overall chapter completion progress to show your active engagement with the syllabus.'
  },
  decay: {
    title: 'How Topic Decay Analysis works',
    body: 'Each studied chapter\'s retention is calculated using the formula: max(20%, min(98%, 100% - daysSinceLastRevision × 2.5%)). This follows the Ebbinghaus forgetting curve. Lower bars = chapters needing urgent revision.'
  },
  subject_perf: {
    title: 'How Subject Performance is calculated',
    body: 'Average accuracy across all logged mock tests for each subject. The trend compares your last 3 tests against earlier ones — "up" means >3% improvement, "down" means >3% decline, "stable" means within ±3%.'
  },
  mistakes: {
    title: 'How The Mistake Log works',
    body: 'Errors are detected from two sources: (1) Conceptual — chapters with retention below 45% suggest weak understanding. (2) Calculation — tests with accuracy below 60%. (3) Memory Loss — chapters not revised for 21+ days with retention below 60%.'
  },
  avg_time: {
    title: 'How Average Review Time is calculated',
    body: 'The average duration of all your logged study sessions across all subjects. Longer review times typically indicate deeper focus sessions.'
  },
  mistakes_fixed: {
    title: 'How Mistakes Fixed is tracked',
    body: 'Count of backlog items you\'ve marked as "cleared". Each cleared backlog item represents a topic, PYQ, or revision task you\'ve completed and checked off.'
  },
  recall_acc: {
    title: 'How Recall Accuracy is calculated',
    body: 'Average retention percentage across all your active (studied) chapters. Higher means you\'re consistently revising and maintaining your knowledge over time.'
  },
}

const INFO_ICONS: Record<string, string> = {
  mastery: 'Target → ch. completion ratio',
  backlog_risk: 'AlertCircle → retention < 50% flags',
  recall: 'Zap → streak + syllabus completion',
  decay: 'Bar chart → forgetting curve per topic',
  subject_perf: 'Trend lines → test accuracy history',
  mistakes: 'Table → error pattern detection',
  avg_time: 'Clock → mean session duration',
  mistakes_fixed: 'CheckCircle → cleared backlog count',
  recall_acc: 'Refresh → avg retention across topics',
}

function InfoPopup({ section, onClose }: { section: string; onClose: () => void }) {
  const data = INFO_DATA[section]
  if (!data) return null
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="max-w-sm mx-4 rounded-[18px] p-6 animate-scale-in" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow-hover)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold" style={{ color: 'var(--c-text)' }}>{data.title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.1]" style={{ color: 'var(--c-muted)' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>{data.body}</p>
        <button onClick={onClose} className="mt-5 w-full py-2.5 text-sm font-semibold rounded-[40px] text-white transition-opacity hover:opacity-90" style={{ background: 'var(--c-btn-primary)' }}>Got it</button>
      </div>
    </div>
  )
}

function BetaPopup({ onAcknowledge }: { onAcknowledge: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div className="max-w-sm mx-4 rounded-[18px] p-6 animate-scale-in relative" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow-hover)' }}>
        <button onClick={onAcknowledge} className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.1]" style={{ color: 'var(--c-muted)' }}><X size={15} /></button>
        <h3 className="text-base font-bold mb-3" style={{ color: 'var(--c-text)' }}>AI Assistant is still in Beta</h3>
        <div className="space-y-2.5 text-[13px] leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
          <p>Thanks for being an early adopter! Here are a few things to keep in mind:</p>
          <ul className="space-y-1.5 pl-4" style={{ listStyle: 'disc' }}>
            <li>Recommendations are based on your study data and may not always be perfect.</li>
            <li>AI responses use third-party models and may occasionally be inaccurate.</li>
            <li>New features and improvements are being added regularly.</li>
            <li>Your feedback helps us make the AI better — share it anytime.</li>
            <li>Data from your AI interactions is used only to improve your experience.</li>
          </ul>
        </div>
        <button onClick={onAcknowledge} className="mt-5 w-full py-2.5 text-sm font-semibold rounded-[40px] text-white transition-opacity hover:opacity-90" style={{ background: 'var(--c-btn-primary)' }}>I Understand</button>
      </div>
    </div>
  )
}

const allChaptersRaw: { subject: Subject; chapter: Chapter }[] = []
for (const sub of SUBJECTS)
  for (const div of syllabus[sub].divisions)
    for (const ch of div.chapters) if (!ch.deleted) allChaptersRaw.push({ subject: sub as Subject, chapter: ch })

export default function AIPage() {
  const { progress, loaded: progressLoaded, incrementRevision } = useProgressStore()
  const { settings } = useSettingsStore()
  const { user, loading: userLoading } = useUser()
  const { currentStreak, totalStudyDays, xp, level, loaded: gamificationLoaded } = useGamificationStore()
  const today = new Date()
  const examDate = new Date(settings.examDate)
  const daysRemaining = Math.max(0, Math.ceil((examDate.getTime() - today.getTime()) / 86400000))
  const router = useRouter()
  const isPro = user?.isPro ?? false
  const [showBeta, setShowBeta] = useState(true)
  const [aiLoading, setAiLoading] = useState(true)
  const [tests, setTests] = useState<TestEntry[]>([])
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([])

  useEffect(() => {
    db.tests.toArray().then(setTests).catch(() => setTests([]))
    db.studySessions.toArray().then(setSessions).catch(() => setSessions([]))
    db.backlog.toArray().then(setBacklogItems).catch(() => setBacklogItems([]))
  }, [])

  useEffect(() => { if (localStorage.getItem('ai_beta_acknowledged')) setShowBeta(false) }, [])
  useEffect(() => { if (!progressLoaded) return; const t = setTimeout(() => setAiLoading(false), 1200); return () => clearTimeout(t) }, [progressLoaded])

  const handleBetaAcknowledge = useCallback(() => { localStorage.setItem('ai_beta_acknowledged', '1'); setShowBeta(false) }, [])
  const [availableHours, setAvailableHours] = useState(settings.dailyStudyHours || 6)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
const [infoSection, setInfoSection] = useState<string | null>(null)

  const getChapterProgress = useCallback((ch: Chapter) => {
    const p = progress[ch.id]
    if (!p) return { status: 'not_started' as const, pct: 0, lastRevised: null as Date | null, revisionCount: 0 }
    const topics = ch.topics.filter(t => !t.deleted)
    const doneTopics = topics.filter(t => p.topicStatus[t.id]).length
    return { status: p.status, pct: topics.length > 0 ? Math.round((doneTopics / topics.length) * 100) : 0, lastRevised: p.lastRevised ? new Date(p.lastRevised) : null, revisionCount: p.revisionCount || 0 }
  }, [progress])

  const overallStats = useMemo(() => {
    let done = 0, total = 0, totalTopics = 0, doneTopics = 0
    for (const { chapter } of allChaptersRaw) {
      total++; const p = progress[chapter.id]
      if (p?.status === 'done') done++
      const chTopics = chapter.topics.filter(t => !t.deleted); totalTopics += chTopics.length
      if (p) doneTopics += chTopics.filter(t => p.topicStatus[t.id]).length
    }
    return { chaptersDone: done, chaptersTotal: total, pct: total > 0 ? Math.round((done / total) * 100) : 0, topicPct: totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0 }
  }, [progress])

  const decayData = useMemo(() => {
    const items: { subject: Subject; chapter: Chapter; daysSince: number; retention: number; pct: number }[] = []
    for (const { subject, chapter } of allChaptersRaw) {
      const cp = getChapterProgress(chapter)
      if (cp.status === 'not_started') continue
      const daysSince = cp.lastRevised ? Math.round((today.getTime() - cp.lastRevised.getTime()) / 86400000) : 14
      items.push({ subject, chapter, daysSince, retention: retentionPercent(daysSince), pct: cp.pct })
    }
    items.sort((a, b) => a.retention - b.retention)
    return { items: items.slice(0, 5), urgent: items.filter(i => i.retention < 50).length }
  }, [progress])

  const subjectPerformance = useMemo(() => {
    const result: Record<Subject, { avgAccuracy: number; trend: 'up' | 'down' | 'stable'; testCount: number }> = { physics: { avgAccuracy: 0, trend: 'stable', testCount: 0 }, chemistry: { avgAccuracy: 0, trend: 'stable', testCount: 0 }, maths: { avgAccuracy: 0, trend: 'stable', testCount: 0 } }
    const bySubject: Record<Subject, TestEntry[]> = { physics: [], chemistry: [], maths: [] }
    for (const t of tests) { if (bySubject[t.subject]) bySubject[t.subject].push(t) }
    for (const sub of SUBJECTS) {
      const subTests = bySubject[sub]
      if (subTests.length === 0) continue
      result[sub].testCount = subTests.length
      const accuracies = subTests.map(t => t.total > 0 ? (t.score / t.total) * 100 : 0)
      result[sub].avgAccuracy = Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length)
      if (subTests.length >= 2) {
        const sorted = [...subTests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        const scores = sorted.map(t => t.total > 0 ? (t.score / t.total) * 100 : 0)
        const recent = scores.slice(0, Math.min(3, scores.length))
        const older = scores.slice(Math.min(3, scores.length))
        const rAvg = recent.reduce((a, b) => a + b, 0) / recent.length
        const oAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : rAvg
        result[sub].trend = rAvg - oAvg > 3 ? 'up' : rAvg - oAvg < -3 ? 'down' : 'stable'
      }
    }
    return result
  }, [tests])

  const overallTestScore = useMemo(() => {
    const all = tests.filter(t => t.total > 0)
    if (all.length === 0) return null
    const sorted = [...all].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const latest = sorted[0]
    return { latestScore: latest.score, latestTotal: latest.total, latestPct: Math.round((latest.score / latest.total) * 100), count: all.length }
  }, [tests])

  const mistakeLog = useMemo(() => {
    const entries: { id: string; subject: Subject; chapterName: string; errorType: string; difficulty: string; daysAgo: number }[] = []
    for (const { subject, chapter, daysSince, retention } of decayData.items) {
      if (retention >= 45) continue
      entries.push({ id: `decay-${chapter.id}`, subject, chapterName: chapter.name, errorType: 'Conceptual', difficulty: retention < 30 ? 'HARD' : 'MEDIUM', daysAgo: daysSince })
    }
    for (const t of tests) {
      const pct = t.total > 0 ? (t.score / t.total) * 100 : 100
      if (pct >= 60) continue
      entries.push({ id: `test-${t.id}`, subject: t.subject, chapterName: t.chapters?.[0] || `${SUBJECT_LABELS[t.subject]} Test`, errorType: 'Calculation', difficulty: pct < 40 ? 'HARD' : 'MEDIUM', daysAgo: Math.round((today.getTime() - new Date(t.date).getTime()) / 86400000) })
    }
    for (const { subject, chapter, daysSince, retention } of decayData.items) {
      if (daysSince <= 21 || retention >= 60) continue
      entries.push({ id: `memory-${chapter.id}`, subject, chapterName: chapter.name, errorType: 'Memory Loss', difficulty: daysSince > 60 ? 'HARD' : 'EASY', daysAgo: daysSince })
    }
    entries.sort((a, b) => a.daysAgo - b.daysAgo)
    return entries.slice(0, 8)
  }, [decayData, tests])

  const miniStats = useMemo(() => {
    const mins = sessions.filter(s => s.duration > 0).map(s => s.duration)
    return {
      avgReviewTime: mins.length > 0 ? Math.round(mins.reduce((a, b) => a + b, 0) / mins.length) : 0,
      mistakesFixed: backlogItems.filter(b => b.clearedAt).length,
      avgRetention: decayData.items.length > 0 ? Math.round(decayData.items.reduce((a, b) => a + b.retention, 0) / decayData.items.length) : 0,
    }
  }, [sessions, backlogItems, decayData])

  /* ── Recommendations (existing) ── */
  interface RecItem { subject: Subject; chapter: Chapter; priorityScore: number; daysSinceStudy: number; reason: string; tasks: { label: string; duration: string }[] }
  const todayRecommendations = useMemo(() => {
    const undone = allChaptersRaw.filter(({ chapter }) => { const p = progress[chapter.id]; return !p || p.status !== 'done' })
    if (undone.length === 0) return []
    const scored = undone.map(({ subject, chapter }) => {
      const p = progress[chapter.id]
      const daysSinceStudy = p?.lastRevised ? Math.round((today.getTime() - new Date(p.lastRevised).getTime()) / 86400000) : 30
      const weightageScore = chapter.weightage === 'high' ? 10 : chapter.weightage === 'medium' ? 5 : 2
      const gapScore = Math.min(10, daysSinceStudy)
      const progressScore = p ? Math.round((Object.values(p.topicStatus).filter(Boolean).length / Math.max(1, chapter.topics.length)) * 10) : 0
      return { subject, chapter, priorityScore: weightageScore + gapScore + (10 - progressScore), daysSinceStudy }
    })
    const bySubject = new Map<Subject, typeof scored[0]>()
    for (const s of scored) { const e = bySubject.get(s.subject); if (!e || s.priorityScore > e.priorityScore) bySubject.set(s.subject, s) }
    const perSubject = Array.from(bySubject.values()).sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 2)
    if (perSubject.length === 0) return []
    return perSubject.map((top): RecItem => {
      const hoursPer = Math.ceil(estimateHours(top.chapter) / 2)
      const isShort = availableHours <= 2 || perSubject.length > 1
      const tasks = isShort ? [{ label: 'Theory revision', duration: `${Math.min(45, hoursPer * 30)} min` }] : [{ label: 'Theory', duration: `${Math.min(45, hoursPer * 25)} min` }, { label: 'PYQs', duration: `${Math.min(30, hoursPer * 15)} min` }]
      return { subject: top.subject, chapter: top.chapter, priorityScore: top.priorityScore, daysSinceStudy: top.daysSinceStudy, tasks, reason: top.daysSinceStudy >= 7 ? `Not studied for ${top.daysSinceStudy} days. ${top.chapter.weightage} weightage.` : `${top.chapter.weightage} weightage · ${getChapterProgress(top.chapter).pct}% complete.` }
    })
  }, [progress, availableHours])

  const priorityChapters = useMemo(() => {
    const scored = allChaptersRaw.filter(({ chapter }) => { const p = progress[chapter.id]; return !p || p.status !== 'done' }).map(({ subject, chapter }) => {
      const p = progress[chapter.id]; const daysSince = p?.lastRevised ? Math.round((today.getTime() - new Date(p.lastRevised).getTime()) / 86400000) : 30
      const weightScore = chapter.weightage === 'high' ? 10 : chapter.weightage === 'medium' ? 5 : 2
      const gapScore = Math.min(10, daysSince)
      const topicArr = chapter.topics.filter(t => !t.deleted); const doneTopics = p ? topicArr.filter(t => p.topicStatus[t.id]).length : 0
      const weakScore = p ? 10 - Math.round((doneTopics / Math.max(1, topicArr.length)) * 10) : 10
      return { subject, chapter, score: weightScore + gapScore + weakScore, daysSince }
    })
    const bySubject = new Map<Subject, typeof scored[0][]>()
    for (const item of scored) { const list = bySubject.get(item.subject); if (list) list.push(item); else bySubject.set(item.subject, [item]) }
    const result: typeof scored = []
    bySubject.forEach(items => { items.sort((a, b) => b.score - a.score); result.push(...items.slice(0, 2)) })
    result.sort((a, b) => b.score - a.score)
    return result.slice(0, 6)
  }, [progress])

  const revisionSuggestions = useMemo(() => {
    const needingRevision = allChaptersRaw.filter(({ chapter }) => {
      const p = progress[chapter.id]; if (!p || p.status !== 'done') return false
      const lastRev = p.lastRevised ? new Date(p.lastRevised) : null; if (!lastRev) return true
      return Math.round((today.getTime() - lastRev.getTime()) / 86400000) >= 7
    }).map(({ subject, chapter }) => {
      const p = progress[chapter.id]; const daysSinceRev = p?.lastRevised ? Math.round((today.getTime() - new Date(p.lastRevised).getTime()) / 86400000) : 30
      return { subject, chapter, daysSinceRev, retention: retentionPercent(daysSinceRev) }
    })
    if (needingRevision.length === 0) return []
    const bySubject = new Map<Subject, typeof needingRevision[0]>()
    const rest: typeof needingRevision = []
    for (const item of needingRevision) { if (!bySubject.has(item.subject)) bySubject.set(item.subject, item); else rest.push(item) }
    const result = Array.from(bySubject.values())
    rest.sort((a, b) => b.daysSinceRev - a.daysSinceRev); result.push(...rest)
    return result.slice(0, 6)
  }, [progress])

  const dailyPlan = useMemo(() => {
    if (todayRecommendations.length === 0) return null
    const plan: { time: string; label: string; duration: string }[] = []; let currentHour = 9
    for (const rec of todayRecommendations) {
      const hours = estimateHours(rec.chapter)
      const sub = rec.subject.charAt(0).toUpperCase() + rec.subject.slice(1)
      const slots = [{ label: `${sub} — ${rec.chapter.name} Theory`, duration: Math.min(60, hours * 20) }, { label: `${sub} PYQs`, duration: Math.min(45, hours * 15) }]
      for (const slot of slots) {
        const startH = Math.floor(currentHour); const startM = Math.round((currentHour - startH) * 60)
        const endH = Math.floor(currentHour + slot.duration / 60); const endM = Math.round(((currentHour + slot.duration / 60) - endH) * 60)
        plan.push({ time: `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}–${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`, label: slot.label, duration: `${slot.duration}m` })
        currentHour += slot.duration / 60 + 0.083
      }
      currentHour += 0.5
    }
    return plan
  }, [todayRecommendations])

  const dataLoaded = progressLoaded && gamificationLoaded && !aiLoading

  function RetentionBar({ retention, h }: { retention: number; h: number }) {
    const c = retention < 50 ? 'var(--c-red)' : retention < 70 ? 'var(--c-orange)' : 'var(--c-green)'
    return (
      <div className="flex flex-col items-center gap-1.5 flex-1">
        <div className="w-full rounded-lg relative overflow-hidden" style={{ height: h, background: 'var(--c-tag)', border: '1px solid var(--c-border-card)' }}>
          <div className="absolute bottom-0 w-full transition-all duration-700 rounded-t-sm" style={{ height: `${retention}%`, background: c, opacity: 0.8 }} />
        </div>
        <span className="text-[11px] font-semibold" style={{ color: 'var(--c-text)' }}>{retention}%</span>
      </div>
    )
  }

  const skeleton = (i: number) => (
    <div key={i} className="card-base p-5 animate-pulse space-y-3">
      <div className="h-3 w-24 rounded" style={{ background: 'var(--c-progress-bg)' }} />
      <div className="h-4 w-40 rounded" style={{ background: 'var(--c-progress-bg)' }} />
      <div className="h-8 rounded-lg" style={{ background: 'var(--c-progress-bg)' }} />
    </div>
  )

  const proContent = (
    <div className="px-4 md:px-8 lg:px-10 pt-[17px] pb-6 overflow-x-hidden" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[clamp(24px,3vw,32px)] font-medium tracking-[-0.5px] mb-1" style={{ color: 'var(--c-text)' }}>
            {getGreeting()}, <span style={{ color: 'var(--c-blue)' }}>{user?.name || settings.name || 'Student'}</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--c-muted)' }}>{daysRemaining} days until JEE Main · {overallStats.pct}% syllabus done</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--c-green)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--c-green)] animate-pulse" />LIVE TRACKING ACTIVE
        </div>
      </div>

      {!dataLoaded ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map(skeleton)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-3 mb-8">
            <div className="col-span-12 sm:col-span-6 lg:col-span-4 card-base p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(16,185,129,0.1)' }}><Target size={22} style={{ color: 'var(--c-green)' }} /></div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>Current Mastery</span>
                  <button onClick={() => setInfoSection('mastery')} className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>{overallStats.pct}%</p>
                <div className="w-full h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: 'var(--c-progress-bg)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${overallStats.pct}%`, background: 'var(--c-green)' }} />
                </div>
              </div>
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-4 card-base p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,0.1)' }}><AlertCircle size={22} style={{ color: 'var(--c-red)' }} /></div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>Backlog Risk</span>
                  <button onClick={() => setInfoSection('backlog_risk')} className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>{decayData.urgent} <span className="text-sm font-normal" style={{ color: 'var(--c-muted)' }}>Topics</span></p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--c-muted)' }}>Critical topics needing immediate retrieval</p>
              </div>
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-4 card-base p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.1)' }}><Zap size={22} style={{ color: 'var(--c-blue)' }} /></div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>Active Recall</span>
                  <button onClick={() => setInfoSection('recall')} className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>{currentStreak}d <span className="text-sm font-normal" style={{ color: 'var(--c-muted)' }}>Streak</span></p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--c-muted)' }}>{overallStats.chaptersDone}/{overallStats.chaptersTotal} chapters done</p>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8 card-base p-5">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>Topic Decay Analysis</h3>
                    <button onClick={() => setInfoSection('decay')} className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                  </div>
                  <p className="text-[12px]" style={{ color: 'var(--c-muted)' }}>Ebbinghaus forgetting curve for your active topics</p>
                </div>
                {decayData.urgent > 0 && <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--c-red)', border: '1px solid rgba(239,68,68,0.2)' }}>URGENT: {decayData.urgent} TOPIC{decayData.urgent > 1 ? 'S' : ''}</span>}
              </div>
              {decayData.items.length === 0 ? (
                <div className="py-8 text-center"><p className="text-sm" style={{ color: 'var(--c-muted)' }}>No chapter data yet. Start studying to see your forgetting curve.</p></div>
              ) : (
                <>
                  <div className="flex items-end justify-between gap-2 px-2 h-48 mb-2">
                    {decayData.items.map((item) => <RetentionBar key={item.chapter.id} retention={item.retention} h={160} />)}
                  </div>
                  <div className="flex justify-between px-1">
                    {decayData.items.map((item) => <span key={item.chapter.id} className="text-[9px] font-medium text-center flex-1 truncate px-0.5" style={{ color: 'var(--c-caption)' }}>{item.chapter.name}</span>)}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--c-border)' }}>
                    <div className="flex items-center gap-3 text-[10px] font-medium">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--c-red)' }} /> Revision Needed</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--c-green)' }} /> Strong Retention</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-4 card-base p-5 flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>Subject Performance</h3>
                <button onClick={() => setInfoSection('subject_perf')} className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
              </div>
              <p className="text-[12px] mb-4" style={{ color: 'var(--c-muted)' }}>{tests.length > 0 ? `From ${tests.length} test${tests.length > 1 ? 's' : ''}` : 'No tests logged yet'}</p>
              <div className="flex-1 flex flex-col justify-center gap-4">
                {SUBJECTS.map(sub => {
                  const perf = subjectPerformance[sub]
                  const trend = perf.trend === 'up' ? <TrendingUp size={14} className="text-[var(--c-green)]" /> : perf.trend === 'down' ? <TrendingDown size={14} className="text-[var(--c-red)]" /> : null
                  return (
                    <div key={sub}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>{SUBJECT_LABELS[sub]}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-medium" style={{ color: 'var(--c-text)' }}>{perf.testCount > 0 ? `${perf.avgAccuracy}%` : '—'}</span>
                          {perf.testCount > 0 && trend}
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-progress-bg)' }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${perf.avgAccuracy}%`, background: SUBJECT_COLORS[sub] }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              {overallTestScore && (
                <div className="mt-4 pt-3 text-center" style={{ borderTop: '1px solid var(--c-border)' }}>
                  <p className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>{overallTestScore.latestScore}<span className="text-sm font-normal" style={{ color: 'var(--c-muted)' }}>/{overallTestScore.latestTotal}</span></p>
                  <p className="text-[11px]" style={{ color: 'var(--c-muted)' }}>Last Mock · <span className="font-medium" style={{ color: 'var(--c-blue)' }}>{overallTestScore.latestPct}%</span></p>
                </div>
              )}
            </div>

            <div className="col-span-12 card-base overflow-hidden">
              <div className="flex items-center justify-between p-5 pb-4 flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>The Mistake Log</h3>
                    <button onClick={() => setInfoSection('mistakes')} className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                  </div>
                  <p className="text-[12px]" style={{ color: 'var(--c-muted)' }}>Errors detected from tests and retention analysis</p>
                </div>
              </div>
              {mistakeLog.length === 0 ? (
                <div className="py-8 text-center px-5"><p className="text-sm" style={{ color: 'var(--c-muted)' }}>No mistakes logged yet. Complete tests and chapters to see patterns here.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: 'var(--c-tag)' }}>
                      <th className="text-[10px] font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--c-caption)' }}>Topic</th>
                      <th className="text-[10px] font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--c-caption)' }}>Subject</th>
                      <th className="text-[10px] font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--c-caption)' }}>Error Type</th>
                      <th className="text-[10px] font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--c-caption)' }}>Difficulty</th>
                      <th className="text-[10px] font-semibold uppercase tracking-wider px-5 py-3 text-right" style={{ color: 'var(--c-caption)' }}>Action</th>
                    </tr></thead>
                    <tbody>
                      {mistakeLog.map((m) => {
                        const c = m.errorType === 'Conceptual' ? 'var(--c-red)' : m.errorType === 'Calculation' ? 'var(--c-orange)' : 'var(--c-blue)'
                        const dc = m.difficulty === 'HARD' ? 'var(--c-red)' : m.difficulty === 'MEDIUM' ? 'var(--c-orange)' : 'var(--c-green)'
                        const db = m.difficulty === 'HARD' ? 'rgba(239,68,68,0.1)' : m.difficulty === 'MEDIUM' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)'
                        return (
                          <tr key={m.id} className="transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]" style={{ borderTop: '1px solid var(--c-border-card)' }}>
                            <td className="px-5 py-3.5"><span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{m.chapterName}</span></td>
                            <td className="px-5 py-3.5"><span className="text-[11px] font-medium" style={{ color: SUBJECT_COLORS[m.subject] }}>{SUBJECT_LABELS[m.subject]}</span></td>
                            <td className="px-5 py-3.5"><span className="flex items-center gap-1 text-xs" style={{ color: c }}><AlertCircle size={12} /> {m.errorType}</span></td>
                            <td className="px-5 py-3.5"><span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: db, color: dc, border: `1px solid ${dc}20` }}>{m.difficulty}</span></td>
                            <td className="px-5 py-3.5 text-right">
                              <button className="text-[11px] font-medium px-3 py-1 rounded-[40px] transition-all hover:opacity-80" style={{ background: 'var(--c-tag)', color: 'var(--c-blue)' }}
                                onClick={() => incrementRevision(allChaptersRaw.find(c => c.chapter.name === m.chapterName)?.chapter.id || '')}>Review</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="col-span-12 sm:col-span-4 card-base p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.1)' }}><Clock size={20} style={{ color: 'var(--c-blue)' }} /></div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>Avg Review Time</span>
                  <button onClick={() => setInfoSection('avg_time')} className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                </div>
                <p className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>{miniStats.avgReviewTime}<span className="text-sm font-normal" style={{ color: 'var(--c-muted)' }}> min</span></p>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-4 card-base p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(16,185,129,0.1)' }}><CheckCircle2 size={20} style={{ color: 'var(--c-green)' }} /></div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>Mistakes Fixed</span>
                  <button onClick={() => setInfoSection('mistakes_fixed')} className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                </div>
                <p className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>{miniStats.mistakesFixed.toLocaleString()}</p>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-4 card-base p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(245,158,11,0.1)' }}><RefreshCw size={20} style={{ color: 'var(--c-orange)' }} /></div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>Recall Accuracy</span>
                  <button onClick={() => setInfoSection('recall_acc')} className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                </div>
                <p className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>{miniStats.avgRetention}%</p>
              </div>
            </div>
          </div>

          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>
                <span className="material-symbols-rounded text-[20px] align-text-bottom mr-1.5" style={{ color: 'var(--c-blue)' }}>auto_awesome</span>Today&apos;s Recommendation
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[11px]" style={{ color: 'var(--c-caption)' }}>Time:</span>
                <select value={availableHours} onChange={e => setAvailableHours(Number(e.target.value))} className="text-xs px-2 py-1 rounded-[8px] outline-none text-[var(--c-text)] bg-[var(--c-input)] border border-[var(--c-border-input)]">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(h => <option key={h} value={h}>{h}h</option>)}
                </select>
              </div>
            </div>
            {aiLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="rounded-[18px] p-5 animate-pulse" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full" style={{ background: 'var(--c-progress-bg)' }} />
                      <div className="flex-1 space-y-2"><div className="h-3 w-20 rounded" style={{ background: 'var(--c-progress-bg)' }} /><div className="h-4 w-48 rounded" style={{ background: 'var(--c-progress-bg)' }} /></div>
                    </div>
                    <div className="flex gap-2"><div className="h-7 w-24 rounded-[10px]" style={{ background: 'var(--c-progress-bg)' }} /><div className="h-7 w-20 rounded-[10px]" style={{ background: 'var(--c-progress-bg)' }} /></div>
                  </div>
                ))}
              </div>
            ) : todayRecommendations.length > 0 ? (
              <div className="space-y-3">
                {todayRecommendations.map((rec, idx) => (
                  <div key={rec.chapter.id} className="rounded-[18px] p-5 transition-all hover:-translate-y-[0.5px]" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)', borderLeft: `4px solid ${SUBJECT_COLORS[rec.subject]}` }}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'var(--c-tag)' }}>{SUBJECT_EMOJIS[rec.subject]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold capitalize" style={{ color: 'var(--c-text)' }}>{rec.subject}</span>
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full" style={{ background: `${SUBJECT_COLORS[rec.subject]}20`, color: SUBJECT_COLORS[rec.subject] }}>{rec.chapter.weightage} wt.</span>
                          {idx === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(224,62,62,0.1)', color: 'var(--c-red)' }}>Top Priority</span>}
                        </div>
                        <h3 className="text-lg font-bold" style={{ color: 'var(--c-text)' }}>{rec.chapter.name}</h3>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[11px] font-medium" style={{ color: 'var(--c-blue)' }}>{getChapterProgress(rec.chapter).pct}% done</div>
                        <div className="text-[11px]" style={{ color: 'var(--c-caption)' }}>{rec.tasks.reduce((acc, t) => acc + parseInt(t.duration), 0)} min</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rec.tasks.map((task, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-medium" style={{ background: 'var(--c-tag)', color: 'var(--c-text)' }}>
                          <span>{task.label}</span><span style={{ color: 'var(--c-caption)' }}>({task.duration})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[18px] p-8 text-center" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
                <span className="material-symbols-rounded text-[40px]" style={{ color: 'var(--c-green)' }}>celebration</span>
                <p className="text-sm font-medium mt-2" style={{ color: 'var(--c-text)' }}>All caught up!</p>
                <p className="text-xs" style={{ color: 'var(--c-muted)' }}>You&apos;ve completed every chapter. Time for revision.</p>
              </div>
            )}
          </section>

          <section className="mb-8">
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--c-text)' }}>
              <span className="material-symbols-rounded text-[20px] align-text-bottom mr-1.5" style={{ color: 'var(--c-orange)' }}>priority</span>Priority Chapters
            </h2>
            <div className="space-y-2">
              {priorityChapters.map(({ subject, chapter, score, daysSince }) => {
                const priority = score >= 18 ? 'high' : score >= 12 ? 'medium' : 'low'
                const pColor = priority === 'high' ? 'var(--c-red)' : priority === 'medium' ? 'var(--c-orange)' : 'var(--c-green)'
                const pBg = priority === 'high' ? 'rgba(224,62,62,0.1)' : priority === 'medium' ? 'rgba(217,115,13,0.1)' : 'rgba(15,138,94,0.1)'
                return (
                  <div key={chapter.id} className="flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all hover:-translate-y-[0.5px]" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: SUBJECT_COLORS[subject] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>{chapter.name}</span>
                        <span className="text-[10px] capitalize" style={{ color: 'var(--c-caption)' }}>{subject}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--c-caption)' }}>
                        {daysSince >= 7 && <span style={{ color: 'var(--c-red)' }}>Not studied in {daysSince}d</span>}
                        <span>{chapter.weightage} wt.</span>
                      </div>
                    </div>
                    <div className="text-[11px] font-medium px-2 py-1 rounded-[8px]" style={{ background: pBg, color: pColor }}>{priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low'}</div>
                  </div>
                )
              })}
            </div>
          </section>

          {revisionSuggestions.length > 0 && (
            <section className="mb-8">
              <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--c-text)' }}>
                <span className="material-symbols-rounded text-[20px] align-text-bottom mr-1.5" style={{ color: 'var(--c-green)' }}>refresh</span>Revision Needed
              </h2>
              <div className="space-y-2">
                {revisionSuggestions.map(({ subject, chapter, daysSinceRev, retention }) => {
                  const color = SUBJECT_COLORS[subject]
                  return (
                    <div key={chapter.id} className="rounded-[14px] px-5 py-3.5 flex items-center gap-4 transition-all hover:-translate-y-[0.5px]" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', borderLeft: `3px solid ${color}`, boxShadow: 'var(--c-shadow)' }}>
                      <span className="text-lg flex-shrink-0">{SUBJECT_EMOJIS[subject]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{chapter.name}</span>
                          <span className="text-[10px] font-medium capitalize px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>{SUBJECT_LABELS[subject]}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--c-muted)' }}>
                          <span>Last revised <span className="font-medium" style={{ color: 'var(--c-text)' }}>{daysSinceRev} days</span> ago</span>
                          <span className="w-1 h-1 rounded-full" style={{ background: 'var(--c-border)' }} />
                          <span>Retention: <span className={`font-medium ${retention < 50 ? 'text-[var(--c-red)]' : 'text-[var(--c-orange)]'}`}>{retention}%</span></span>
                        </div>
                      </div>
                      <button onClick={() => incrementRevision(chapter.id)} className="text-[11px] font-medium px-4 py-2 rounded-[40px] text-white transition-all hover:opacity-90 active:scale-[0.97] flex-shrink-0" style={{ background: 'var(--c-btn-primary)' }}>Revise Now</button>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {dailyPlan && (
            <section className="mb-8">
              <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--c-text)' }}>
                <span className="material-symbols-rounded text-[20px] align-text-bottom mr-1.5" style={{ color: 'var(--c-blue)' }}>calendar_clock</span>Today&apos;s Schedule
              </h2>
              <div className="rounded-[18px] overflow-hidden" style={{ border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                {dailyPlan.map((slot, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5 transition-colors" style={{ background: i % 2 === 0 ? 'var(--c-card)' : 'var(--c-card-alt)', borderBottom: i < dailyPlan.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
                    <span className="text-xs font-mono font-medium w-[90px]" style={{ color: 'var(--c-blue)' }}>{slot.time}</span>
                    <span className="text-sm flex-1" style={{ color: 'var(--c-text)' }}>{slot.label}</span>
                    <span className="text-[11px]" style={{ color: 'var(--c-muted)' }}>{slot.duration}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-12 pt-6" style={{ borderTop: '1px solid var(--c-border)' }}>
            <div className="flex items-start gap-2">
              <span className="material-symbols-rounded text-[16px] flex-shrink-0" style={{ color: 'var(--c-caption)' }}>info</span>
              <p className="text-[12px]" style={{ color: 'var(--c-caption)', lineHeight: 1.7 }}>
                AI can make mistakes.{' '}
                <button onClick={() => setShowDisclaimer(true)} className="underline hover:opacity-80" style={{ color: 'var(--c-blue)' }}>Learn more</button>
                <br />Recommendations are generated using your study data and estimated progress. Always use your own judgment and adjust your schedule if needed.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  )

  const proGateContent = !isPro ? (
    <div className="px-4 md:px-8 lg:px-10 pt-[17px] pb-6 overflow-x-hidden" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any }}>
      <div className="flex items-center gap-1.5 text-sm mb-6" style={{ color: 'var(--c-muted)' }}>
        <span className="material-symbols-rounded text-[18px]">arrow_back</span>Back to AI Assistant
      </div>
      <div className="rounded-[18px] p-5 mb-6" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
        <div className="h-5 w-48 rounded bg-[var(--c-progress-bg)] animate-pulse mb-3" />
        <div className="h-4 w-64 rounded bg-[var(--c-progress-bg)] animate-pulse mb-2" />
        <div className="h-4 w-40 rounded bg-[var(--c-progress-bg)] animate-pulse" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <div className="h-4 w-20 rounded bg-[var(--c-progress-bg)] animate-pulse mb-2" />
            <div className="h-5 w-36 rounded bg-[var(--c-progress-bg)] animate-pulse mb-3" />
            <div className="h-8 rounded-[10px] bg-[var(--c-progress-bg)] animate-pulse" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 10 }}>
        <div className="text-center px-6">
          <div className="text-3xl mb-3">🤖</div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: '#fff' }}>Pro Feature</h2>
          <p className="text-sm mb-5 max-w-[280px] mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>Upgrade to Pro for personalized study recommendations, AI-powered analytics, daily study schedules, and more.</p>
          <div className="flex flex-col items-center gap-2.5">
            <button onClick={() => router.push('/pricing')} className="w-full max-w-[200px] flex items-center justify-center gap-1.5 text-sm font-medium px-5 py-2.5 rounded-[40px] text-white transition-opacity hover:opacity-90" style={{ background: 'var(--c-blue)' }}>Buy Pro</button>
            <button onClick={() => router.push('/dashboard')} className="text-xs font-medium transition-opacity hover:opacity-80" style={{ color: 'rgba(255,255,255,0.7)' }}>Go to Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg)' }}>
        <Sidebar />
        <TopBar />
        <MobileBottomNav />
        {userLoading ? (
          <div className="flex items-center justify-center py-24" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any }}>
            <div className="w-6 h-6 border-2 border-[var(--c-blue)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isPro ? proContent : <div className="relative min-h-[70vh]">{proGateContent}</div>}
      </div>
      {infoSection && <InfoPopup section={infoSection} onClose={() => setInfoSection(null)} />}
      {showBeta && <BetaPopup onAcknowledge={handleBetaAcknowledge} />}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowDisclaimer(false)}>
          <div className="max-w-md mx-4 rounded-[18px] p-6 animate-scale-in" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow-hover)' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-3" style={{ color: 'var(--c-text)' }}>How AI Recommendations Work</h3>
            <div className="space-y-3 text-[13px] leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>
              <p>Our AI analyzes your study data to generate personalized recommendations. Here&apos;s what it considers:</p>
              <ul className="space-y-1.5 pl-4" style={{ listStyle: 'disc' }}>
                <li>Your study history and chapter completion data</li>
                <li>Estimated chapter duration based on topic count and weightage</li>
                <li>Revision gaps — how long since you last studied each chapter</li>
                <li>Your exam date and remaining days</li>
                <li>Chapter weightage in JEE</li>
                <li>Your available study time today</li>
              </ul>
              <p>Recommendations may change as new data is collected. Future versions will become more accurate with additional data points including mock test performance and question-level analysis.</p>
              <Link href="/ai-policies" className="inline-block text-sm font-medium underline" style={{ color: 'var(--c-blue)' }} onClick={() => setShowDisclaimer(false)}>View AI Policies →</Link>
            </div>
            <button onClick={() => setShowDisclaimer(false)} className="mt-5 w-full py-2.5 text-sm font-semibold rounded-[40px] text-white" style={{ background: 'var(--c-btn-primary)' }}>Got it</button>
          </div>
        </div>
      )}
    </>
  )
}
