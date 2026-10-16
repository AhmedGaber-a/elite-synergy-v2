'use client'
import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { HeroSection } from '@/components/home/HeroSection'
import { WhatIsSection } from '@/components/home/WhatIsSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { CTABanner } from '@/components/home/CTABanner'

import { useAuth } from '@/lib/context/AuthContext'

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  
  return (
    <AppLayout>
      <HeroSection />
      <WhatIsSection />
      <FeaturesSection />
      <TestimonialsSection />
      {!isAuthenticated && <CTABanner />}
    </AppLayout>
  )
}
