'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { usePYQStore } from '@/store/pyqStore'
import { useCloudQuestions, useCloudMockQuestions } from '@/hooks/useCloudQuestions'
import { ALL_PYQS, getPYQsByChapter, MOCK_TESTS, CHAPTER_NAMES } from '@/data/pyqs'
import syllabusData from '@/data/syllabus.json'
import type { Subject } from '@/types'
import type { PYQAttempt } from '@/types'
import { formatDate } from '@/lib/utils'
import { db } from '@/lib/db'

const syllabus = syllabusData as unknown as { physics: { divisions: { chapters: { id: string; name: string }[] }[] }; chemistry: { divisions: { chapters: { id: string; name: string }[] }[] }; maths: { divisions: { chapters: { id: string; name: string }[] }[] } }

const PYQ_INFO_DATA: Record<string, { title: string; body: string }> = {
  questions_solved: { title: 'How Questions Solved is counted', body: 'Total number of PYQ questions you\'ve attempted (correct + wrong). Each attempt on a question increments this counter by one.' },
  accuracy: { title: 'How Overall Accuracy is calculated', body: 'Accuracy = (correct answers ÷ total answered) × 100. Only answered questions count — skipped questions are excluded. A higher percentage means better performance.' },
  mock_tests: { title: 'How Mock Test stats are calculated', body: 'Total count of mock tests completed. Average accuracy is the mean accuracy across all tests. Best score is your highest percentage-based score.' },
  bookmarked: { title: 'How Bookmarks work', body: 'Questions you\'ve bookmarked for future review. Toggle the bookmark icon while viewing a question to add or remove it from this list.' },
  subject_perf: { title: 'How Subject Performance is calculated', body: 'Average accuracy across all PYQ attempts for each subject. Higher accuracy indicates stronger command of that subject\'s chapters.' },
  chapter_solved: { title: 'How Chapters Solved per subject works', body: 'Breakdown of questions attempted per chapter across all subjects. Shows correct vs wrong counts and per-chapter accuracy percentage.' },
  mock_trend: { title: 'How Mock Test Trend works', body: 'Shows accuracy trend for your last 7 mock tests. Each bar represents one test. Green = 70%+, Orange = 40–70%, Red = below 40%.' },
  mistakes: { title: 'How Recent Mistakes are tracked', body: 'Your most recent wrong answers from PYQ practice. Click any mistake to jump directly to that question, review what you got wrong, and add notes for future revision.' },
}

const SUBJECTS: Subject[] = ['physics', 'chemistry', 'maths']
const SUBJECT_META: Record<Subject, { emoji: string; color: string; label: string }> = {
  physics: { emoji: '⚡', color: 'var(--c-blue)', label: 'Physics' },
  chemistry: { emoji: '🧪', color: 'var(--c-green)', label: 'Chemistry' },
  maths: { emoji: '📐', color: 'var(--c-orange)', label: 'Maths' },
}

type Tab = 'practice' | 'mock' | 'analytics'

