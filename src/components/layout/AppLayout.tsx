'use client'
import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { useAuth } from '@/lib/context/AuthContext'

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/auth/login',
  '/onboarding/register',
  '/onboarding/skills',
  '/onboarding/projects',
  '/onboarding/cv',
  '/onboarding/review'
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      // If the route is not public, redirect to login
      const isPublic = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/assets')
      if (!isPublic) {
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
      }
    }
  }, [isAuthenticated, pathname, router, mounted])

  // Prevent flash of protected content
  if (!mounted) return null
  const isPublic = PUBLIC_ROUTES.includes(pathname)
  if (!isAuthenticated && !isPublic) return null

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
