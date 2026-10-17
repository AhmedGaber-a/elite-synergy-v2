// src/components/layout/Navbar.tsx
'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Bell, MessageSquare, ChevronDown } from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'
import { useLanguage } from '@/lib/context/LanguageContext'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { lang, t, toggleLang } = useLanguage()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const NAV_LINKS = [
    { href: '/', label: t('nav.home') },
    { href: '/practical', label: t('nav.practical') },
    { href: '/peers', label: t('nav.peers') },
    { href: '/community', label: t('nav.community') },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
  }, [pathname])

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100'
          : 'bg-bg-cream/95 backdrop-blur-sm border-b border-orange-100/40 shadow-sm'
      )}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange rounded-lg">
            <Image
              src="/assets/logo.png"
              alt="Elite Synergy Logo"
              width={150}
              height={50}
              priority
              className="object-contain h-9 md:h-11 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-all duration-200 py-2 px-3 rounded-xl relative',
                    isActive
                      ? 'text-brand-orange bg-orange-50 font-semibold'
                      : 'text-text-primary hover:text-brand-orange hover:bg-orange-50/60'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-1 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-1 h-1 bg-brand-orange rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language Toggle: US English / Egyptian Arabic */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-text-primary bg-white hover:bg-orange-50 hover:text-brand-orange transition-all border border-gray-200 hover:border-brand-orange shadow-sm"
              title={lang === 'en' ? 'التبديل إلى العامية المصرية' : 'Switch to US English'}
              aria-label="Toggle language"
            >
              <span className="text-base leading-none">
                {lang === 'en' ? '🇺🇸' : '🇪🇬'}
              </span>
              <span className="tracking-wide">
                {lang === 'en' ? 'US English' : 'عربي مصري'}
              </span>
            </button>

            {isAuthenticated ? (
              <>
                {/* Messages */}
                <Link
                  href="/messages"
                  className="relative p-2.5 text-text-body hover:text-brand-orange hover:bg-orange-50 rounded-xl transition-all"
                  aria-label="Messages"
                  title="Messages"
                >
                  <MessageSquare size={20} />
                  <span className="absolute top-1.5 end-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-brand-orange text-[9px] font-bold text-white">
                    2
                  </span>
                </Link>

                {/* Notifications: Single consolidated Bell in Navbar */}
                <Link
                  href="/notification"
                  className="relative p-2.5 text-text-body hover:text-brand-orange hover:bg-orange-50 rounded-xl transition-all"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <Bell size={20} />
                  <span className="absolute top-2 end-2 w-2.5 h-2.5 bg-brand-orange rounded-full ring-2 ring-white" />
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    className="flex items-center gap-2 bg-brand-orange text-white ps-2 pe-3 py-1.5 rounded-full hover:bg-brand-orange-dark transition-colors text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
                    aria-label="Profile menu"
                    aria-expanded={profileOpen}
                  >
                    <Avatar
                      src={user?.avatar || user?.avatarUrl || ''}
                      avatarType={user?.avatarType}
                      name={user?.name || 'Student'}
                      size="xs"
                      className="border border-white/50"
                    />
                    <span className="max-w-[120px] truncate">{user?.name ?? t('common.profile')}</span>
                    <ChevronDown size={14} className={cn('transition-transform', profileOpen && 'rotate-180')} />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div className="absolute end-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in slide-in-from-top-2 duration-150">
                        <div className="p-3 border-b border-gray-100 flex items-center gap-2.5">
                          <Avatar
                            src={user?.avatar || user?.avatarUrl || ''}
                            avatarType={user?.avatarType}
                            name={user?.name || 'Student'}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-text-primary truncate">{user?.fullName || user?.name}</p>
                            <p className="text-xs text-text-muted truncate">{user?.college || 'Student'}</p>
                          </div>
                        </div>
                        <div className="p-1.5">
                          <Link href="/profile" className="block px-3 py-2 text-sm text-text-body hover:bg-orange-50 hover:text-brand-orange rounded-xl transition-colors font-medium">
                            {t('nav.myProfile')}
                          </Link>
                          <button
                            onClick={logout}
                            className="w-full text-start px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
                          >
                            {t('nav.signOut')}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="rounded-full">{t('nav.signIn')}</Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="primary" size="sm" className="rounded-full px-6 font-semibold">{t('nav.joinFree')}</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold shadow-sm"
              aria-label="Toggle language"
            >
              <span className="text-base">{lang === 'en' ? '🇺🇸' : '🇪🇬'}</span>
              <span>{lang === 'en' ? 'US English' : 'عربي مصري'}</span>
            </button>

            {isAuthenticated && (
              <>
                <Link href="/messages" className="relative p-2 text-text-body" aria-label="Messages">
                  <MessageSquare size={19} />
                  <span className="absolute top-1 end-1 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-brand-orange text-[8px] font-bold text-white">2</span>
                </Link>
                <Link href="/notification" className="relative p-2 text-text-body" aria-label="Notifications">
                  <Bell size={19} />
                  <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-brand-orange ring-1 ring-white" />
                </Link>
              </>
            )}
            <button
              className="p-2 text-text-primary hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="section-container py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'text-sm font-medium py-3 px-4 rounded-xl transition-colors',
                    isActive
                      ? 'bg-brand-orange text-white font-semibold'
                      : 'text-text-primary hover:bg-orange-50 hover:text-brand-orange'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}

            <div className="border-t border-gray-100 mt-2 pt-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 flex items-center gap-3">
                    <Avatar
                      src={user?.avatar || user?.avatarUrl || ''}
                      avatarType={user?.avatarType}
                      name={user?.name || 'Student'}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-text-primary truncate">{user?.fullName || user?.name ?? 'Student'}</p>
                      <p className="text-xs text-text-muted truncate">{user?.college || 'Student'}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between text-sm font-medium py-3 px-4 rounded-xl hover:bg-orange-50 transition-colors text-text-body"
                  >
                    <span>{t('nav.myProfile')}</span>
                    <span className="text-brand-orange rtl:rotate-180">→</span>
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false) }}
                    className="w-full text-start text-sm font-medium py-3 px-4 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                  >
                    {t('nav.signOut')}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-2">
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" fullWidth className="rounded-xl">{t('nav.signIn')}</Button>
                  </Link>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" fullWidth className="rounded-xl">{t('nav.joinFree')}</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
