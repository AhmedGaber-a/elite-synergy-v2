'use client'
import React from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/lib/context/LanguageContext'

const COPY = {
  en: {
    title: 'About Elite Synergy',
    intro:
      'Elite Synergy is a collaborative platform where students build real projects together, practice what they study, and grow through teamwork and peer mentorship.',
    missionTitle: 'Our mission',
    mission:
      'Close the gap between what we learn at university and what the job market expects, by giving every student a place to practice on real cases alongside classmates.',
    valuesTitle: 'What we believe in',
    values: [
      { title: 'Learn by doing', desc: 'Real cases teach more than memorizing for an exam.' },
      { title: 'Grow together', desc: 'Students from different majors share skills and support each other.' },
      { title: 'Recognize effort', desc: 'Finished work earns points and badges that show what you can do.' },
    ],
    ctaTitle: 'Ready to start?',
    ctaText: 'Create your account and find your first project or teammate.',
    cta: 'Join now',
  },
  ar: {
    title: 'عن إيليت سينرجي',
    intro:
      'إيليت سينرجي منصة تعاونية بيشتغل فيها الطلاب على مشاريع حقيقية مع بعض، ويطبقوا اللي بيذاكروه، ويكبروا من خلال الشغل الجماعي والإرشاد من الزملاء.',
    missionTitle: 'رسالتنا',
    mission:
      'نقلل الفجوة بين اللي بنتعلمه في الكلية واللي سوق الشغل بيطلبه، عن طريق مكان يتدرب فيه كل طالب على حالات حقيقية مع زملائه.',
    valuesTitle: 'اللي بنؤمن بيه',
    values: [
      { title: 'نتعلم بالتطبيق', desc: 'الحالات الحقيقية بتعلمك أكتر من الحفظ للامتحان.' },
      { title: 'نكبر مع بعض', desc: 'طلاب من تخصصات مختلفة بيتشاركوا المهارات ويدعموا بعض.' },
      { title: 'الشغل بيتقدّر', desc: 'كل مشروع بتخلصه بيكسبك نقاط وشارات توضح قدراتك.' },
    ],
    ctaTitle: 'جاهز تبدأ؟',
    ctaText: 'سجّل حسابك ولاقي أول مشروع أو زميل شغل.',
    cta: 'انضم الآن',
  },
}

export default function AboutPage() {
  const { lang } = useLanguage()
  const c = lang === 'ar' ? COPY.ar : COPY.en

  return (
    <AppLayout>
      <div className="bg-bg-cream min-h-screen">
        <div className="section-container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-6">{c.title}</h1>
            <p className="text-text-body text-base md:text-lg leading-relaxed">{c.intro}</p>
          </div>

          <div className="max-w-3xl mx-auto mt-14 bg-white rounded-3xl border border-orange-50 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-3">{c.missionTitle}</h2>
            <p className="text-text-body leading-relaxed">{c.mission}</p>
          </div>

          <div className="mt-14">
            <h2 className="text-2xl font-bold text-text-primary text-center mb-8">{c.valuesTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {c.values.map((v) => (
                <div key={v.title} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-brand-orange mb-2">{v.title}</h3>
                  <p className="text-text-body text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-2xl mx-auto mt-16 text-center bg-brand-navy text-white rounded-3xl p-10">
            <h2 className="text-2xl font-bold mb-3">{c.ctaTitle}</h2>
            <p className="text-white/70 mb-6">{c.ctaText}</p>
            <Link href="/auth/login">
              <Button variant="primary" size="lg">{c.cta}</Button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
