'use client'
import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useLanguage } from '@/lib/context/LanguageContext'

const COPY = {
  en: {
    title: 'Terms of Service',
    updated: 'Last updated: October 2026',
    sections: [
      {
        h: 'Using the platform',
        p: 'Elite Synergy is for students to learn and build projects together. Use your real name and university email, and keep your account to yourself.',
      },
      {
        h: 'Your content',
        p: 'You are responsible for what you post, upload or send. Do not share content that is offensive, illegal, or that belongs to someone else without permission.',
      },
      {
        h: 'Academic honesty',
        p: 'Projects shared on the platform must be your own work or clearly credit the people who helped. Submitting someone else\'s work as yours is not allowed.',
      },
      {
        h: 'Changes',
        p: 'We may update these terms. Continuing to use the platform after an update means you accept the new terms.',
      },
    ],
  },
  ar: {
    title: 'شروط الاستخدام',
    updated: 'آخر تحديث: أكتوبر 2026',
    sections: [
      {
        h: 'استخدام المنصة',
        p: 'إيليت سينرجي للطلاب يتعلموا ويبنوا مشاريع مع بعض. استخدم اسمك الحقيقي وإيميل الجامعة، وحافظ على حسابك.',
      },
      {
        h: 'المحتوى بتاعك',
        p: 'انت مسؤول عن اللي بتنشره أو ترفعه أو تبعته. ممنوع تنشر محتوى مسيء أو غير قانوني، أو محتوى تابع لحد تاني من غير إذنه.',
      },
      {
        h: 'الأمانة الأكاديمية',
        p: 'المشاريع اللي بتتشارك على المنصة لازم تكون شغلك، أو تنسب الفضل لأصحابه بشكل واضح. تسليم شغل حد تاني على إنه شغلك ممنوع.',
      },
      {
        h: 'التعديلات',
        p: 'ممكن نعدّل الشروط دي. استمرارك في استخدام المنصة بعد أي تعديل معناه إنك وافقت عليه.',
      },
    ],
  },
}

export default function TermsPage() {
  const { lang } = useLanguage()
  const c = lang === 'ar' ? COPY.ar : COPY.en

  return (
    <AppLayout>
      <div className="bg-bg-cream min-h-screen">
        <div className="section-container py-16 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-2">{c.title}</h1>
          <p className="text-text-muted text-sm mb-10">{c.updated}</p>
          <div className="space-y-8">
            {c.sections.map((s) => (
              <section key={s.h}>
                <h2 className="text-xl font-bold text-text-primary mb-2">{s.h}</h2>
                <p className="text-text-body leading-relaxed">{s.p}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
