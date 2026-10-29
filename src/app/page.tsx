'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import { AppLayout } from '@/components/layout/AppLayout'
import { HeroSection } from '@/components/home/HeroSection'
import { WhatIsSection } from '@/components/home/WhatIsSection'
import { HowItWorksSection } from '@/components/home/HowItWorksSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { CTABanner } from '@/components/home/CTABanner'
import { ScrollReveal } from '@/components/3d/ScrollReveal'
import { SmoothScroll } from '@/components/3d/SmoothScroll'

import { useAuth } from '@/lib/context/AuthContext'

// Three.js is heavy, so the 3D backdrop is loaded only in the browser.
const SpaceBackground = dynamic(() => import('@/components/3d/SpaceBackground'), { ssr: false })

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <SpaceBackground />
      <SmoothScroll />
      <AppLayout>
        <HeroSection />
        <ScrollReveal><WhatIsSection /></ScrollReveal>
        <ScrollReveal><HowItWorksSection /></ScrollReveal>
        <ScrollReveal><FeaturesSection /></ScrollReveal>
        <ScrollReveal><TestimonialsSection /></ScrollReveal>
        {!isAuthenticated && <CTABanner />}
      </AppLayout>
    </>
  )
}
