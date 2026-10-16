// src/app/layout.tsx
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import '@/app/globals.css'
import { AuthProvider } from '@/lib/context/AuthContext'
import { OnboardingProvider } from '@/lib/context/OnboardingContext'
import { LanguageProvider } from '@/lib/context/LanguageContext'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Elite Synergy — Best Learning Education Platform',
  description:
    'A collaborative platform where students build real projects together, earn credits, and grow through peer-to-peer learning.',
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
