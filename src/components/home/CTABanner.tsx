// src/components/home/CTABanner.tsx
'use client'
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/lib/context/LanguageContext'

export function CTABanner() {
  const { t } = useLanguage()
  return (
    <section className="py-20 bg-brand-navy text-white text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-brand-blue/30 to-transparent pointer-events-none" />
      <div className="section-container relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 max-w-2xl mx-auto leading-tight">
          {t('home.ctaTitle')}
        </h2>
        <p className="text-white/70 text-sm md:text-base mb-8 max-w-lg mx-auto">
          {t('home.ctaSubtitle')}
        </p>
        <Link href="/auth/login">
          <Button variant="primary" size="lg" className="rounded-2xl px-8 font-bold shadow-lg shadow-orange-500/20">
            {t('home.joinNow')}
          </Button>
        </Link>
      </div>
    </section>
  )
}