function InfoPopup({ section, onClose }: { section: string; onClose: () => void }) {
  const data = PYQ_INFO_DATA[section]
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

export default function PYQPage() {
  const { attempts, mockResults, loaded, load, recordAttempt, recordMockResult, toggleBookmark, getStats, getSubjectStats, getChapterwiseCount, getMockStats, getRecentMistakes, updateNotes } = usePYQStore()
  const [tab, setTab] = useState<Tab>('practice')
  const [subject, setSubject] = useState<Subject>('physics')
  const [chapterId, setChapterId] = useState('')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  // Info popup state
  const [infoSection, setInfoSection] = useState<string | null>(null)

  // Mock test state
  const [mockTestId, setMockTestId] = useState('')
  const [mockStarted, setMockStarted] = useState(false)
  const [mockFinished, setMockFinished] = useState(false)
  const [mockAnswers, setMockAnswers] = useState<Record<string, number>>({})
  const [mockResult, setMockResult] = useState<{ correct: number; wrong: number; skipped: number; accuracy: number } | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(180 * 60)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const chapters = useMemo(() => {
    const all: { id: string; name: string }[] = []
    const divs = (syllabus as any)[subject].divisions
    for (const d of divs) {
      for (const ch of d.chapters) {
        if (!ch.deleted) all.push({ id: ch.id, name: ch.name })
      }
    }
    return all
  }, [subject])

  // Notes state for current question
  const [noteText, setNoteText] = useState('')

  // Navigate to a specific mistake from analytics
  const navigateToMistake = useCallback((m: PYQAttempt) => {
    setSubject(m.subject)
    setChapterId(m.chapterId)
    setCurrentIdx(0)
    setSelectedAnswer(m.options?.indexOf(m.userAnswer || '') ?? null)
    setShowResult(true)
    setShowAnswers(true)
    setNoteText(m.notes || '')
    setTab('practice')
  }, [])

  useEffect(() => { load() }, [load])

  // Handle navigation from AI error hub
  useEffect(() => {
    const stored = sessionStorage.getItem('pyq_navigate_mistake')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.subject && data.chapterName) {
          setSubject(data.subject as Subject)
          const ch = chapters.find(c => c.name === data.chapterName)
          if (ch) setChapterId(ch.id)
          setTab('practice')
        }
      } catch {}
      sessionStorage.removeItem('pyq_navigate_mistake')
    }
  }, [chapters])

  const currentChapter = chapters.find(c => c.id === chapterId)
  const { questions, source: cloudSource } = useCloudQuestions(tab === 'practice' ? subject : undefined, tab === 'practice' ? chapterId : undefined)
  const currentQ = questions[currentIdx]

  const currentAttempt = currentQ ? attempts.find(a => a.question === currentQ.question && (a.status === 'wrong' || a.status === 'correct')) : null

  useEffect(() => {
    if (currentAttempt) setNoteText(currentAttempt.notes || '')
  }, [currentAttempt, currentIdx])

  const saveNote = useCallback(async () => {
    if (currentAttempt) await updateNotes(currentAttempt.id, noteText)
  }, [currentAttempt, noteText, updateNotes])

  // Mock test questions — use cloud-backed hook
  const currentMock = useMemo(() => MOCK_TESTS.find(m => m.id === mockTestId), [mockTestId])
  const { questions: mockQuestions } = useCloudMockQuestions(mockTestId)

  const stats = getStats()
  const subjectStats = getSubjectStats(subject)
  const chapterStats = getChapterwiseCount()
  const mockStats = getMockStats()
  const mistakes = getRecentMistakes()

  // Timer for mock tests — use ref to avoid stale closure
  useEffect(() => {
    if (mockStarted && !mockFinished && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(t => {
          if (t <= 1) {
            clearInterval(timerRef.current!)
            handleMockSubmitRef.current()
            return 0
          }
          return t - 1
        })
      }, 1000)
      return () => clearInterval(timerRef.current!)
    }
  }, [mockStarted, mockFinished])

  const handleAnswer = (idx: number) => {
    if (showResult) return
    setSelectedAnswer(idx)
    setShowResult(true)
    if (currentQ) {
      const status = idx === currentQ.correctOptionIndex ? 'correct' as const : 'wrong' as const
      recordAttempt({
        year: currentQ.year,
        session: currentQ.session,
        subject: currentQ.subject,
        chapterId: currentQ.chapterId,
        chapterName: currentQ.chapterName,
        question: currentQ.question,
        options: currentQ.options,
        correctAnswer: currentQ.options[currentQ.correctOptionIndex],
        userAnswer: currentQ.options[idx],
        status,
      })
    }
    // Check if already bookmarked when showing result
    const alreadyBookmarked = attempts.some(a => a.question === currentQ?.question && a.status === 'bookmarked')
    setBookmarked(alreadyBookmarked)
  }

  const handleBookmark = () => {
    if (!currentQ) return
    const existing = attempts.find(a => a.question === currentQ.question)
    if (existing) {
      toggleBookmark(existing.id)
    } else {
      recordAttempt({
        year: currentQ.year,
        session: currentQ.session,
        subject: currentQ.subject,
        chapterId: currentQ.chapterId,
        chapterName: currentQ.chapterName,
        question: currentQ.question,
        options: currentQ.options,
        correctAnswer: currentQ.options[currentQ.correctOptionIndex],
        status: 'bookmarked',
      })
    }
    setBookmarked(!bookmarked)
  }

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1)
    }
    setSelectedAnswer(null)
    setShowResult(false)
    setShowAnswers(false)
  }

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1)
    }
    setSelectedAnswer(null)
    setShowResult(false)
    setShowAnswers(false)
  }

  const resetQuestion = () => {
    setCurrentIdx(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setShowAnswers(false)
    setChapterId('')
  }

  // Mock test handlers
  const startMock = (id: string) => {
    window.open(`/mock-test/${id}`, '_blank')
  }

  const handleMockAnswer = (qId: string, optIdx: number) => {
    setMockAnswers(prev => ({ ...prev, [qId]: optIdx }))
  }

  const handleMockSubmit = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    const total = mockQuestions.length
    let correct = 0
    let wrong = 0
    const subjectBreak: Record<string, { total: number; correct: number; wrong: number; skipped: number }> = {}
    for (const q of mockQuestions) {
      if (!subjectBreak[q.subject]) subjectBreak[q.subject] = { total: 0, correct: 0, wrong: 0, skipped: 0 }
      subjectBreak[q.subject].total++
      const ans = mockAnswers[q.id]
      if (ans === undefined) {
        subjectBreak[q.subject].skipped++
      } else if (ans === q.correctOptionIndex) {
        correct++
        subjectBreak[q.subject].correct++
      } else {
        wrong++
        subjectBreak[q.subject].wrong++
      }
    }
    const answered = correct + wrong
    const skipped = total - answered
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0
    const score = Math.round((correct / total) * 100)
    setMockResult({ correct, wrong, skipped, accuracy })

    // Record each answer as attempt
    for (const q of mockQuestions) {
      const ans = mockAnswers[q.id]
      if (ans !== undefined) {
        recordAttempt({
          year: q.year,
          session: q.session,
          subject: q.subject,
          chapterId: q.chapterId,
          chapterName: q.chapterName,
          question: q.question,
          options: q.options,
          correctAnswer: q.options[q.correctOptionIndex],
          userAnswer: q.options[ans],
          status: ans === q.correctOptionIndex ? 'correct' : 'wrong',
          mockTestId: currentMock?.id,
        })
      }
    }

    // Save mock result
    recordMockResult({
      testId: currentMock?.id || '',
      testName: currentMock?.name || '',
      year: currentMock?.year || 2026,
      session: currentMock?.session || '',
      timeTaken: currentMock ? (currentMock.durationMinutes * 60 - timeRemaining) : 0,
      totalQuestions: total,
      answered,
      correct,
      wrong,
      skipped,
      score,
      accuracy,
      subjectBreakdown: Object.entries(subjectBreak).map(([sub, s]) => ({
        subject: sub as Subject,
        ...s,
      })),
      answers: mockQuestions.map(q => ({
        questionId: q.id,
        selectedOption: mockAnswers[q.id] ?? -1,
        correct: mockAnswers[q.id] === q.correctOptionIndex,
      })),
    })

    setMockFinished(true)
  }, [mockQuestions, mockAnswers, currentMock, recordAttempt, recordMockResult, timeRemaining])

  const handleMockSubmitRef = useRef(handleMockSubmit)
  handleMockSubmitRef.current = handleMockSubmit

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h}h ${m}m ${sec}s`
  }

  const answeredCount = Object.keys(mockAnswers).length
  const totalMockQ = mockQuestions.length

  // Chapter practice stats
  const thisChapterStats = chapterStats.find(c => c.chapterId === chapterId)

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--c-bg)' }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--c-border)', borderTopColor: 'var(--c-blue)' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />
      <div className="px-4 md:px-8 lg:px-10 pt-[17px] pb-6 overflow-x-hidden relative" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>

        {/* ─── Header ─── */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3" data-tour="tour-pyq">
          <div>
            <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px]" style={{ color: 'var(--c-text)' }}>📝 PYQ & Mock Tests</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--c-muted)' }}>JEE Main 2024–2026 — chapter-wise & full-length mock tests</p>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="flex gap-1 mb-5 rounded-[14px] p-1" style={{ background: 'var(--c-tag)', display: 'inline-flex' }}>
          {[
            { id: 'practice' as Tab, label: '📖 Practice' },
            { id: 'mock' as Tab, label: '📝 Mock Tests' },
            { id: 'analytics' as Tab, label: '📊 Analytics' },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setMockStarted(false); setMockFinished(false); setMockResult(null) }}
              className={`px-4 py-1.5 text-xs font-medium rounded-[10px] transition-all ${tab === t.id ? 'shadow-sm' : ''}`}
              style={{
                background: tab === t.id ? 'var(--c-card)' : 'transparent',
                color: tab === t.id ? 'var(--c-text)' : 'var(--c-muted)',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: PRACTICE */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'practice' && (
          chapterId ? (
            /* Full-screen question view when chapter is selected */
            <div className="w-full">
              {currentQ ? (
                <div className="rounded-[18px] px-5 py-5 md:px-6 md:py-6" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                  {/* Back button + meta bar */}
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <button onClick={resetQuestion}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-black/[0.05] dark:hover:bg-white/[0.1]"
                        style={{ color: 'var(--c-muted)' }}
                        title="Back to chapters"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${SUBJECT_META[subject].color}15`, color: SUBJECT_META[subject].color }}>
                        {SUBJECT_META[subject].label}
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--c-caption)' }}>{currentChapter?.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--c-tag)', color: 'var(--c-muted)' }}>
                        {currentQ.year} {currentQ.session}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {thisChapterStats && (
                        <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>
                          ✅{thisChapterStats.correct} ❌{thisChapterStats.total - thisChapterStats.correct}
                        </span>
                      )}
                      <button onClick={handleBookmark} className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-black/[0.05] dark:hover:bg-white/[0.1]"
                        style={{ color: bookmarked ? 'var(--c-orange)' : 'var(--c-muted)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                      </button>
                      <span className="text-[11px] font-medium" style={{ color: 'var(--c-muted)' }}>{currentIdx + 1}/{questions.length}</span>
                    </div>
                  </div>

                  {/* Question */}
                  <p className="text-sm font-medium mb-5 leading-relaxed" style={{ color: 'var(--c-text)' }}>{currentQ.question}</p>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, idx) => {
                      const isCorrect = idx === currentQ.correctOptionIndex
                      const isWrong = showResult && idx === selectedAnswer && idx !== currentQ.correctOptionIndex
                      return (
                        <button key={idx} onClick={() => handleAnswer(idx)} disabled={showResult && !showAnswers}
                          className="w-full text-left text-xs md:text-sm px-4 py-3 rounded-[14px] transition-all flex items-center gap-3"
                          style={{
                            border: isCorrect && showAnswers ? '2px solid var(--c-green)' : showResult && isWrong ? '2px solid var(--c-red)' : '1px solid var(--c-border-input)',
                            color: isCorrect && showAnswers ? 'var(--c-green)' : showResult && isWrong ? 'var(--c-red)' : 'var(--c-text-secondary)',
                            background: isCorrect && showAnswers ? 'rgba(15,138,94,0.08)' : showResult && isWrong ? 'rgba(224,62,62,0.08)' : 'transparent',
                            cursor: showResult && !showAnswers ? 'default' : 'pointer',
                            opacity: showResult && !showAnswers && idx !== selectedAnswer ? 0.5 : 1,
                          }}
                        >
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={{
                              background: isCorrect && showAnswers ? 'var(--c-green)' : showResult && isWrong ? 'var(--c-red)' : 'var(--c-tag)',
                              color: isCorrect && showAnswers || showResult && isWrong ? '#fff' : 'var(--c-muted)',
                            }}
                          >{String.fromCharCode(65 + idx)}</span>
                          <span>{opt}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Feedback bar */}
                  <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {showResult && (
                        <span className="text-xs font-medium flex items-center gap-1" style={{ color: selectedAnswer === currentQ.correctOptionIndex ? 'var(--c-green)' : 'var(--c-red)' }}>
                          {selectedAnswer === currentQ.correctOptionIndex ? '✅ Correct!' : `❌ Wrong — ${currentQ.options[currentQ.correctOptionIndex]}`}
                        </span>
                      )}
                      {showResult && !showAnswers && (
                        <button onClick={() => setShowAnswers(true)} className="text-[10px] underline" style={{ color: 'var(--c-caption)' }}>Show answer only</button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={prevQuestion} disabled={currentIdx === 0}
                        className="text-xs font-medium px-3 py-1.5 rounded-[40px] transition-all disabled:opacity-30"
                        style={{ border: '1px solid var(--c-border)', color: 'var(--c-text-secondary)' }}
                      >← Prev</button>
                      <button onClick={nextQuestion}
                        className="text-xs font-medium px-4 py-1.5 rounded-[40px] text-white transition-all hover:-translate-y-[0.5px]"
                        style={{ background: 'var(--c-btn-primary)' }}
                      >{currentIdx < questions.length - 1 ? 'Next →' : 'Done ✓'}</button>
                    </div>
                  </div>

                  {/* Notes section — shown after answering */}
                  {showResult && currentAttempt && (
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--c-border)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>Your Notes</span>
                        <button onClick={saveNote}
                          className="text-[10px] font-medium px-2.5 py-1 rounded-[40px] text-white transition-all hover:opacity-90"
                          style={{ background: 'var(--c-btn-primary)' }}
                        >{currentAttempt.notes === noteText ? 'Save Note' : 'Save'}</button>
                      </div>
                      <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                        placeholder="Add a note about this question (what went wrong, tips, etc.)..."
                        className="w-full text-xs px-3 py-2 rounded-[12px] outline-none resize-none"
                        style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)', minHeight: '60px' }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-[18px] px-6 py-12 text-center" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-sm" style={{ color: 'var(--c-muted)' }}>No PYQs loaded for this chapter yet. Select a different chapter.</p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--c-caption)' }}>We add new questions in every update.</p>
                </div>
              )}
            </div>
          ) : (
            /* Chapter list (full width) when no chapter selected */
            <div className="w-full">
              {/* Subject tabs */}
              <div className="flex gap-2 mb-5">
                {SUBJECTS.map(s => (
                  <button key={s} onClick={() => { setSubject(s); setCurrentIdx(0); setSelectedAnswer(null); setShowResult(false) }}
                    className={`flex-1 text-xs font-medium py-2 rounded-[40px] transition-all`}
                    style={{ background: subject === s ? SUBJECT_META[s].color : 'var(--c-tag)', color: subject === s ? '#fff' : 'var(--c-muted)' }}
                  >{SUBJECT_META[s].emoji} {SUBJECT_META[s].label}</button>
                ))}
              </div>

              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>Chapters</span>
                <span className="text-[11px]" style={{ color: 'var(--c-muted)' }}>{chapterStats.filter(c => c.subject === subject).length} attempted · {ALL_PYQS.length} PYQs</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {chapters.map(ch => {
                  const chStat = chapterStats.find(c => c.chapterId === ch.id)
                  const qCount = getPYQsByChapter(ch.id).length
                  return (
                    <button key={ch.id} onClick={() => { setChapterId(ch.id); setCurrentIdx(0); setSelectedAnswer(null); setShowResult(false) }}
                      className="rounded-[18px] px-4 py-4 text-left transition-all hover:-translate-y-[1px]"
                      style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>{ch.name}</span>
                        <span className="text-[10px] shrink-0 ml-2 px-2 py-0.5 rounded-full" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>{qCount} Q</span>
                      </div>
                      {chStat ? (
                        <div className="flex items-center gap-3 text-[11px]">
                          <span style={{ color: 'var(--c-green)' }}>✅ {chStat.correct}</span>
                          <span style={{ color: 'var(--c-red)' }}>❌ {chStat.total - chStat.correct}</span>
                          <span className="font-medium" style={{ color: 'var(--c-blue)' }}>{chStat.total > 0 ? Math.round((chStat.correct / chStat.total) * 100) : 0}%</span>
                        </div>
                      ) : (
                        <p className="text-[11px]" style={{ color: 'var(--c-caption)' }}>Not started yet</p>
                      )}
                      <div className="mt-2.5 w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--c-tag)' }}>
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${chStat ? Math.round((chStat.correct / Math.max(chStat.total, 1)) * 100) : 0}%`,
                          background: SUBJECT_META[subject].color,
                        }} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: MOCK TESTS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'mock' && !mockStarted && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_TESTS.map(mt => {
                const prevResults = mockResults.filter(r => r.testId === mt.id).sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime())
                const last = prevResults.length > 0 ? prevResults[0] : null
                const qCount = mt.questionIds.length
                return (
                  <div key={mt.id} className="rounded-[18px] p-5 transition-all hover:-translate-y-[1px]" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{mt.name}</h3>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--c-caption)' }}>
                          {mt.year} {mt.session} · {qCount} questions · {mt.durationMinutes} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--c-tag)', color: 'var(--c-muted)' }}>
                        {mt.session.includes('Subject') ? 'Subject' : mt.session.includes('Practice') ? 'Practice' : 'Full Mock'}
                      </span>
                      {last && (
                        <button onClick={() => window.open(`/mock-test/${mt.id}/results`, '_blank')}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-[40px] transition-all hover:opacity-80"
                          style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--c-green)', border: '1px solid rgba(16,185,129,0.2)' }}>
                          Last: {last.score}pts · {last.accuracy}%
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {last && (
                        <button onClick={() => window.open(`/mock-test/${mt.id}/results`, '_blank')}
                          className="flex-1 text-[10px] font-medium py-2 rounded-[40px] transition-all hover:-translate-y-[0.5px]"
                          style={{ border: '1px solid var(--c-border)', color: 'var(--c-text-secondary)' }}>
                          View Result
                        </button>
                      )}
                      <button onClick={() => startMock(mt.id)}
                        className={`${last ? 'flex-1' : 'w-full'} text-xs font-medium py-2 rounded-[40px] text-white transition-all hover:-translate-y-[0.5px]`}
                        style={{ background: 'var(--c-btn-primary)' }}
                      >{prevResults.length > 0 ? 'Retake' : 'Start Test'}</button>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] mt-4 text-center" style={{ color: 'var(--c-caption)' }}>{mockResults.length} mock tests completed · {MOCK_TESTS.length} tests available</p>
          </div>
        )}

        {/* Mock test in progress */}
        {tab === 'mock' && mockStarted && !mockFinished && (
          <div>
            {/* Timer bar */}
            <div className="rounded-[18px] px-5 py-3 mb-4 flex items-center justify-between flex-wrap gap-2" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex items-center gap-3">
                <button onClick={() => { if (window.confirm('End this mock test? Your answers will be submitted.')) { handleMockSubmit() } }}
                  className="text-xs font-medium px-3 py-1 rounded-[40px]" style={{ border: '1px solid var(--c-red)', color: 'var(--c-red)' }}>
                  ← End Test
                </button>
                <span className="text-xs font-semibold" style={{ color: 'var(--c-text)' }}>{currentMock?.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span style={{ color: timeRemaining < 300 ? 'var(--c-red)' : 'var(--c-text)' }}>
                  ⏱ {formatTime(timeRemaining)}
                </span>
                <span style={{ color: 'var(--c-caption)' }}>Answered: {answeredCount}/{totalMockQ}</span>
              </div>
            </div>

            {/* Question scroll area */}
            <div className="rounded-[18px] px-5 py-5 md:px-6 md:py-6 overflow-y-auto max-h-[calc(100vh-280px)]" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Answer all questions</h3>
                <div className="flex gap-1 flex-wrap">
                  {mockQuestions.map((_, i) => (
                    <span key={i}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium"
                      style={{
                        background: mockAnswers[mockQuestions[i]?.id] !== undefined ? 'var(--c-blue)' : 'var(--c-tag)',
                        color: mockAnswers[mockQuestions[i]?.id] !== undefined ? '#fff' : 'var(--c-caption)',
                      }}
                    >{i + 1}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-8">
                {mockQuestions.map((q, qi) => (
                  <div key={q.id} className="border-b pb-6 last:border-b-0" style={{ borderColor: 'var(--c-border)' }}>
                    <p className="text-xs font-medium mb-3 leading-relaxed" style={{ color: 'var(--c-text)' }}>
                      <span className="text-[10px] px-1.5 py-0.5 rounded mr-1.5" style={{ background: `${SUBJECT_META[q.subject].color}15`, color: SUBJECT_META[q.subject].color }}>
                        {q.subject === 'physics' ? 'P' : q.subject === 'chemistry' ? 'C' : 'M'}
                      </span>
                      {qi + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => (
                        <button key={oi} onClick={() => handleMockAnswer(q.id, oi)}
                          className="text-left text-xs px-3 py-2 rounded-[10px] transition-all flex items-center gap-2"
                          style={{
                            border: mockAnswers[q.id] === oi ? '2px solid var(--c-blue)' : '1px solid var(--c-border-input)',
                            color: mockAnswers[q.id] === oi ? 'var(--c-blue)' : 'var(--c-text-secondary)',
                            background: mockAnswers[q.id] === oi ? 'rgba(35,131,226,0.08)' : 'transparent',
                          }}
                        >
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                            style={{ background: mockAnswers[q.id] === oi ? 'var(--c-blue)' : 'var(--c-tag)', color: mockAnswers[q.id] === oi ? '#fff' : 'var(--c-caption)' }}
                          >{String.fromCharCode(65 + oi)}</span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <button onClick={handleMockSubmit}
                  className="text-sm font-semibold px-8 py-2.5 rounded-[40px] text-white transition-all hover:-translate-y-[0.5px]"
                  style={{ background: 'var(--c-btn-primary)' }}
                >📤 Submit Test</button>
              </div>
            </div>
          </div>
        )}

        {/* Mock test results */}
        {tab === 'mock' && mockFinished && mockResult && (
          <div>
            <div className="rounded-[18px] px-5 py-6 md:px-6 md:py-6 text-center mb-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="text-4xl mb-2">{mockResult.accuracy >= 80 ? '🎉' : mockResult.accuracy >= 50 ? '👍' : '💪'}</div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--c-text)' }}>Test Complete!</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--c-muted)' }}>{currentMock?.name}</p>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <div className="text-center">
                  <div className="text-[28px] font-bold" style={{ color: 'var(--c-green)' }}>{mockResult.correct}</div>
                  <div className="text-[10px]" style={{ color: 'var(--c-caption)' }}>Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-[28px] font-bold" style={{ color: 'var(--c-red)' }}>{mockResult.wrong}</div>
                  <div className="text-[10px]" style={{ color: 'var(--c-caption)' }}>Wrong</div>
                </div>
                <div className="text-center">
                  <div className="text-[28px] font-bold" style={{ color: 'var(--c-muted)' }}>{mockResult.skipped}</div>
                  <div className="text-[10px]" style={{ color: 'var(--c-caption)' }}>Skipped</div>
                </div>
                <div className="text-center">
                  <div className="text-[28px] font-bold" style={{ color: 'var(--c-blue)' }}>{mockResult.accuracy}%</div>
                  <div className="text-[10px]" style={{ color: 'var(--c-caption)' }}>Accuracy</div>
                </div>
              </div>
              <button onClick={() => { setMockStarted(false); setMockFinished(false); setMockResult(null) }}
                className="mt-5 text-xs font-medium px-6 py-2 rounded-[40px] text-white transition-all"
                style={{ background: 'var(--c-btn-primary)' }}
              >← Back to Tests</button>
            </div>

            {/* Subject breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['physics', 'chemistry', 'maths'] as Subject[]).map(sub => {
                const br = mockResult ? [
                  { subject: 'physics' as Subject, total: mockQuestions.filter(q => q.subject === 'physics').length, correct: mockQuestions.filter(q => q.subject === 'physics' && mockAnswers[q.id] === q.correctOptionIndex).length, wrong: mockQuestions.filter(q => q.subject === 'physics' && mockAnswers[q.id] !== undefined && mockAnswers[q.id] !== q.correctOptionIndex).length, skipped: mockQuestions.filter(q => q.subject === 'physics' && mockAnswers[q.id] === undefined).length },
                  { subject: 'chemistry' as Subject, total: mockQuestions.filter(q => q.subject === 'chemistry').length, correct: mockQuestions.filter(q => q.subject === 'chemistry' && mockAnswers[q.id] === q.correctOptionIndex).length, wrong: mockQuestions.filter(q => q.subject === 'chemistry' && mockAnswers[q.id] !== undefined && mockAnswers[q.id] !== q.correctOptionIndex).length, skipped: mockQuestions.filter(q => q.subject === 'chemistry' && mockAnswers[q.id] === undefined).length },
                  { subject: 'maths' as Subject, total: mockQuestions.filter(q => q.subject === 'maths').length, correct: mockQuestions.filter(q => q.subject === 'maths' && mockAnswers[q.id] === q.correctOptionIndex).length, wrong: mockQuestions.filter(q => q.subject === 'maths' && mockAnswers[q.id] !== undefined && mockAnswers[q.id] !== q.correctOptionIndex).length, skipped: mockQuestions.filter(q => q.subject === 'maths' && mockAnswers[q.id] === undefined).length },
                ] : []
                const sb = br.find(b => b.subject === sub)
                if (!sb) return null
                const acc = sb.total > sb.skipped ? Math.round((sb.correct / (sb.total - sb.skipped)) * 100) : 0
                return (
                  <div key={sub} className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: SUBJECT_META[sub].color }}>{SUBJECT_META[sub].emoji} {SUBJECT_META[sub].label}</p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span style={{ color: 'var(--c-green)' }}>✅{sb.correct}</span>
                      <span style={{ color: 'var(--c-red)' }}>❌{sb.wrong}</span>
                      <span style={{ color: 'var(--c-muted)' }}>⏭️{sb.skipped}</span>
                      <span className="font-medium" style={{ color: 'var(--c-blue)' }}>{acc}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: ANALYTICS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'analytics' && (
          <div className="space-y-5" style={{ contentVisibility: 'auto' as any }}>
            {/* Top stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                <div className="flex items-center gap-1 mb-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>Questions Solved</p>
                  <button onClick={() => setInfoSection('questions_solved')} className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                </div>
                <p className="text-[24px] font-bold" style={{ color: 'var(--c-blue)' }}>{stats.total}</p>
                <p className="text-[10px]" style={{ color: 'var(--c-muted)' }}>✅ {stats.correct} · ❌ {stats.wrong}</p>
              </div>
              <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                <div className="flex items-center gap-1 mb-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>Overall Accuracy</p>
                  <button onClick={() => setInfoSection('accuracy')} className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                </div>
                <p className="text-[24px] font-bold" style={{ color: stats.accuracy >= 70 ? 'var(--c-green)' : stats.accuracy >= 40 ? 'var(--c-orange)' : 'var(--c-red)' }}>{stats.accuracy}%</p>
                <div className="w-full h-1.5 rounded-full mt-1" style={{ background: 'var(--c-tag)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${stats.accuracy}%`, background: stats.accuracy >= 70 ? 'var(--c-green)' : stats.accuracy >= 40 ? 'var(--c-orange)' : 'var(--c-red)' }} />
                </div>
              </div>
              <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                <div className="flex items-center gap-1 mb-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>Mock Tests</p>
                  <button onClick={() => setInfoSection('mock_tests')} className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                </div>
                <p className="text-[24px] font-bold" style={{ color: 'var(--c-blue)' }}>{mockStats.total}</p>
                <p className="text-[10px]" style={{ color: 'var(--c-muted)' }}>Avg: {mockStats.avgAccuracy}% · Best: {mockStats.bestScore}%</p>
              </div>
              <div className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                <div className="flex items-center gap-1 mb-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>Bookmarked</p>
                  <button onClick={() => setInfoSection('bookmarked')} className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                </div>
                <p className="text-[24px] font-bold" style={{ color: 'var(--c-orange)' }}>{stats.bookmarked}</p>
                <p className="text-[10px]" style={{ color: 'var(--c-muted)' }}>Questions to revisit</p>
              </div>
            </div>

            {/* Subject breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SUBJECTS.map(sub => {
                const ss = getSubjectStats(sub)
                return (
                  <div key={sub} className="rounded-[18px] p-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold" style={{ color: SUBJECT_META[sub].color }}>{SUBJECT_META[sub].emoji} {SUBJECT_META[sub].label}</span>
                        <button onClick={() => setInfoSection('subject_perf')} className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                      </div>
                      <span className="text-[11px]" style={{ color: 'var(--c-muted)' }}>{ss.total} solved</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span style={{ color: 'var(--c-green)' }}>✅ {ss.correct}</span>
                      <span style={{ color: 'var(--c-red)' }}>❌ {ss.wrong}</span>
                      <span className="font-semibold" style={{ color: ss.accuracy >= 70 ? 'var(--c-green)' : ss.accuracy >= 40 ? 'var(--c-orange)' : 'var(--c-red)' }}>{ss.accuracy}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--c-tag)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${ss.accuracy}%`, background: SUBJECT_META[sub].color }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Chapter-wise solved */}
            <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
              <div className="flex items-center gap-1 mb-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>📚 Questions Solved per Chapter</h3>
                <button onClick={() => setInfoSection('chapter_solved')} className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
              </div>
              {chapterStats.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--c-muted)' }}>No questions solved yet. Start practicing!</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {chapterStats.sort((a, b) => b.total - a.total).map(cs => (
                    <div key={cs.chapterId} className="flex items-center justify-between text-xs py-1.5 border-b" style={{ borderColor: 'var(--c-border)' }}>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-[10px]" style={{ color: SUBJECT_META[cs.subject].color }}>
                          {SUBJECT_META[cs.subject].emoji}
                        </span>
                        <span className="truncate" style={{ color: 'var(--c-text)' }}>{cs.chapterName}</span>
                      </div>
                      <span className="shrink-0 ml-2" style={{ color: 'var(--c-muted)' }}>
                        ✅{cs.correct} ❌{cs.total - cs.correct} · {cs.total > 0 ? Math.round((cs.correct / cs.total) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mock test trend */}
            {mockStats.trend.length > 0 && (
              <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                <div className="flex items-center gap-1 mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>📈 Mock Test Trend (Last 7)</h3>
                  <button onClick={() => setInfoSection('mock_trend')} className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                </div>
                <div className="flex items-end gap-2 h-24">
                  {mockStats.trend.map((t, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px]" style={{ color: 'var(--c-caption)' }}>{t.accuracy}%</span>
                      <div className="w-full rounded-[4px] transition-all" style={{
                        height: `${Math.max(t.accuracy, 4)}%`,
                        background: t.accuracy >= 70 ? 'var(--c-green)' : t.accuracy >= 40 ? 'var(--c-orange)' : 'var(--c-red)',
                      }} />
                      <span className="text-[8px]" style={{ color: 'var(--c-caption)' }}>{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent mistakes — clickable */}
            {mistakes.length > 0 && (
              <div className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-1">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>❌ Recent Mistakes</h3>
                    <button onClick={() => setInfoSection('mistakes')} className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                  </div>
                  {currentAttempt && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--c-green)' }}>
                      Note: {noteText ? 'Saved' : 'None'}
                    </span>
                  )}
                </div>
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {mistakes.map(m => {
                    const q = ALL_PYQS.find(pq => pq.question === m.question)
                    return (
                      <button key={m.id} onClick={() => navigateToMistake(m)}
                        className="w-full text-left text-xs py-2.5 px-3 rounded-[12px] transition-all border-b last:border-b-0 hover:-translate-y-[0.5px]"
                        style={{ borderColor: 'var(--c-border)', background: 'transparent' }}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] mt-0.5" style={{ color: SUBJECT_META[m.subject as Subject].color }}>
                            {SUBJECT_META[m.subject as Subject].emoji}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium truncate" style={{ color: 'var(--c-text)' }}>{m.question}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--c-red)' }}>
                                You: {m.userAnswer || '—'}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--c-green)' }}>
                                Correct: {m.correctAnswer}
                              </span>
                              <span className="text-[9px] ml-auto" style={{ color: 'var(--c-caption)' }}>{m.chapterName}</span>
                            </div>
                            {m.notes && (
                              <p className="text-[9px] mt-1 italic" style={{ color: 'var(--c-orange)' }}>📝 {m.notes}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
      {infoSection && <InfoPopup section={infoSection} onClose={() => setInfoSection(null)} />}
    </div>
  )
}
