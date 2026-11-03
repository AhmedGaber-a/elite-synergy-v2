'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/lib/context/LanguageContext'

interface Transaction { id: string; amount: number; reason: string; source: string; createdAt: string }
interface Exam { id: string; skill: string; attempts: number; questions: { question: string; options: string[] }[]; teacher: { name: string } }
interface Dashboard {
  points: number
  transactions: Transaction[]
  skillsLearned: { id: string; skill: string; score: number | null; teacher: { name: string } }[]
  skillsTaught: { id: string; skill: string; status: string; learner: { name: string } }[]
  pendingExams: Exam[]
}

const MAX_ATTEMPTS = 2

export default function PointsPage() {
  const { t, lang } = useLanguage()
  const [data, setData] = useState<Dashboard | null>(null)
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const [message, setMessage] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/points', { credentials: 'include', cache: 'no-store' })
    if (res.ok) setData(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  const statusLabel = (s: string) =>
    s === 'PASSED' ? t('status.passed') : s === 'FAILED' ? t('status.failed') : t('status.pending')

  const submitExam = async (exam: Exam) => {
    const chosen = answers[exam.id] || []
    if (chosen.length !== exam.questions.length || chosen.some((c) => c === undefined)) return
    setBusy(exam.id)
    const res = await fetch(`/api/peers/endorse/${exam.id}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ answers: chosen }),
    })
    const body = await res.json().catch(() => ({}))
    setBusy(null)
    if (!res.ok) {
      setMessage((m) => ({ ...m, [exam.id]: body.error || 'Error' }))
      return
    }
    setMessage((m) => ({
      ...m,
      [exam.id]: `${body.score}% — ${body.passed ? t('points.passed') : t('points.failed')}`,
    }))
    load()
  }

  return (
    <AppLayout>
      <div className="bg-bg-cream min-h-screen">
        <div className="section-container py-12 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-2">{t('points.title')}</h1>
          <p className="text-text-body mb-8">{t('points.subtitle')}</p>

          <div className="bg-brand-navy text-white rounded-3xl p-6 mb-10 flex items-center justify-between">
            <span className="text-white/70 font-semibold">{t('points.total')}</span>
            <span className="text-4xl font-extrabold">{data?.points ?? 0}</span>
          </div>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-text-primary mb-4">{t('points.pendingExams')}</h2>
            {!data || data.pendingExams.length === 0 ? (
              <p className="text-text-muted">{t('points.noExams')}</p>
            ) : (
              <div className="space-y-6">
                {data.pendingExams.map((exam) => {
                  const chosen = answers[exam.id] || []
                  const ready = chosen.length === exam.questions.length && chosen.every((c) => c !== undefined)
                  return (
                    <div key={exam.id} className="bg-white rounded-3xl border border-orange-50 p-6">
                      <p className="font-bold text-text-primary mb-1">
                        {t('points.exam')}: {exam.skill}
                      </p>
                      <p className="text-sm text-text-muted mb-4">
                        {t('points.taughtBy')} {exam.teacher.name} · {t('points.attemptsLeft')}: {Math.max(0, MAX_ATTEMPTS - exam.attempts)}
                      </p>
                      {exam.questions.map((q, qi) => (
                        <div key={qi} className="mb-4">
                          <p className="font-semibold text-text-primary mb-2">{t('points.questionLabel')} {qi + 1}: {q.question}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map((opt, oi) => (
                              <label key={oi} className={`flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer ${chosen[qi] === oi ? 'border-brand-orange bg-orange-50' : 'border-gray-200'}`}>
                                <input
                                  type="radio"
                                  name={`${exam.id}-${qi}`}
                                  checked={chosen[qi] === oi}
                                  onChange={() => {
                                    const next = [...(answers[exam.id] || [])]
                                    next[qi] = oi
                                    setAnswers((a) => ({ ...a, [exam.id]: next }))
                                  }}
                                />
                                <span className="text-sm">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center gap-3">
                        <Button variant="primary" disabled={!ready || busy === exam.id} onClick={() => submitExam(exam)}>
                          {t('points.submitAnswers')}
                        </Button>
                        {message[exam.id] && <span className="text-sm font-semibold text-text-body">{message[exam.id]}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-text-primary mb-4">{t('points.skillsLearned')}</h2>
            {data?.skillsLearned.length ? (
              <ul className="flex flex-wrap gap-2">
                {data.skillsLearned.map((s) => (
                  <li key={s.id} className="bg-orange-100 text-brand-orange font-semibold text-sm px-3 py-1 rounded-full">
                    {s.skill} · {t('points.taughtBy')} {s.teacher.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-muted">—</p>
            )}
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-text-primary mb-4">{t('points.teachingGiven')}</h2>
            {data?.skillsTaught.length ? (
              <ul className="space-y-2">
                {data.skillsTaught.map((s) => (
                  <li key={s.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex justify-between text-sm">
                    <span>{s.skill} — {s.learner.name}</span>
                    <span className="font-semibold">{statusLabel(s.status)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-muted">—</p>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">{t('points.history')}</h2>
            {!data || data.transactions.length === 0 ? (
              <p className="text-text-muted">{t('points.noHistory')}</p>
            ) : (
              <ul className="space-y-2">
                {data.transactions.map((tx) => (
                  <li key={tx.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex justify-between items-center text-sm">
                    <span className="text-text-body">
                      {tx.reason}
                      <span className="block text-xs text-text-muted">{new Date(tx.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                    </span>
                    <span className={`font-extrabold ${tx.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
