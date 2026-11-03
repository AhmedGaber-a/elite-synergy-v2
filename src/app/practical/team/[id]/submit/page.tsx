'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/lib/context/LanguageContext'

export default function TeamSubmitPage() {
  const { t } = useLanguage()
  const params = useParams<{ id: string }>()
  const teamId = params?.id || ''
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setBusy(true)
    const res = await fetch(`/api/teams/${teamId}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ url, notes }),
    })
    const body = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) {
      setError(body.error || 'Error')
      return
    }
    setDone(true)
  }

  return (
    <AppLayout>
      <div className="bg-bg-cream min-h-screen">
        <div className="section-container py-12 max-w-2xl">
          <h1 className="text-3xl font-extrabold text-text-primary mb-2">{t('team.submitTitle')}</h1>
          <p className="text-text-body mb-8">{t('team.submitSubtitle')}</p>

          {done ? (
            <p className="text-green-700 font-bold text-lg">{t('team.submitted')}</p>
          ) : (
            <div className="bg-white rounded-3xl border border-orange-50 p-6 md:p-8 space-y-5">
              <div>
                <label htmlFor="url" className="block text-sm font-bold text-text-primary mb-2">{t('team.submitLink')}</label>
                <input
                  id="url"
                  dir="ltr"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3"
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-bold text-text-primary mb-2">{t('team.submitNotes')}</label>
                <textarea
                  id="notes"
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3"
                />
              </div>
              {error && <p className="text-red-600 font-semibold">{error}</p>}
              <Button variant="primary" disabled={busy || (!url.trim() && !notes.trim())} onClick={submit}>
                {t('team.submitButton')}
              </Button>
            </div>
          )}

          <p className="mt-8 text-sm">
            <Link href={`/practical/team/${teamId}`} className="text-brand-orange font-bold">{t('team.backToProjects')}</Link>
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
