// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Cairo } from 'next/font/google'

// الاستدعاءات بالمسارات النسبية الصحيحة
import './globals.css'
import { AuthProvider } from '../lib/context/AuthContext'
import { OnboardingProvider } from '../lib/context/OnboardingContext'
import { LanguageProvider } from '../lib/context/LanguageContext'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo',
  display: 'swap',
  preload: true,
})

// إعدادات الـ Metadata شاملة ملف الـ Manifest للـ PWA
export const metadata: Metadata = {
  title: 'إيليت سينرجي — منصة التعاون الأكاديمي',
  description:
    'منصة تعاون أكاديمي تجمع الطلاب لبناء مشاريع حقيقية معاً، واكتساب الخبرة، والنمو من خلال التعلم بين الأقران.',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  manifest: '/manifest.json',
}

// إعدادات لون المتصفح للموبايل
export const viewport: Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans bg-bg-cream`}>
        <AuthProvider>
          <OnboardingProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </OnboardingProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
