'use client'
import React, { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/context/AuthContext'
import { useLanguage } from '@/lib/context/LanguageContext'

function EndorseForm() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const params = useSearchParams()
  const learnerId = params.get('learnerId') || ''
  const learnerName = params.get('learnerName') || ''

  const mySkills = Array.from(new Set([...(user?.skills || []), ...(user?.extraSkills || [])]))
  const [skill, setSkill] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setMessage('')
    setBusy(true)
    const res = await fetch('/api/peers/endorse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ learnerId, skill }),
    })
    const body = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) {
      setError(body.error || 'Error')
      return
    }
    setMessage(t('endorse.created'))
  }

  if (!learnerId) {
    return <p className="text-text-muted">{t('endorse.noPeer')}</p>
  }

  return (
    <div className="bg-white rounded-3xl border border-orange-50 p-6 md:p-8 max-w-xl">
      <p className="text-sm text-text-muted mb-1">{t('endorse.peer')}</p>
      <p className="font-bold text-text-primary text-lg mb-6">{learnerName || learnerId}</p>

      {mySkills.length === 0 ? (
        <p className="text-text-body mb-4">{t('endorse.noSkills')}</p>
      ) : (
        <>
          <label className="block text-sm font-bold text-text-primary mb-2" htmlFor="skill">{t('endorse.skill')}</label>
          <select
            id="skill"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 mb-6 bg-white"
          >
            <option value="">{t('endorse.selectSkill')}</option>
            {mySkills.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Button variant="primary" disabled={!skill || busy} onClick={submit}>
            {t('endorse.submit')}
          </Button>
        </>
      )}

      {message && <p className="mt-4 text-green-700 font-semibold">{message}</p>}
      {error && <p className="mt-4 text-red-600 font-semibold">{error}</p>}
      <p className="mt-6 text-sm">
        <Link href="/points" className="text-brand-orange font-bold">{t('nav.points')} →</Link>
      </p>
    </div>
  )
}

export default function EndorsePage() {
  const { t } = useLanguage()
  return (
    <AppLayout>
      <div className="bg-bg-cream min-h-screen">
        <div className="section-container py-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-2">{t('endorse.title')}</h1>
          <p className="text-text-body mb-8 max-w-2xl">{t('endorse.subtitle')}</p>
          <Suspense fallback={null}>
            <EndorseForm />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  )
}
