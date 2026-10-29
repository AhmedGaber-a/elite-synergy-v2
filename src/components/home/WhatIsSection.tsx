// src/components/home/WhatIsSection.tsx
'use client'
import React from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useLanguage } from '@/lib/context/LanguageContext'

export function WhatIsSection() {
  const { t } = useLanguage()
  return (
    <section id="about" className="py-16 bg-white/70 backdrop-blur-sm border-y border-orange-50">
      <div className="section-container">
        <SectionHeader
          title={t('home.whatIsTitle')}
          subtitle={t('home.whatIsSubtitle')}
        />
      </div>
    </section>
  )
}
