// src/components/home/FeaturesSection.tsx
'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { TiltCard } from '@/components/3d/TiltCard'
import { useAuth } from '@/lib/context/AuthContext'
import { useLanguage } from '@/lib/context/LanguageContext'
import { ArrowRight, BookOpen, Users, MessageSquare } from 'lucide-react'

export function FeaturesSection() {
  const { isAuthenticated } = useAuth()
  const { t, lang } = useLanguage()

  const FEATURES = [
    {
      id: 'practical',
      title: t('home.practicalTitle'),
      description: t('home.practicalDesc'),
      image: '/assets/practical_student.jpg',
      alt: 'Female student in a niqab working on a laptop solving practical case',
      badge: lang === 'ar' ? 'تطبيق وعملي' : 'Practical Work',
      icon: <BookOpen size={16} className="text-brand-orange" />,
      authHref: '/practical',
    },
    {
      id: 'peers',
      title: t('home.peersTitle'),
      description: t('home.peersDesc'),
      image: '/assets/peers_students.jpg',
      alt: 'Two female students studying together and collaborating on projects',
      badge: lang === 'ar' ? 'مذاكرة وشراكة' : 'Peer Study',
      icon: <Users size={16} className="text-brand-teal" />,
      authHref: '/peers',
    },
    {
      id: 'community',
      title: t('home.communityTitle'),
      description: t('home.communityDesc'),
      image: '/assets/community_library.jpg',
      alt: 'Group of male students collaborating in the university library',
      badge: lang === 'ar' ? 'مجتمع الكلية' : 'Community Hub',
      icon: <MessageSquare size={16} className="text-blue-500" />,
      authHref: '/community',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-bg-cream/70 backdrop-blur-sm">
      <div className="section-container">
        <SectionHeader
          title={t('home.featuresTitle')}
          subtitle={t('home.featuresSubtitle')}
        />

        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 [perspective:1200px]">
          {FEATURES.map((feature) => {
            const href = isAuthenticated ? feature.authHref : '/auth/login'
            return (
              <Link key={feature.id} href={href} className="group block h-full">
                <TiltCard className="h-full">
                <div className="bg-white rounded-3xl overflow-hidden h-full flex flex-col border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl">
                  {/* High quality local asset image */}
                  <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
                    />
                    <div className="absolute top-4 start-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-text-primary flex items-center gap-1.5 shadow-sm">
                      {feature.icon}
                      <span>{feature.badge}</span>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-3 group-hover:text-brand-orange transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-text-body text-sm md:text-base leading-relaxed flex-1 mb-6">
                      {feature.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm font-bold text-brand-orange group-hover:text-brand-orange-dark transition-colors pt-4 border-t border-gray-100">
                      <span>{lang === 'ar' ? 'ادخل ع القسم' : 'Explore Section'}</span>
                      <ArrowRight size={16} className="rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
                </TiltCard>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
