// src/components/home/HeroSection.tsx
'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/context/AuthContext'
import { useLanguage } from '@/lib/context/LanguageContext'

export function HeroSection() {
  const { isAuthenticated, user } = useAuth()
  const { t, lang } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-bg-cream">
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

          {/* Right Hero Image */}
          <div className="order-2 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg lg:max-w-xl aspect-[16/10] flex items-center justify-center rounded-3xl overflow-hidden shadow-lg border border-orange-100/50 bg-white">
              <Image
                src="/Diverse Student Study Group.png"
                alt="Diverse Student Study Group"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 550px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
