// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'

// الاستدعاءات بالمسارات النسبية الصحيحة
import './globals.css'
import { AuthProvider } from '../lib/context/AuthContext'
import { OnboardingProvider } from '../lib/context/OnboardingContext'
import { LanguageProvider } from '../lib/context/LanguageContext'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

// إعدادات الـ Metadata شاملة ملف الـ Manifest للـ PWA
export const metadata: Metadata = {
  title: 'Elite Synergy — Best Learning Education Platform',
  description:
    'A collaborative platform where students build real projects together, earn credits, and grow through peer-to-peer learning.',
  manifest: '/manifest.json',
}

// إعدادات لون المتصفح للموبايل
export const viewport: Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans bg-bg-cream`}>
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