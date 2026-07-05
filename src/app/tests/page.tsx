'use client'

import { useState, useEffect, useMemo } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import ConfettiOverlay from '@/components/ConfettiOverlay'
import { db } from '@/lib/db'
import { generateId, formatDate } from '@/lib/utils'
import { useSettingsStore } from '@/store/settingsStore'
import syllabusData from '@/data/syllabus.json'
import type { TestEntry, Subject, Chapter } from '@/types'

const TEST_INFO_DATA: Record<string, { title: string; body: string }> = {
  tests_taken: { title: 'How Tests Taken is counted', body: 'Total number of tests you\'ve logged, including manually entered tests and auto-logged mock tests from the PYQ practice section.' },
  avg_accuracy: { title: 'How Average Accuracy is calculated', body: 'Mean accuracy across all logged tests. Accuracy per test = (Score ÷ Total) × 100. Higher average means consistent performance.' },
  best_score: { title: 'How Best Score is determined', body: 'Your single highest-scoring test by percentage. Shows the test with the best ratio of score to total marks.' },
  trend: { title: 'How Trend is calculated', body: 'Compares your latest test accuracy to your earliest test accuracy among the last 5 tests. Upward (↗) means improvement; downward (↘) means decline.' },
  score_trend: { title: 'How the Score Trend chart works', body: 'Each bar represents one test, ordered chronologically. Bar height = score percentage. Green = 80%+, Orange = 60–79%, Red = below 60%. Hover to see details.' },
}

const syllabus = syllabusData as unknown as { [key in Subject]: { divisions: { chapters: Chapter[] }[] } }

function getFlatChapters(subject: Subject): Chapter[] {
  const out: Chapter[] = []
  for (const div of syllabus[subject].divisions) {
    for (const ch of div.chapters) {
      if (!ch.deleted) out.push(ch)
    }
  }
  return out
}

const ALL_SUBJECTS: Subject[] = ['physics', 'chemistry', 'maths']

