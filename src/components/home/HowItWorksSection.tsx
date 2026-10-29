'use client'
import React from 'react'
import { UserPlus, Users, Trophy } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { TiltCard } from '@/components/3d/TiltCard'
import { useLanguage } from '@/lib/context/LanguageContext'

const STEPS = [
  {
    icon: UserPlus,
    en: { title: 'Build your profile', desc: 'Upload your CV, list your skills and share the work you have already done.' },
    ar: { title: 'ابني بروفايلك', desc: 'ارفع الـ CV وسجّل مهاراتك واعرض الشغل اللي عملته قبل كده.' },
    accent: 'text-brand-orange bg-orange-100',
  },
  {
    icon: Users,
    en: { title: 'Find your peers', desc: 'Match with classmates whose skills complement yours and form a team.' },
    ar: { title: 'اتعرف على زمايلك', desc: 'لاقي زملاء مهاراتهم بتكمّل مهاراتك وكوّنوا فريق مع بعض.' },
    accent: 'text-brand-teal bg-teal-100',
  },
  {
    icon: Trophy,
    en: { title: 'Ship real projects', desc: 'Work on practical cases, get reviewed and earn points toward your Elite badge.' },
    ar: { title: 'نفّذ مشاريع حقيقية', desc: 'اشتغل على حالات عملية، واتقيّم، واكسب نقاط توصلك لشارة Elite.' },
    accent: 'text-blue-600 bg-blue-100',
  },
]

export function HowItWorksSection() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'

  return (
    <section className="py-16 md:py-24 bg-white/70 backdrop-blur-sm">
      <div className="section-container">
        <SectionHeader
          title={isAr ? 'إزاي بيشتغل الموقع؟' : 'How it works'}
          subtitle={isAr ? 'ثلاث خطوات بس عشان تبدأ تشتغل على مشاريع حقيقية مع زمايلك.' : 'Three steps to start building real projects with your classmates.'}
        />

        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 [perspective:1200px]">
          {STEPS.map((step, i) => {
            const copy = isAr ? step.ar : step.en
            const Icon = step.icon
            return (
              <TiltCard key={i} className="h-full">
                <div className="relative h-full bg-bg-cream rounded-3xl p-6 md:p-8 border border-orange-50 shadow-sm overflow-hidden">
                  <span className="absolute top-4 end-6 text-6xl font-black text-orange-100 select-none">
                    0{i + 1}
                  </span>
                  <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${step.accent}`}>
                    <Icon size={26} />
                  </div>
                  <h3 className="relative text-xl font-bold text-text-primary mb-3">{copy.title}</h3>
                  <p className="relative text-text-body leading-relaxed">{copy.desc}</p>
                </div>
              </TiltCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
