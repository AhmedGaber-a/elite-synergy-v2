'use client'
import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useLanguage } from '@/lib/context/LanguageContext'

const COPY = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: October 2026',
    sections: [
      {
        h: 'What we collect',
        p: 'Your name, university email, college and major, skills, bio, optional CV and portfolio files, and the messages and posts you send on the platform.',
      },
      {
        h: 'How we use it',
        p: 'To create your account, match you with peers and teams, show your profile and project history, and send you notifications about your activity.',
      },
      {
        h: 'Who can see it',
        p: 'Your profile details are visible to other registered students. Your password is stored encrypted and is never shown to anyone.',
      },
      {
        h: 'Your choices',
        p: 'You can edit your profile at any time. To ask for your account and data to be deleted, contact the Elite Synergy team.',
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    updated: 'آخر تحديث: أكتوبر 2026',
    sections: [
      {
        h: 'البيانات اللي بنجمعها',
        p: 'اسمك، وإيميل الجامعة، والكلية والتخصص، والمهارات، والنبذة، وملفات الـ CV والأعمال لو رفعتها، والرسايل والمنشورات اللي بتبعتها على المنصة.',
      },
      {
        h: 'بنستخدمها في إيه',
        p: 'عشان نعمل حسابك، ونوصلك بزملاء وفرق، ونعرض بروفايلك وتاريخ مشاريعك، ونبعتلك إشعارات عن نشاطك.',
      },
      {
        h: 'مين يقدر يشوفها',
        p: 'تفاصيل بروفايلك بتظهر للطلاب المسجلين الآخرين. كلمة السر بتتخزن مشفّرة ومش بتظهر لأي حد.',
      },
      {
        h: 'اختياراتك',
        p: 'تقدر تعدّل بروفايلك في أي وقت. ولو عايز حسابك وبياناتك تتمسح، كلم فريق إيليت سينرجي.',
      },
    ],
  },
}

export default function PrivacyPage() {
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
