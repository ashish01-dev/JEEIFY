'use client'

import { create } from 'zustand'
import type { PYQAttempt, Subject, MockTestResult } from '@/types'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'

interface PYQState {
  attempts: PYQAttempt[]
  mockResults: MockTestResult[]
  loaded: boolean
  load: () => Promise<void>
  recordAttempt: (attempt: Omit<PYQAttempt, 'id' | 'attemptedAt'>) => Promise<void>
  recordMockResult: (result: Omit<MockTestResult, 'id' | 'attemptedAt'> & { attemptedAt?: string }) => Promise<void>
  toggleBookmark: (id: string) => Promise<void>
  getByChapter: (chapterId: string) => PYQAttempt[]
  getStats: () => { total: number; correct: number; wrong: number; bookmarked: number; accuracy: number }
  getSubjectStats: (subject: Subject) => { total: number; correct: number; wrong: number; accuracy: number }
  getChapterwiseCount: () => { chapterId: string; chapterName: string; subject: Subject; total: number; correct: number }[]
  getMockStats: () => { total: number; avgScore: number; avgAccuracy: number; bestScore: number; trend: { label: string; accuracy: number }[] }
  getRecentMistakes: () => PYQAttempt[]
}

export const usePYQStore = create<PYQState>((set, get) => ({
  attempts: [],
  mockResults: [],
  loaded: false,

  load: async () => {
    try {
      const raw = await db.pyqAttempts.toArray()
      const attempts: PYQAttempt[] = raw.map(a => ({ ...a, status: (a.status || 'pending') as PYQAttempt['status'] }))
      const mockRaw = await db.pypMockResults.toArray().catch(() => [])
      const mockResults: MockTestResult[] = mockRaw.map(r => ({ ...r }))
      set({ attempts, mockResults, loaded: true })
    } catch { set({ loaded: true }) }
  },

  recordAttempt: async (attempt) => {
    const id = `pyq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newAttempt: PYQAttempt = {
      ...attempt,
      id,
      attemptedAt: formatDate(new Date()),
    }
    await db.pyqAttempts.add(newAttempt)
    const all = [...get().attempts, newAttempt]
    set({ attempts: all })

    // Auto-log to questions entry
    try {
      const { db: dbInstance } = await import('@/lib/db')
      const today = formatDate(new Date())
      const existing = await dbInstance.questions.get(today)
      if (existing) {
        await dbInstance.questions.put({
          ...existing,
          count: existing.count + 1,
          correct: existing.correct + (attempt.status === 'correct' ? 1 : 0),
        })
      } else {
        await dbInstance.questions.add({
          id: today,
          date: today,
          subject: attempt.subject,
          chapter: attempt.chapterName,
          count: 1,
          correct: attempt.status === 'correct' ? 1 : 0,
        })
      }
    } catch {}
  },

  recordMockResult: async (result) => {
    const id = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newResult: MockTestResult = {
      ...result,
      id,
      attemptedAt: result.attemptedAt || formatDate(new Date()),
    }
    try {
      const dbMod = await import('@/lib/db')
      await dbMod.db.pypMockResults.add(newResult)
    } catch {}
    set({ mockResults: [...get().mockResults, newResult] })
  },

  toggleBookmark: async (id: string) => {
    const items: PYQAttempt[] = get().attempts.map(a => {
      if (a.id !== id) return a
      const newStatus: PYQAttempt['status'] = a.status === 'bookmarked' ? 'pending' : 'bookmarked'
      return { ...a, status: newStatus }
    })
    set({ attempts: items })
    const item = items.find(a => a.id === id)
    if (item) await db.pyqAttempts.put(item)
  },

  getByChapter: (chapterId: string) => get().attempts.filter(a => a.chapterId === chapterId),

  getStats: () => {
    const all = get().attempts.filter(a => a.status === 'correct' || a.status === 'wrong')
    const correct = all.filter(a => a.status === 'correct').length
    const wrong = all.filter(a => a.status === 'wrong').length
    return {
      total: all.length,
      correct,
      wrong,
      bookmarked: get().attempts.filter(a => a.status === 'bookmarked').length,
      accuracy: all.length > 0 ? Math.round((correct / all.length) * 100) : 0,
    }
  },

  getSubjectStats: (subject: Subject) => {
    const all = get().attempts.filter(a => a.subject === subject && (a.status === 'correct' || a.status === 'wrong'))
    const correct = all.filter(a => a.status === 'correct').length
    const wrong = all.filter(a => a.status === 'wrong').length
    return {
      total: all.length,
      correct,
      wrong,
      accuracy: all.length > 0 ? Math.round((correct / all.length) * 100) : 0,
    }
  },

  getChapterwiseCount: () => {
    const all = get().attempts.filter(a => a.status === 'correct' || a.status === 'wrong')
    const map = new Map<string, { chapterId: string; chapterName: string; subject: Subject; total: number; correct: number }>()
    for (const a of all) {
      const existing = map.get(a.chapterId)
      if (existing) {
        existing.total++
        if (a.status === 'correct') existing.correct++
      } else {
        map.set(a.chapterId, { chapterId: a.chapterId, chapterName: a.chapterName, subject: a.subject, total: 1, correct: a.status === 'correct' ? 1 : 0 })
      }
    }
    return Array.from(map.values())
  },

  getMockStats: () => {
    const results = get().mockResults
    const total = results.length
    if (total === 0) return { total: 0, avgScore: 0, avgAccuracy: 0, bestScore: 0, trend: [] }

    const scores = results.map(r => Math.round((r.correct / r.totalQuestions) * 100))
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / total)
    const avgAccuracy = Math.round(results.reduce((a, r) => a + r.accuracy, 0) / total)
    const bestScore = Math.max(...scores)

    const trend = results.slice(-7).map(r => ({
      label: r.attemptedAt?.slice(5, 10) || '',
      accuracy: r.accuracy,
    }))

    return { total, avgScore, avgAccuracy, bestScore, trend }
  },

  getRecentMistakes: () => {
    return get().attempts
      .filter(a => a.status === 'wrong')
      .sort((a, b) => (b.attemptedAt || '').localeCompare(a.attemptedAt || ''))
      .slice(0, 10)
  },
}))
