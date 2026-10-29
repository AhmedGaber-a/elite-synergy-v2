// src/components/home/WhatIsSection.tsx
'use client'
import React from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useLanguage } from '@/lib/context/LanguageContext'

const PILLARS = [
  {
    en: { title: 'From theory to practice', desc: 'Apply what you study to real cases instead of only memorizing it.' },
    ar: { title: 'من المذاكرة للتطبيق', desc: 'طبّق اللي بتذاكره على حالات حقيقية بدل ما تحفظه بس.' },
  },
  {
    en: { title: 'Learn with your peers', desc: 'Team up with students from BIS, Computer Science and Accounting.' },
    ar: { title: 'اتعلم مع زمايلك', desc: 'اشتغل مع طلاب من نظم المعلومات والحاسبات والمحاسبة.' },
  },
  {
    en: { title: 'Prove your work', desc: 'Every finished project adds points and a badge to your profile.' },
    ar: { title: 'اثبت شغلك', desc: 'كل مشروع بتخلصه بيضيف نقاط وشارة لبروفايلك.' },
  },
]

export function WhatIsSection() {
  const { t, lang } = useLanguage()
  const isAr = lang === 'ar'
  return (
    <section id="about" className="py-16 md:py-20 bg-white border-y border-orange-50">
      <div className="section-container">
        <SectionHeader
          title={t('home.whatIsTitle')}
          subtitle={t('home.whatIsSubtitle')}
        />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => {
            const copy = isAr ? p.ar : p.en
            return (
              <div key={i} className="rounded-2xl border border-orange-100 bg-bg-cream p-6 text-center">
                <p className="text-brand-orange font-extrabold text-sm mb-2">0{i + 1}</p>
                <h3 className="text-lg font-bold text-text-primary mb-2">{copy.title}</h3>
                <p className="text-text-body text-sm leading-relaxed">{copy.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
