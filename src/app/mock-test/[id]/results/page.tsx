'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MOCK_TESTS, ALL_PYQS, type PYQEntry } from '@/data/pyqs'
import type { MockTestResult, Subject } from '@/types'
import { usePYQStore } from '@/store/pyqStore'

const SUBJ_COLORS: Record<string, string> = { physics: '#3b82f6', chemistry: '#22c55e', maths: '#eab308' }
const SUBJ_NAMES: Record<string, string> = { physics: 'Physics', chemistry: 'Chemistry', maths: 'Maths' }

export default function MockResultsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { getMockStats } = usePYQStore()

  const [result, setResult] = useState<MockTestResult | null>(null)
  const [expandedQ, setExpandedQ] = useState<number | null>(null)
  const [stats, setStats] = useState<ReturnType<typeof getMockStats>>({ total: 0, avgScore: 0, avgAccuracy: 0, bestScore: 0, trend: [] })

  useEffect(() => {
    /* Try session storage first (fresh submit) */
    const stored = sessionStorage.getItem('mock_result_' + id)
    if (stored) {
      const parsed = JSON.parse(stored)
      setResult(parsed)
      sessionStorage.removeItem('mock_result_' + id)
    } else {
      /* Fallback: load from store */
      const allResults = usePYQStore.getState().mockResults
      const found = allResults.filter(r => r.testId === id).sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime())[0]
      if (found) setResult(found)
    }
    setStats(getMockStats())
  }, [id, getMockStats])

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--c-bg)' }}>
        <div className="text-center p-8">
          <p className="text-lg mb-4" style={{ color: 'var(--c-text)' }}>No results found</p>
          <button onClick={() => router.push('/pyq')} className="px-5 py-2 rounded-[40px] text-white text-sm font-medium" style={{ background: 'var(--c-btn-primary)' }}>
            Back to PYQs
          </button>
        </div>
      </div>
    )
  }

  const def = MOCK_TESTS.find(m => m.id === id)
  const questions: PYQEntry[] = def ? def.questionIds.map(qid => ALL_PYQS.find(q => q.id === qid)).filter((x): x is PYQEntry => x !== null) : []

  return (
    <div className="min-h-screen" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 pt-[17px] pb-8">
        {/* Back button */}
        <button onClick={() => router.push('/pyq')}
          className="flex items-center gap-2 text-sm font-medium mb-6 transition-all hover:opacity-70"
          style={{ color: 'var(--c-caption)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
          Back to PYQs
        </button>

        {/* Score card */}
        <div className="rounded-[18px] p-6 md:p-8 mb-6 text-center" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
          <div className="text-5xl font-black mb-2" style={{ color: result.accuracy >= 80 ? '#22c55e' : result.accuracy >= 50 ? '#eab308' : '#ef4444' }}>
            {result.score}
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--c-muted)' }}>
            Score ({result.correct} × 4 − {result.wrong} × 1)
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>{result.correct}</div>
              <div className="text-[11px]" style={{ color: 'var(--c-caption)' }}>Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#ef4444' }}>{result.wrong}</div>
              <div className="text-[11px]" style={{ color: 'var(--c-caption)' }}>Wrong</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--c-text-secondary)' }}>{result.skipped}</div>
              <div className="text-[11px]" style={{ color: 'var(--c-caption)' }}>Skipped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--c-blue)' }}>{result.accuracy}%</div>
              <div className="text-[11px]" style={{ color: 'var(--c-caption)' }}>Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>{result.totalQuestions}</div>
              <div className="text-[11px]" style={{ color: 'var(--c-caption)' }}>Total Qs</div>
            </div>
          </div>
          <p className="text-[11px] mt-4" style={{ color: 'var(--c-caption)' }}>
            Attempted: {new Date(result.attemptedAt).toLocaleString()}
          </p>
        </div>

        {/* Subject breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {result.subjectBreakdown.map(sb => {
            const subjAcc = sb.total > 0 ? Math.round((sb.correct / (sb.correct + sb.wrong)) * 100) : 0
            return (
              <div key={sb.subject} className="rounded-[18px] p-5" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: SUBJ_COLORS[sb.subject] }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{SUBJ_NAMES[sb.subject] || sb.subject}</span>
                </div>
                <div className="flex gap-4 text-[13px]">
                  <span style={{ color: '#22c55e' }}>{sb.correct}✓</span>
                  <span style={{ color: '#ef4444' }}>{sb.wrong}✗</span>
                  <span style={{ color: 'var(--c-caption)' }}>{sb.skipped}—</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-tag)' }}>
                  <div className="h-full rounded-full" style={{ width: `${subjAcc}%`, background: SUBJ_COLORS[sb.subject] }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Answers review */}
        <div className="rounded-[18px] p-5 mb-6" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
          <h3 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Question Review</h3>
          <div className="space-y-2">
            {result.answers.map((ans, i) => {
              const q = questions[i]
              const isExpanded = expandedQ === i
              return (
                <div key={i}>
                  <button onClick={() => setExpandedQ(isExpanded ? null : i)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-left transition-all"
                    style={{
                      background: ans.correct ? 'rgba(34,197,94,0.06)' : ans.selectedOption === -1 ? 'transparent' : 'rgba(239,68,68,0.06)',
                      border: `1px solid ${ans.correct ? 'rgba(34,197,94,0.2)' : ans.selectedOption === -1 ? 'var(--c-border-card)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                      style={{ background: ans.correct ? 'rgba(34,197,94,0.15)' : 'var(--c-tag)', color: ans.correct ? '#22c55e' : 'var(--c-text-secondary)' }}>
                      {i + 1}
                    </span>
                    <span className="flex-1 text-[13px] truncate" style={{ color: 'var(--c-text)' }}>
                      {q?.question || 'Question'}
                    </span>
                    <span className="shrink-0 text-xs font-medium" style={{ color: ans.correct ? '#22c55e' : ans.selectedOption === -1 ? 'var(--c-caption)' : '#ef4444' }}>
                      {ans.correct ? '✓' : ans.selectedOption === -1 ? '—' : '✗'}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ color: 'var(--c-caption)', stroke: 'currentColor' }}>
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {isExpanded && q && (
                    <div className="px-4 py-3 text-[13px] leading-relaxed space-y-2" style={{ color: 'var(--c-muted)' }}>
                      <p><strong className="font-medium" style={{ color: 'var(--c-text)' }}>Question:</strong> {q.question}</p>
                      <div className="space-y-1">
                        {q.options.map((opt: string, oi) => {
                          const letter = String.fromCharCode(65 + oi)
                          const isCorrectAns = oi === q.correctOptionIndex
                          const isUserAns = ans.selectedOption === oi
                          let cls = 'text-[13px]'
                          let color = 'var(--c-text)'
                          if (isCorrectAns) { color = '#22c55e'; cls += ' font-medium' }
                          else if (isUserAns && !ans.correct) { color = '#ef4444'; cls += ' font-medium' }
                          return (
                            <p key={oi} className={cls} style={{ color }}>
                              {letter}. {opt}
                              {isCorrectAns && ' ✓'}
                              {isUserAns && !ans.correct && ' (your answer)'}
                            </p>
                          )
                        })}
                      </div>
                      <p><strong className="font-medium" style={{ color: 'var(--c-text)' }}>Subject:</strong> {SUBJ_NAMES[q.subject] || q.subject} · {q.chapterName}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Previous attempts stats */}
        {stats.total > 1 && (
          <div className="rounded-[18px] p-5 mb-6" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
            <h3 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--c-text)' }}>All Attempts for This Test</h3>
            <div className="text-[13px] space-y-1" style={{ color: 'var(--c-muted)' }}>
              <p>Total attempts: <strong style={{ color: 'var(--c-text)' }}>{stats.total}</strong></p>
              <p>Average score: <strong style={{ color: 'var(--c-text)' }}>{stats.avgScore}</strong></p>
              <p>Average accuracy: <strong style={{ color: 'var(--c-text)' }}>{stats.avgAccuracy}%</strong></p>
              <p>Best score: <strong style={{ color: 'var(--c-text)' }}>{stats.bestScore}</strong></p>
            </div>
          </div>
        )}

        {/* Return button */}
        <button onClick={() => router.push('/pyq')}
          className="w-full py-3 rounded-[40px] text-sm font-semibold text-white transition-all hover:-translate-y-[0.5px] active:translate-y-0"
          style={{ background: 'var(--c-btn-primary)' }}>
          Return to PYQs
        </button>
      </div>
    </div>
  )
}
