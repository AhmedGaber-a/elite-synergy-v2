// src/app/onboarding/register/page.tsx
'use client'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Camera, Linkedin, Facebook, User, Mail, Lock, Eye, EyeOff, Twitter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useOnboarding } from '@/lib/context/OnboardingContext'

function XIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { state, updateState } = useOnboarding()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState(state.email || '')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [linkedin, setLinkedin] = useState('')
  const [twitter, setTwitter] = useState('')
  const [facebook, setFacebook] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setProfilePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password || !confirmPassword || !fullName) {
      setError('Please fill in all required fields.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      updateState({ email })
      setLoading(false)
      router.push('/onboarding/skills')
    }, 800)
  }

  const passwordStrength = (): { label: string; color: string; width: string } => {
    if (password.length === 0) return { label: '', color: 'bg-gray-200', width: 'w-0' }
    if (password.length < 6) return { label: 'Weak', color: 'bg-red-400', width: 'w-1/4' }
    if (password.length < 8) return { label: 'Fair', color: 'bg-yellow-400', width: 'w-1/2' }
    if (password.length < 12) return { label: 'Good', color: 'bg-blue-400', width: 'w-3/4' }
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' }
  }

  const strength = passwordStrength()

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -start-40 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -end-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm">
            <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
            Step 1 of 5 — Registration
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Join Elite Synergy</h1>
          <p className="text-white/60 text-sm">Build your academic profile and start collaborating</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-100">
            <div className="h-1 bg-brand-orange w-[20%] rounded-full transition-all duration-500" />
          </div>

          <div className="p-7 md:p-8">
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center mb-7">
              <div
                className="relative cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`w-24 h-24 rounded-full border-4 border-dashed flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-orange ${profilePreview ? 'border-brand-orange' : 'border-gray-200'}`}>
                  {profilePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profilePreview} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-brand-orange transition-colors">
                      <User size={28} />
                      <span className="text-[10px] font-medium">Photo</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -end-1 w-8 h-8 bg-brand-orange text-white rounded-full flex items-center justify-center shadow-md group-hover:bg-brand-orange-dark transition-colors">
                  <Camera size={14} />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <p className="text-xs text-text-muted mt-3 text-center">
                Click to upload profile picture<br />
                <span className="text-text-muted/60">JPG, PNG up to 5MB</span>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-5 border border-red-100 flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50 text-sm transition-all"
                    placeholder="Ahmed Mohamed"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50 text-sm transition-all"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full ps-10 pe-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50 text-sm transition-all"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Password Strength */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                    </div>
                    <p className={`text-xs mt-1 font-medium ${strength.color.replace('bg-', 'text-').replace('-400', '-600').replace('-500', '-600')}`}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    className={`w-full ps-10 pe-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-orange bg-gray-50 text-sm transition-all ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-300 bg-red-50'
                        : confirmPassword && password === confirmPassword
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200'
                    }`}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-primary transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">Social Links (Optional)</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="space-y-3">
                  {/* LinkedIn */}
                  <div className="relative">
                    <div className="absolute start-3.5 top-1/2 -translate-y-1/2">
                      <Linkedin size={16} className="text-[#0077B5]" />
                    </div>
                    <input
                      type="url"
                      className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0077B5]/40 bg-gray-50 text-sm transition-all"
                      placeholder="linkedin.com/in/your-profile"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                    />
                  </div>

                  {/* X / Twitter */}
                  <div className="relative">
                    <div className="absolute start-3.5 top-1/2 -translate-y-1/2">
                      <XIcon className="w-4 h-4 text-gray-800" />
                    </div>
                    <input
                      type="url"
                      className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400/40 bg-gray-50 text-sm transition-all"
                      placeholder="x.com/your-handle"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                    />
                  </div>

                  {/* Facebook */}
                  <div className="relative">
                    <div className="absolute start-3.5 top-1/2 -translate-y-1/2">
                      <Facebook size={16} className="text-[#1877F2]" />
                    </div>
                    <input
                      type="url"
                      className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1877F2]/30 bg-gray-50 text-sm transition-all"
                      placeholder="facebook.com/your-profile"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={loading}
                className="mt-4 rounded-xl font-bold text-base h-12"
              >
                Continue <ArrowRight size={18} className="ms-2" />
              </Button>
            </form>

            <p className="text-center text-sm text-text-muted mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-brand-orange font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}