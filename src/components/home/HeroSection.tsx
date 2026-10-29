// src/components/home/HeroSection.tsx
'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/context/AuthContext'
import { useLanguage } from '@/lib/context/LanguageContext'

const HeroOrb = dynamic(() => import('@/components/3d/HeroOrb').then((m) => m.HeroOrb), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-orange-50" />,
})

export function HeroSection() {
  const { isAuthenticated, user } = useAuth()
  const { t, lang } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="section-container pt-2 pb-10 md:pt-4 md:pb-12 lg:pt-6 lg:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left content */}
          <div className="order-1 lg:order-1 flex flex-col justify-center">
            {isAuthenticated ? (
              <>
                <p className="text-brand-orange font-bold text-sm md:text-base mb-2 uppercase tracking-wider">
                  {lang === 'ar' ? `منور يا ${user?.name}!` : `Welcome back, ${user?.name}!`}
                </p>
                <h1 className="text-3xl md:text-5xl lg:text-5xl font-extrabold text-text-primary leading-tight mb-4">
                  {t('home.heroTitle')}{' '}
                  <span className="text-brand-orange">{t('home.heroTitleHighlight')}</span>
                </h1>
                <p className="text-text-body text-base md:text-lg mb-4 max-w-lg leading-relaxed">
                  {t('home.heroSubtitle')}
                </p>
                {user?.skills && user.skills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      {lang === 'ar' ? 'تركيزك الحالي:' : 'Your focus:'}
                    </span>
                    {user.skills.slice(0, 3).map(s => (
                      <span key={s} className="bg-orange-100 text-brand-orange font-semibold text-xs px-2.5 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h1 className="text-3xl md:text-5xl lg:text-5xl font-extrabold text-text-primary leading-[1.18] mb-4">
                  {lang === 'ar' ? (
                    <>
                      ابني مستقبلك مع <span className="text-brand-orange">إيليت سينرجي</span>
                    </>
                  ) : (
                    <>
                      Build Your Future With <span className="text-brand-orange">Elite Synergy</span>
                    </>
                  )}
                </h1>
                <p className="text-text-body text-sm md:text-base mb-6 leading-relaxed max-w-lg">
                  {t('home.heroSubtitle')}
                </p>
              </>
            )}

            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/practical">
                    <Button variant="primary" size="lg">{t('home.exploreProjects')}</Button>
                  </Link>
                  <Link href="/peers">
                    <Button variant="outline" size="lg">{t('home.findPeers')}</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="primary" size="lg">{t('home.joinNow')}</Button>
                  </Link>
                  <Link href="#about">
                    <Button variant="outline" size="lg">{t('common.learnMore')}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right: interactive 3D hero card (drag to rotate, wheel to zoom) */}
          <div className="order-2 lg:order-2 flex flex-col items-center lg:items-end gap-3">
            <div className="relative w-full max-w-lg lg:max-w-xl aspect-[16/10] rounded-3xl overflow-hidden shadow-lg border border-orange-100/50 bg-white/60 backdrop-blur-sm">
              <HeroOrb />
            </div>
            <p className="text-xs text-text-muted">
              {lang === 'ar' ? 'اسحب لتدوير الصورة، واستخدم عجلة الماوس للزووم' : 'Drag to rotate, scroll wheel to zoom'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
