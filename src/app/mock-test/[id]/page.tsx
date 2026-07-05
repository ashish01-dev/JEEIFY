'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MOCK_TESTS, ALL_PYQS } from '@/data/pyqs'
import type { PYQEntry } from '@/data/pyqs'
import type { MockTestResult, Subject } from '@/types'
import { usePYQStore } from '@/store/pyqStore'
import { db } from '@/lib/db'

function formatTimer(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function MockTestPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { recordMockResult } = usePYQStore()

  const def = MOCK_TESTS.find(m => m.id === id)
  const questions: PYQEntry[] = def ? def.questionIds.map(qid => ALL_PYQS.find(q => q.id === qid)).filter(Boolean) as PYQEntry[] : []

  const total = questions.length
  const duration = def?.durationMinutes || 180

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(duration * 60)
  const [submitted, setSubmitted] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const endedRef = useRef(false)

  const currentQ = questions[currentIdx]
  const selectedOption = currentQ ? answers[currentQ.id] : undefined
  const answeredCount = Object.keys(answers).length

  /* Timer */
  useEffect(() => {
    if (submitted) return
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          if (!endedRef.current) {
            endedRef.current = true
            handleSubmit()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [submitted])

  const toggleReview = useCallback(() => {
    if (!currentQ) return
    setMarkedForReview(prev => {
      const next = new Set(prev)
      if (next.has(currentQ.id)) next.delete(currentQ.id)
      else next.add(currentQ.id)
      return next
    })
  }, [currentQ])

  const handleOption = useCallback((optionIndex: number) => {
    if (!currentQ) return
    setAnswers(prev => {
      if (prev[currentQ.id] === optionIndex) {
        const { [currentQ.id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [currentQ.id]: optionIndex }
    })
  }, [currentQ])

  const handleSubmit = useCallback(async () => {
    if (submitted || submitting) return
    setSubmitting(true)
    setSubmitted(true)

    const correct: string[] = []
    const wrong: string[] = []
    const skipped: string[] = []
    const answerDetails: MockTestResult['answers'] = []

    questions.forEach(q => {
      const sel = answers[q.id]
      const isCorrect = sel === q.correctOptionIndex
      answerDetails.push({
        questionId: q.id,
        selectedOption: sel ?? -1,
        correct: isCorrect,
      })
      if (sel === undefined) skipped.push(q.id)
      else if (isCorrect) correct.push(q.id)
      else wrong.push(q.id)
    })

    /* Build subject breakdown */
    const subjectMap: Record<string, { total: number; correct: number; wrong: number; skipped: number }> = {}
    questions.forEach(q => {
      if (!subjectMap[q.subject]) subjectMap[q.subject] = { total: 0, correct: 0, wrong: 0, skipped: 0 }
      subjectMap[q.subject].total++
      const sel = answers[q.id]
      if (sel === undefined) subjectMap[q.subject].skipped++
      else if (sel === q.correctOptionIndex) subjectMap[q.subject].correct++
      else subjectMap[q.subject].wrong++
    })

    const result: MockTestResult = {
      id: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      testId: id,
      testName: def?.name || 'Mock Test',
      year: def?.year || 2026,
      session: def?.session || 'Practice',
      attemptedAt: new Date().toISOString(),
      timeTaken: duration * 60 - timeRemaining,
      totalQuestions: total,
      answered: answeredCount,
      correct: correct.length,
      wrong: wrong.length,
      skipped: skipped.length,
      score: correct.length * 4 - wrong.length,
      accuracy: answeredCount > 0 ? Math.round((correct.length / answeredCount) * 100) : 0,
      subjectBreakdown: Object.entries(subjectMap).map(([subject, data]) => ({
        subject: subject as Subject,
        ...data,
      })),
      answers: answerDetails,
    }

    await recordMockResult(result)

    /* Auto-log to test logger */
    try {
      const subjSet = new Set(questions.map(q => q.subject))
      const subjs = Array.from(subjSet)
      const chapterSet = new Set(questions.map(q => q.chapterName))
      await db.tests.add({
        id: `mocktest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        date: result.attemptedAt.slice(0, 10),
        subject: subjs[0] || 'physics',
        subjects: subjs,
        chapters: Array.from(chapterSet),
        score: correct.length * 4,
        total: total * 4,
        accuracy: result.accuracy,
        timeTaken: result.timeTaken,
        notes: `Mock:${id}:${result.id}:${def?.name || ''}`,
      })
    } catch {}

    /* Also log to local storage for results page */
    sessionStorage.setItem('mock_result_' + id, JSON.stringify({ ...result, questions }))

    setSubmitting(false)
    router.push(`/mock-test/${id}/results`)
  }, [id, def, questions, answers, answeredCount, total, duration, timeRemaining, recordMockResult, submitted, submitting, router])

  if (!def) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--c-bg)' }}>
        <div className="text-center p-8">
          <p className="text-lg mb-4" style={{ color: 'var(--c-text)' }}>Mock test not found</p>
          <button onClick={() => router.push('/pyq')} className="px-5 py-2 rounded-[40px] text-white text-sm font-medium" style={{ background: 'var(--c-btn-primary)' }}>
            Back to PYQs
          </button>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--c-bg)' }}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[var(--c-blue)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm" style={{ color: 'var(--c-muted)' }}>Loading questions...</span>
        </div>
      </div>
    )
  }

  /* Build palette stats */
  const statuses: ('unvisited' | 'current' | 'answered' | 'review' | 'answered-review')[] = questions.map((q, i) => {
    const hasAnswer = answers[q.id] !== undefined
    const isReviewed = markedForReview.has(q.id)
    const isCurrent = i === currentIdx
    if (isCurrent) return 'current'
    if (hasAnswer && isReviewed) return 'answered-review'
    if (isReviewed) return 'review'
    if (hasAnswer) return 'answered'
    return 'unvisited'
  })

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--c-bg)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b shrink-0" style={{ background: 'var(--c-card)', borderColor: 'var(--c-border)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => { if (window.history.length > 1) router.back(); else window.close() }} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-black/[0.05] dark:hover:bg-white/[0.1] shrink-0" style={{ color: 'var(--c-text-secondary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate" style={{ color: 'var(--c-text)' }}>{def.name}</h1>
            <p className="text-[11px]" style={{ color: 'var(--c-caption)' }}>{total} questions · {def.durationMinutes} min</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 text-sm font-mono font-semibold tabular-nums" style={{ color: timeRemaining < 300 ? '#ef4444' : 'var(--c-text)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            {formatTimer(timeRemaining)}
          </div>
          <button onClick={() => setShowConfirm(true)} className="px-4 py-1.5 rounded-[40px] text-xs font-medium text-white transition-all hover:-translate-y-[0.5px] active:translate-y-0" style={{ background: '#ef4444' }}>
            End Test
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
          {/* Question palette - left sidebar */}
        <div className="hidden md:flex flex-col w-[200px] lg:w-[220px] shrink-0 border-r overflow-y-auto py-3" style={{ borderColor: 'var(--c-border)', background: 'var(--c-card)' }}>
          <div className="px-3 mb-3">
            <p className="text-[11px] font-medium mb-2" style={{ color: 'var(--c-caption)' }}>Question Palette</p>
            {/* Subject jump buttons */}
            <div className="flex gap-1 mb-2">
              {(['physics', 'chemistry', 'maths'] as const).map(sub => {
                const firstIdx = questions.findIndex(q => q.subject === sub)
                if (firstIdx === -1) return null
                return (
                  <button key={sub} onClick={() => setCurrentIdx(firstIdx)}
                    className="flex-1 text-[9px] font-semibold py-1 rounded-[6px] transition-all active:scale-95"
                    style={{
                      background: questions[currentIdx]?.subject === sub ? 'rgba(35,131,226,0.12)' : 'var(--c-tag)',
                      color: questions[currentIdx]?.subject === sub ? 'var(--c-blue)' : 'var(--c-caption)',
                      border: `1px solid ${questions[currentIdx]?.subject === sub ? 'var(--c-blue)' : 'transparent'}`,
                    }}>
                    {sub === 'physics' ? 'Phy' : sub === 'chemistry' ? 'Chem' : 'Maths'}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1.5 px-3">
            {questions.map((q, i) => {
              const s = statuses[i]
              let bg = 'transparent'
              let border = 'var(--c-border)'
              let txt = 'var(--c-text-secondary)'
              if (s === 'current') { bg = 'rgba(35,131,226,0.12)'; border = 'var(--c-blue)'; txt = 'var(--c-blue)' }
              else if (s === 'answered') { bg = 'var(--c-blue)'; border = 'var(--c-blue)'; txt = '#fff' }
              else if (s === 'review') { bg = 'rgba(139,92,246,0.15)'; border = '#8b5cf6'; txt = '#8b5cf6' }
              else if (s === 'answered-review') { bg = '#8b5cf6'; border = '#8b5cf6'; txt = '#fff' }
              return (
                <button key={q.id} onClick={() => setCurrentIdx(i)}
                  className="w-8 h-8 rounded-lg text-[11px] font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{ background: bg, border: `1.5px solid ${border}`, color: txt }}>
                  {i + 1}
                </button>
              )
            })}
          </div>
          <div className="mt-4 px-3 space-y-1.5">
            <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--c-caption)' }}>
              <span className="w-3 h-3 rounded border" style={{ borderColor: 'var(--c-border)' }} />
              <span>Not visited</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--c-caption)' }}>
              <span className="w-3 h-3 rounded" style={{ background: 'var(--c-blue)' }} />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--c-caption)' }}>
              <span className="w-3 h-3 rounded bg-[#8b5cf6]" />
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--c-caption)' }}>
              <span className="w-3 h-3 rounded-sm border-2 border-[var(--c-blue)]" />
              <span>Current</span>
            </div>
          </div>
          <div className="mt-auto pt-4 px-3">
            <div className="text-[11px] font-medium mb-1" style={{ color: 'var(--c-text)' }}>
              Answered: <span style={{ color: 'var(--c-blue)' }}>{answeredCount}</span> / {total}
            </div>
            <button onClick={() => setShowConfirm(true)}
              className="w-full py-2 rounded-[40px] text-xs font-semibold text-white transition-all hover:-translate-y-[0.5px] active:translate-y-0" style={{ background: 'var(--c-btn-primary)' }}>
              Submit Test
            </button>
          </div>
        </div>

        {/* Question area */}
        <div className="flex-1 flex flex-col overflow-y-auto px-4 md:px-8 py-6">
          {currentQ && (
            <>
              <div className="max-w-3xl mx-auto w-full">
                {/* Question header */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--c-text)' }}>
                    Question {currentIdx + 1} of {total}
                  </span>
                  <div className="flex gap-2">
                    <span className="text-[11px] px-2.5 py-1 rounded-lg" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>
                      {currentQ.subject === 'physics' ? 'Physics' : currentQ.subject === 'chemistry' ? 'Chemistry' : 'Maths'}
                    </span>
                    <span className="text-[11px] px-2.5 py-1 rounded-lg" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>
                      {currentQ.chapterName}
                    </span>
                  </div>
                </div>

                {/* Question text */}
                <div className="mb-6 p-5 rounded-[18px]" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
                  <p className="text-[15px] leading-relaxed" style={{ color: 'var(--c-text)' }}>
                    {currentIdx + 1}. {currentQ.question}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-8">
                  {currentQ.options.map((opt, oi) => {
                    const isSelected = selectedOption === oi
                    const letter = String.fromCharCode(65 + oi)
                    return (
                      <button key={oi} onClick={() => handleOption(oi)}
                        className="w-full flex items-center gap-3 p-4 rounded-[14px] text-left transition-all hover:-translate-y-[0.5px] active:translate-y-0"
                        style={{
                          background: isSelected ? 'rgba(35,131,226,0.08)' : 'var(--c-card)',
                          border: `1.5px solid ${isSelected ? 'var(--c-blue)' : 'var(--c-border-card)'}`,
                        }}>
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                          style={{
                            background: isSelected ? 'var(--c-blue)' : 'var(--c-tag)',
                            color: isSelected ? '#fff' : 'var(--c-text-secondary)',
                          }}>
                          {letter}
                        </span>
                        <span className="text-[14px] leading-snug" style={{ color: isSelected ? 'var(--c-blue)' : 'var(--c-text)' }}>
                          {opt}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Navigation + mark for review — mobile palette */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}
                    className="px-4 py-2 rounded-[40px] text-xs font-medium transition-all disabled:opacity-30"
                    style={{ border: '1px solid var(--c-border)', color: 'var(--c-text-secondary)' }}>
                    ← Previous
                  </button>
                  <button onClick={toggleReview}
                    className="px-4 py-2 rounded-[40px] text-xs font-medium transition-all"
                    style={{
                      border: `1px solid ${markedForReview.has(currentQ.id) ? '#8b5cf6' : 'var(--c-border)'}`,
                      color: markedForReview.has(currentQ.id) ? '#8b5cf6' : 'var(--c-text-secondary)',
                      background: markedForReview.has(currentQ.id) ? 'rgba(139,92,246,0.08)' : 'transparent',
                    }}>
                    {markedForReview.has(currentQ.id) ? 'Marked ✓' : 'Mark for Review'}
                  </button>
                  <button onClick={() => setCurrentIdx(i => Math.min(total - 1, i + 1))} disabled={currentIdx === total - 1}
                    className="px-4 py-2 rounded-[40px] text-xs font-medium transition-all disabled:opacity-30"
                    style={{ border: '1px solid var(--c-border)', color: 'var(--c-text-secondary)' }}>
                    Next →
                  </button>
                  <button onClick={() => setCurrentIdx(prev => prev > 0 ? prev - 1 : prev)} disabled={selectedOption === undefined}
                    className="px-4 py-2 rounded-[40px] text-xs font-medium transition-all disabled:opacity-30 ml-auto"
                    style={{ border: '1px solid var(--c-border)', color: 'var(--c-text-secondary)' }}>
                    Clear
                  </button>
                </div>

                {/* Mobile question palette */}
                <div className="md:hidden mb-6">
                  <p className="text-[11px] font-medium mb-2" style={{ color: 'var(--c-caption)' }}>Question Palette</p>
                  <div className="grid grid-cols-10 gap-1.5 mb-3">
                    {questions.map((q, i) => {
                      const s = statuses[i]
                      let bg = 'transparent'
                      let border = 'var(--c-border)'
                      let txt = 'var(--c-text-secondary)'
                      if (s === 'current') { bg = 'rgba(35,131,226,0.12)'; border = 'var(--c-blue)'; txt = 'var(--c-blue)' }
                      else if (s === 'answered') { bg = 'var(--c-blue)'; border = 'var(--c-blue)'; txt = '#fff' }
                      else if (s === 'review') { bg = 'rgba(139,92,246,0.15)'; border = '#8b5cf6'; txt = '#8b5cf6' }
                      else if (s === 'answered-review') { bg = '#8b5cf6'; border = '#8b5cf6'; txt = '#fff' }
                      return (
                        <button key={q.id} onClick={() => setCurrentIdx(i)}
                          className="w-7 h-7 rounded-md text-[10px] font-semibold transition-all active:scale-95"
                          style={{ background: bg, border: `1.5px solid ${border}`, color: txt }}>
                          {i + 1}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-4 text-[10px]" style={{ color: 'var(--c-caption)' }}>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded border" style={{ borderColor: 'var(--c-border)' }} /> Unvisited</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ background: 'var(--c-blue)' }} /> Answered</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#8b5cf6]" /> Review</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 border-2 border-[var(--c-blue)] rounded-sm" /> Current</span>
                  </div>
                </div>

                {/* Desktop submit button */}
                <div className="hidden md:block">
                  <button onClick={() => setShowConfirm(true)}
                    className="px-6 py-2.5 rounded-[40px] text-sm font-semibold text-white transition-all hover:-translate-y-[0.5px] active:translate-y-0"
                    style={{ background: 'var(--c-btn-primary)' }}>
                    Submit Test
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirm submit modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
          <div className="w-full max-w-sm rounded-[18px] p-6" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
            <h3 className="text-[17px] font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Submit Test?</h3>
            <p className="text-[13px] mb-1" style={{ color: 'var(--c-muted)' }}>
              Answered: <strong>{answeredCount}</strong> / {total}
            </p>
            <p className="text-[13px] mb-5" style={{ color: 'var(--c-muted)' }}>
              Unanswered: <strong>{total - answeredCount}</strong>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-[40px] text-sm font-medium transition-all"
                style={{ border: '1px solid var(--c-border)', color: 'var(--c-text-secondary)' }}>
                Continue Test
              </button>
              <button onClick={() => { setShowConfirm(false); handleSubmit() }}
                className="flex-1 py-2.5 rounded-[40px] text-sm font-semibold text-white transition-all"
                style={{ background: 'var(--c-btn-primary)' }}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
