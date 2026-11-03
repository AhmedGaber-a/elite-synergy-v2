'use client'
import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/context/AuthContext'
import { useLanguage } from '@/lib/context/LanguageContext'

interface EndorseModalProps {
  learnerId: string
  learnerName: string
  onClose: () => void
}

/** Teach a skill from your own profile to a connected peer. The peer then takes an AI exam. */
export function EndorseModal({ learnerId, learnerName, onClose }: EndorseModalProps) {
  const { t } = useLanguage()
  const { user } = useAuth()
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

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-text-primary">{t('endorse.title')}</h3>
          <button onClick={onClose} aria-label={t('common.close')} className="text-text-muted hover:text-text-primary"><X size={20} /></button>
        </div>
        <p className="text-sm text-text-body mb-4">{t('endorse.subtitle')}</p>
        <p className="text-sm text-text-muted mb-1">{t('endorse.peer')}</p>
        <p className="font-bold text-text-primary mb-5">{learnerName}</p>

        {mySkills.length === 0 ? (
          <p className="text-text-body mb-2">{t('endorse.noSkills')}</p>
        ) : (
          <>
            <label htmlFor="endorse-skill" className="block text-sm font-bold text-text-primary mb-2">{t('endorse.skill')}</label>
            <select
              id="endorse-skill"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 mb-5 bg-white"
            >
              <option value="">{t('endorse.selectSkill')}</option>
              {mySkills.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Button variant="primary" disabled={!skill || busy} onClick={submit}>{t('endorse.submit')}</Button>
          </>
        )}
        {message && <p className="mt-4 text-green-700 font-semibold">{message}</p>}
        {error && <p className="mt-4 text-red-600 font-semibold">{error}</p>}
      </div>
    </div>
  )
}
