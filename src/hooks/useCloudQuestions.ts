'use client'

import { useState, useEffect, useRef } from 'react'
import { ALL_PYQS, getPYQsByChapter, MOCK_TESTS } from '@/data/pyqs'
import type { PYQEntry } from '@/data/pyqs'
import type { Subject } from '@/types'

interface UseCloudQuestionsResult {
  questions: PYQEntry[]
  source: 'cloud' | 'local' | 'loading'
}

export function useCloudQuestions(subject?: Subject, chapterId?: string): UseCloudQuestionsResult {
  // Start with local data immediately, no loading state
  const localData = chapterId ? getPYQsByChapter(chapterId) : subject ? ALL_PYQS.filter(q => q.subject === subject) : []
  const [result, setResult] = useState<UseCloudQuestionsResult>({ questions: localData, source: 'local' })
  const cache = useRef<Map<string, PYQEntry[]>>(new Map())
  const fetched = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!chapterId) { setResult({ questions: [], source: 'local' }); return }
    const cacheKey = `${subject || 'all'}_${chapterId || 'all'}`
    if (fetched.current.has(cacheKey)) return
    fetched.current.add(cacheKey)

    const params = new URLSearchParams()
    if (subject) params.set('subject', subject)
    if (chapterId) params.set('chapterId', chapterId)

    fetch(`/api/pyq-questions?${params}`)
      .then(res => res.json())
      .then(data => {
        if (data.questions && data.questions.length > 0) {
          cache.current.set(cacheKey, data.questions)
          setResult({ questions: data.questions, source: data.source || 'cloud' })
        }
      })
      .catch(() => { /* keep local fallback */ })
  }, [subject, chapterId])

  return result
}

export function useCloudMockQuestions(mockTestId: string): { questions: PYQEntry[]; source: 'cloud' | 'local' | 'loading' } {
  const mock = MOCK_TESTS.find(m => m.id === mockTestId)
  const localData = mock ? mock.questionIds.map(id => ALL_PYQS.find(q => q.id === id)).filter(Boolean) as PYQEntry[] : []
  const [result, setResult] = useState<{ questions: PYQEntry[]; source: 'cloud' | 'local' | 'loading' }>({ questions: localData, source: 'local' })
  const fetched = useRef(false)

  useEffect(() => {
    if (!mockTestId || !mock) { setResult({ questions: [], source: 'local' }); return }
    if (fetched.current) return
    fetched.current = true

    fetch('/api/pyq-questions')
      .then(res => res.json())
      .then(data => {
        if (data.questions && data.questions.length > 0) {
          const filtered = data.questions.filter((q: PYQEntry) => mock.questionIds.includes(q.id))
          if (filtered.length > 0) setResult({ questions: filtered, source: data.source || 'cloud' })
        }
      })
      .catch(() => { /* keep local fallback */ })
  }, [mockTestId])

  return result
}
