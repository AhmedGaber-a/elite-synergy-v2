// src/lib/context/LanguageContext.tsx
'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { en, TranslationKey } from '@/lib/i18n/en'
import { ar } from '@/lib/i18n/ar'

export type Lang = 'en' | 'ar'

export interface LanguageContextValue {
  lang: Lang
  dir: 'ltr' | 'rtl'
  isArabic: boolean
  isRTL: boolean
  t: (key: TranslationKey | string) => string
  toggleLang: () => void
  setLanguage: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  dir: 'ltr',
  isArabic: false,
  isRTL: false,
  t: (key) => key,
  toggleLang: () => {},
  setLanguage: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('elite-lang') as Lang | null
    if (stored === 'ar' || stored === 'en') {
      setLang(stored)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    const dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    localStorage.setItem('elite-lang', lang)
  }, [lang, mounted])

  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))
  const setLanguage = (newLang: Lang) => setLang(newLang)

  const t = (key: TranslationKey | string): string => {
    if (lang === 'ar') {
      return ar[key as TranslationKey] ?? en[key as TranslationKey] ?? key
    }
    return en[key as TranslationKey] ?? key
  }

  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr'
  const isArabic = lang === 'ar'
  const isRTL = dir === 'rtl'

  return (
    <LanguageContext.Provider value={{ lang, dir, isArabic, isRTL, t, toggleLang, setLanguage }}>
      <div dir={dir} className="w-full min-h-screen">
        {children}
      </div>
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
