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
  '/auth/verify',
  '/onboarding/register',
  '/onboarding/skills',
  '/onboarding/projects',
  '/onboarding/cv',
  '/onboarding/review'
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading) {
      const hasSession = isAuthenticated || !!user
      if (!hasSession) {
        // If the route is not public, redirect to login
        const isPublic = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/assets') || pathname.startsWith('/auth/verify')
        if (!isPublic) {
          router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
        }
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router, mounted])

  // Wait for hydration (localStorage is only readable on the client).
  if (!mounted) return null
  const isPublic = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/assets') || pathname.startsWith('/auth/verify')
  // Public pages render right away while the session check runs, so the first paint is not blank.
  // Protected pages still wait, to avoid flashing private content.
  if (isLoading && !isPublic) return null
  if (!isAuthenticated && !user && !isPublic) return null

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
