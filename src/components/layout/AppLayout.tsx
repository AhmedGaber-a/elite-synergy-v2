'use client'
import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, Users, BookOpen, MessageSquare, Globe } from 'lucide-react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { useAuth } from '@/lib/context/AuthContext'
import { cn } from '@/lib/utils/cn'

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

const BOTTOM_NAV_ITEMS = [
  { href: '/', icon: Home, labelAr: 'الرئيسية', labelEn: 'Home' },
  { href: '/practical', icon: BookOpen, labelAr: 'مشاريع', labelEn: 'Projects' },
  { href: '/peers', icon: Users, labelAr: 'الأقران', labelEn: 'Peers' },
  { href: '/community', icon: Globe, labelAr: 'المجتمع', labelEn: 'Community' },
  { href: '/messages', icon: MessageSquare, labelAr: 'الرسائل', labelEn: 'Messages' },
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

  // Prevent flash of protected content
  if (!mounted || isLoading) return null
  const isPublic = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/assets') || pathname.startsWith('/auth/verify')
  if (!isAuthenticated && !user && !isPublic) return null

  // Hide bottom nav on meeting pages
  const hideMobileNav = pathname.startsWith('/meeting') || !isAuthenticated

  return (
    <>
      <Navbar />
      <main className={cn('min-h-screen', !hideMobileNav && 'pb-20 md:pb-0')}>{children}</main>
      <Footer />

      {/* Mobile Bottom Navigation Bar — PWA-ready */}
      {!hideMobileNav && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
          aria-label="التنقل السفلي"
        >
          <div className="flex items-center justify-around px-1 py-1.5 safe-area-inset-bottom">
            {BOTTOM_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-2xl transition-all min-w-[52px]',
                    isActive
                      ? 'text-brand-orange bg-orange-50'
                      : 'text-text-muted hover:text-text-primary hover:bg-gray-50'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    size={20}
                    className={cn(
                      'transition-transform',
                      isActive && 'scale-110'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={cn(
                    'text-[10px] font-semibold leading-none tracking-tight',
                    isActive ? 'text-brand-orange' : 'text-text-muted'
                  )}>
                    {item.labelAr}
                  </span>
                  {isActive && (
                    <span className="absolute top-0 w-1 h-1 bg-brand-orange rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </>
  )
}
