// src/app/auth/login/page.tsx
'use client';
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/context/AuthContext';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const isVerifiedParam = searchParams.get('verified') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notRegistered, setNotRegistered] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('يرجى ملء جميع الحقول');
      return;
    }
    setIsLoading(true);
    setError('');
    setNotRegistered(false);
    setUnverifiedEmail(null);

    const result = await login(email, password);

    if (result.success) {
      router.push(redirectTo);
    } else {
      setError(result.error || 'فشل تسجيل الدخول');
      setNotRegistered(!!result.notRegistered);
      if (result.unverified) {
        setUnverifiedEmail(email.toLowerCase().trim());
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left form panel */}
      <div className="flex-1 flex items-center justify-center bg-bg-cream p-6">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-extrabold text-text-primary mb-2 text-center">تسجيل الدخول</h2>
          <p className="text-center text-xs text-text-muted mb-6">منصة Elite Synergy الأكاديمية</p>

          {isVerifiedParam && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3.5 rounded-2xl text-xs mb-5 flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-green-600" />
              <span>تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول.</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs mb-5 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </div>

              {notRegistered && (
                <div className="pt-2">
                  <Link
                    href={`/onboarding/register?email=${encodeURIComponent(email)}`}
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-brand-orange text-white rounded-xl font-bold text-xs hover:bg-brand-orange-dark transition-all shadow-md"
                  >
                    إنشاء حساب جديد (Sign Up) <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              {unverifiedEmail && (
                <div className="pt-2 border-t border-red-200/60">
                  <Link
                    href={`/auth/verify?email=${encodeURIComponent(unverifiedEmail)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:underline bg-white px-3 py-1.5 rounded-lg border border-red-200 shadow-sm"
                  >
                    تفعيل الحساب الآن بواسطة كود التحقق <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="البريد الجامعي"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ID@fa-hists.edu.eg"
              leftIcon={<Mail size={16} />}
              autoComplete="email"
            />
            <Input
              label="كلمة المرور"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-text-muted">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded text-brand-orange focus:ring-brand-orange"
                />
                تذكرني
              </label>
              <button type="button" className="text-brand-orange hover:underline font-semibold">
                نسيت كلمة المرور؟
              </button>
            </div>

            <Button type="submit" variant="primary" fullWidth isLoading={isLoading} size="lg" className="rounded-xl h-11 font-bold">
              دخول
            </Button>

            <p className="text-center text-xs text-text-muted mt-5">
              ليس لديك حساب بعد؟{' '}
              <Link href="/onboarding/register" className="text-brand-orange hover:underline font-bold">
                أنشئ حسابك الآن
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right branding panel (Clean Logo Only - No subtitle text) */}
      <div className="hidden lg:flex w-[45%] bg-bg-cream flex-col items-center justify-center p-12 border-l border-orange-100">
        <div className="relative w-full max-w-md aspect-[16/9]">
          <Image src="/assets/logo.png" alt="Elite Synergy Logo" fill className="object-contain" priority />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
