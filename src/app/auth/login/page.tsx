'use client'
import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/context/AuthContext'

function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setIsLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 800)) // Simulate network
    login(email, password)
    router.push(redirectTo)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left form panel */}
      <div className="flex-1 flex items-center justify-center bg-bg-cream p-6">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ID@fa-hists.edu.eg"
              leftIcon={<Mail size={16} />}
              autoComplete="email"
            />
            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter Password"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              autoComplete="current-password"
            />

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="rounded" />
                Remember Me
              </label>
              <button type="button" className="text-sm text-brand-orange hover:underline">Forgot Password?</button>
            </div>

            <Button type="submit" variant="primary" fullWidth isLoading={isLoading} size="lg">
              Login
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative text-center text-sm text-text-muted bg-bg-cream px-4 inline-block left-1/2 -translate-x-1/2">or continue with</div>
            </div>

            <button type="button" className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 hover:bg-gray-50 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <p className="text-center text-sm text-text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/onboarding/register" className="text-brand-orange hover:underline font-medium">Sign up</Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right branding panel */}
      <div className="hidden lg:flex w-[45%] bg-bg-cream flex-col items-center justify-center p-12 border-l border-orange-100">
        <div className="relative w-full max-w-md aspect-[16/9]">
          <Image src="/assets/logo.png" alt="Elite Synergy Logo" fill className="object-contain" priority />
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Login...</div>}>
      <LoginForm />
    </Suspense>
  )
}