function InfoPopup({ section, onClose }: { section: string; onClose: () => void }) {
  const data = TEST_INFO_DATA[section]
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

export default function TestsPage() {
  const { settings } = useSettingsStore()
  const [tests, setTests] = useState<TestEntry[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [formDate, setFormDate] = useState(formatDate(new Date()))
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([])
  const [subjectSearch, setSubjectSearch] = useState('')
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [chapterSearch, setChapterSearch] = useState('')
  const [formScore, setFormScore] = useState('')
  const [formTotal, setFormTotal] = useState('50')
  const [formTime, setFormTime] = useState('')
  const [scoreError, setScoreError] = useState('')
  const [infoSection, setInfoSection] = useState<string | null>(null)

  const activeSubjects = selectedSubjects.length > 0 ? selectedSubjects : ['physics' as Subject]

  const allChapters = useMemo(() => {
    const chs: Chapter[] = []
    for (const sub of activeSubjects) {
      chs.push(...getFlatChapters(sub))
    }
    return chs
  }, [activeSubjects])

  const filteredChapters = allChapters.filter(ch => ch.name.toLowerCase().includes(chapterSearch.toLowerCase()))

  useEffect(() => { db.tests.toArray().then(setTests) }, [])

  const toggleSubject = (s: Subject) => {
    setSelectedSubjects(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const toggleChapter = (name: string) => {
    setSelectedChapters(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    )
  }

  const addTest = async () => {
    if (!formScore || !formTotal || selectedChapters.length === 0) return
    const s = parseInt(formScore, 10)
    const t = parseInt(formTotal, 10)
    if (s > t) { setScoreError(`Score (${s}) cannot exceed total marks (${t})`); return }
    setScoreError('')
    const primary = selectedSubjects[0] || 'physics'
    const entry: TestEntry = {
      id: generateId(), date: formDate, subject: primary,
      subjects: selectedSubjects.length > 0 ? [...selectedSubjects] : undefined,
      chapters: [...selectedChapters],
      score: parseInt(formScore, 10), total: parseInt(formTotal, 10),
      accuracy: Math.round((parseInt(formScore, 10) / parseInt(formTotal, 10)) * 100),
      timeTaken: formTime ? parseInt(formTime, 10) : undefined,
    }
    await db.tests.add(entry)
    setTests(prev => [...prev, entry])
    setFormScore(''); setFormTime('')
    setSelectedChapters([]); setChapterSearch('')
    setSelectedSubjects([])
    if (entry.accuracy >= 80) setShowConfetti(true)
  }

  return (
    <div className="min-h-screen pb-[100px] md:pb-[90px]" style={{ fontFamily: "'DM Sans', sans-serif", background: 'var(--c-bg-gradient)' }}>
      <Sidebar />
      <TopBar />
      <MobileBottomNav />

      <div className="px-4 md:px-8 lg:px-10 pt-[17px] pb-6 overflow-x-hidden" style={{ marginLeft: 'var(--sidebar-w, 0px)' as any, transition: 'margin-left 0.3s ease' as any }}>
        <h1 className="text-[clamp(28px,3vw,36px)] font-medium tracking-[-0.5px] mb-1" style={{ color: 'var(--c-text)' }}>Tests</h1>
        <p className="text-sm mb-4" style={{ color: 'var(--c-muted)' }}>Log and track your mock tests</p>

        {tests.length > 0 && (() => {
          const sorted = [...tests].sort((a, b) => a.date.localeCompare(b.date))
          const avgAccuracy = Math.round(tests.reduce((s, t) => s + t.accuracy, 0) / tests.length)
          const best = tests.reduce((b, t) => t.accuracy > b.accuracy ? t : b, tests[0])
          const maxScore = Math.max(...tests.map(t => Math.round((t.score / t.total) * 100)))
          const recent = sorted.slice(-5)
          const trend = recent.length >= 2 ? (recent[recent.length - 1].accuracy - recent[0].accuracy) : 0
          return (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="rounded-[14px] px-4 py-3" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>Tests Taken</div>
                    <button onClick={() => setInfoSection('tests_taken')} className="w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                  </div>
                  <div className="text-xl font-bold" style={{ color: 'var(--c-blue)' }}>{tests.length}</div>
                </div>
                <div className="rounded-[14px] px-4 py-3" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>Avg Accuracy</div>
                    <button onClick={() => setInfoSection('avg_accuracy')} className="w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                  </div>
                  <div className="text-xl font-bold" style={{ color: avgAccuracy >= 80 ? 'var(--c-green)' : avgAccuracy >= 60 ? 'var(--c-orange)' : 'var(--c-red)' }}>{avgAccuracy}%</div>
                </div>
                <div className="rounded-[14px] px-4 py-3" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>Best Score</div>
                    <button onClick={() => setInfoSection('best_score')} className="w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                  </div>
                  <div className="text-xl font-bold" style={{ color: 'var(--c-green)' }}>{best.score}/{best.total}<span className="text-sm font-normal" style={{ color: 'var(--c-muted)' }}> ({best.accuracy}%)</span></div>
                </div>
                <div className="rounded-[14px] px-4 py-3" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>Trend ({recent.length})</div>
                    <button onClick={() => setInfoSection('trend')} className="w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                  </div>
                  <div className="text-xl font-bold" style={{ color: trend >= 0 ? 'var(--c-green)' : 'var(--c-red)' }}>
                    {trend >= 0 ? '↗' : '↘'} {Math.abs(trend)}%
                  </div>
                </div>
              </div>

              {/* Score Trend Mini Chart */}
              {sorted.length >= 2 && (
                <div className="rounded-[18px] px-5 py-4 mb-4" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
                  <div className="flex items-center gap-1 mb-3">
                    <h3 className="text-[12px] font-semibold" style={{ color: 'var(--c-text)' }}>Score Trend</h3>
                    <button onClick={() => setInfoSection('score_trend')} className="w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-bold transition-opacity hover:opacity-70" style={{ background: 'var(--c-tag)', color: 'var(--c-caption)' }}>i</button>
                  </div>
                  <div className="flex items-end gap-1" style={{ height: '80px' }}>
                    {sorted.map((t, i) => {
                      const pct = Math.round((t.score / t.total) * 100)
                      const barH = Math.max(pct * 0.8, 4)
                      return (
                        <div key={t.id} className="flex-1 flex flex-col items-center gap-0.5 group relative cursor-default">
                          <div className="absolute bottom-full mb-1 text-[9px] whitespace-nowrap hidden group-hover:block" style={{ color: 'var(--c-muted)' }}>
                            {t.date}: {t.score}/{t.total} ({pct}%)
                          </div>
                          <div className="w-full rounded-[4px] transition-all group-hover:opacity-80" style={{
                            height: `${barH}px`,
                            background: pct >= 80 ? 'var(--c-green)' : pct >= 60 ? 'var(--c-orange)' : 'var(--c-red)',
                          }} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )
        })()}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-[18px] p-4" data-tour="tour-tests-log" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Log a Test</h2>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>DATE</label>
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none rounded-[40px]"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }} />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>SUBJECTS</label>
                {selectedSubjects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {selectedSubjects.map(s => (
                      <span key={s} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded text-white" style={{ backgroundColor: s === 'physics' ? 'var(--c-blue)' : s === 'chemistry' ? 'var(--c-green)' : 'var(--c-orange)' }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                        <button onClick={() => toggleSubject(s)} className="hover:opacity-70">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input
                    value={subjectSearch}
                    onChange={e => { setSubjectSearch(e.target.value); setShowSubjectDropdown(true) }}
                    placeholder="Search subjects..."
                    className="w-full px-3 py-2 text-sm outline-none rounded-[40px]"
                    style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)'; setShowSubjectDropdown(true) }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)'; setTimeout(() => setShowSubjectDropdown(false), 200) }} />
                  {showSubjectDropdown && (
                    <div className="absolute top-full left-0 mt-1 z-10 w-full rounded-[10px] shadow-lg" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)' }}>
                      {ALL_SUBJECTS.filter(s => !selectedSubjects.includes(s) && s.includes(subjectSearch)).map(s => (
                        <button
                          key={s}
                          onMouseDown={() => { toggleSubject(s); setSubjectSearch('') }}
                          className="block w-full text-left px-2 py-1 text-xs capitalize hover:bg-black/[0.02]"
                          style={{ color: 'var(--c-text)' }}
                        >
                          {s}
                        </button>
                      ))}
                      {ALL_SUBJECTS.filter(s => !selectedSubjects.includes(s) && s.includes(subjectSearch)).length === 0 && (
                        <div className="px-2 py-1 text-xs" style={{ color: 'var(--c-muted)' }}>All subjects selected</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>CHAPTERS</label>
                {selectedChapters.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {selectedChapters.map(ch => (
                      <span key={ch} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded" style={{ background: 'rgba(35,131,226,0.1)', color: 'var(--c-blue)' }}>
                        {ch}
                        <button onClick={() => toggleChapter(ch)} className="hover:text-[#e03e3e]">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  value={chapterSearch}
                  onChange={e => setChapterSearch(e.target.value)}
                  placeholder="Search and select chapters..."
                  className="w-full px-3 py-2 text-sm outline-none rounded-[40px]"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }} />
                {chapterSearch && (
                  <div className="mt-1 max-h-32 overflow-y-auto rounded-[10px]" style={{ border: '1px solid var(--c-border)', background: 'var(--c-card)' }}>
                    {filteredChapters.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => { toggleChapter(ch.name); setChapterSearch('') }}
                        className="block w-full text-left px-2 py-1 text-xs hover:bg-black/[0.02]"
                        style={{ color: 'var(--c-text)' }}
                      >
                        {ch.name}
                        {selectedChapters.includes(ch.name) && <span className="float-right text-[var(--c-blue)]">✓</span>}
                      </button>
                    ))}
                    {filteredChapters.length === 0 && (
                      <div className="px-2 py-1 text-xs" style={{ color: 'var(--c-muted)' }}>No matching chapters</div>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>SCORE</label>
                  <input type="number" min="0" value={formScore} onChange={e => { setFormScore(e.target.value); setScoreError('') }}
                    className="w-full px-3 py-2 text-sm outline-none rounded-[40px]"
                    style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>TOTAL</label>
                  <input type="number" value={formTotal} onChange={e => setFormTotal(e.target.value)}
                    className="w-full px-3 py-2 text-sm outline-none rounded-[40px]"
                    style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>TIME (min)</label>
                <input type="number" value={formTime} onChange={e => setFormTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none rounded-[40px]"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-blue)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border-input)' }} />
              </div>
              {scoreError && <p className="text-xs" style={{ color: 'var(--c-red)' }}>{scoreError}</p>}
              <button onClick={addTest} className="w-full flex items-center justify-center text-sm font-medium px-4 py-2 rounded-[40px] text-white" style={{ background: 'var(--c-btn-primary)' }}>Log Test</button>
            </div>
          </div>

          <div className="md:col-span-2 rounded-[18px] p-4" data-tour="tour-tests-history" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-card)', boxShadow: 'var(--c-shadow)' }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--c-text)' }}>History</h2>
            {tests.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--c-muted)' }}>No tests logged yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-[10px] font-semibold uppercase tracking-wider text-left p-2" style={{ color: 'var(--c-muted)' }}>Date</th>
                      <th className="text-[10px] font-semibold uppercase tracking-wider text-left p-2" style={{ color: 'var(--c-muted)' }}>Subjects</th>
                      <th className="text-[10px] font-semibold uppercase tracking-wider text-left p-2" style={{ color: 'var(--c-muted)' }}>Score</th>
                      <th className="hidden md:table-cell text-[10px] font-semibold uppercase tracking-wider text-left p-2" style={{ color: 'var(--c-muted)' }}>Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.slice().reverse().map(t => {
                      const isMock = t.notes?.startsWith('Mock:')
                      const mockParts = isMock ? (t.notes || '').split(':') : []
                      const mockId = mockParts[1] || ''
                      const mockResultId = mockParts[2] || ''
                      return (
                        <tr key={t.id} onClick={() => { if (isMock && mockId) window.open(`/mock-test/${mockId}/results`, '_blank') }}
                          className={`${isMock ? 'cursor-pointer' : ''} transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]`}>
                          <td className="text-sm p-2" style={{ color: 'var(--c-text)' }}>
                            {t.date}
                            {isMock && <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--c-red)' }}>Mock</span>}
                          </td>
                          <td className="p-2">
                            <div className="flex flex-wrap gap-1">
                              {(t.subjects || [t.subject]).map(s => (
                                <span key={s} className="text-[10px] font-medium uppercase px-1 py-0.5 rounded" style={{
                                  color: s === 'physics' ? 'var(--c-blue)' : s === 'chemistry' ? 'var(--c-green)' : 'var(--c-orange)',
                                  backgroundColor: `${s === 'physics' ? 'var(--c-blue)' : s === 'chemistry' ? 'var(--c-green)' : 'var(--c-orange)'}15`
                                }}>{s}</span>
                              ))}
                            </div>
                          </td>
                          <td className="text-sm font-medium p-2" style={{ color: 'var(--c-text)' }}>{t.score}/{t.total}</td>
                          <td className={`text-sm hidden md:table-cell p-2`} style={{
                            color: t.accuracy >= 80 ? 'var(--c-green)' : t.accuracy >= 60 ? 'var(--c-orange)' : 'var(--c-red)',
                          }}>
                            {t.accuracy}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfettiOverlay fire={showConfetti} message={`Well done ${settings.name || 'champ'}!`} onDone={() => setShowConfetti(false)} />
      {infoSection && <InfoPopup section={infoSection} onClose={() => setInfoSection(null)} />}
    </div>
  )
}
