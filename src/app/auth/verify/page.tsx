// src/app/auth/verify/page.tsx
'use client';
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, ArrowRight, RotateCw, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleChange = (val: string, index: number) => {
    const clean = val.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = clean.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  };

  const fullOtp = otp.join('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('يرجى تحديد البريد الإلكتروني الجامعي');
      return;
    }

    if (fullOtp.length !== 6) {
      setError('يرجى إدخال كود التفعيل المكون من 6 أرقام بالكامل');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp: fullOtp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'فشل تفعيل الحساب');
        return;
      }

      setSuccess('تم تفعيل حسابك بنجاح! جاري تحويلك لصفحة تسجيل الدخول...');
      setTimeout(() => {
        router.push('/auth/login?verified=true');
      }, 1500);
    } catch {
      setError('حدث خطأ في الاتصال بالخادم، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || !canResend || resending) return;
    setError('');
    setSuccess('');
    setResending(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'فشل إعادة إرسال الكود');
        return;
      }

      setSuccess('تم إرسال كود تفعيل جديد إلى بريدك الجامعي بنجاح');
      setCanResend(false);
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      setError('فشل في إرسال كود التفعيل');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={36} />
          </div>
          <h1 className="text-2xl font-black text-text-primary mb-2">تفعيل الحساب الأكاديمي</h1>
          <p className="text-sm text-text-muted leading-relaxed">
            تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الجامعي:
          </p>
          <div className="inline-flex items-center gap-2 bg-blue-50 text-brand-blue px-3 py-1.5 rounded-full text-xs font-semibold mt-2 dir-ltr">
            <Mail size={14} />
            <span>{email || 'بريدك الجامعي @fa-hists.edu.eg'}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-sm mb-5 flex items-start gap-2.5">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-500" />
            <p className="font-medium text-xs sm:text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3.5 rounded-xl text-sm mb-5 flex items-start gap-2.5">
            <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5 text-green-500" />
            <p className="font-medium text-xs sm:text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!initialEmail && (
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">البريد الإلكتروني الجامعي</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@fa-hists.edu.eg"
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-primary mb-2 text-center">أدخل كود التفعيل (OTP)</label>
            <div className="flex justify-between gap-2 dir-ltr" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="w-12 h-14 text-center text-2xl font-black rounded-xl border border-gray-300 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30 outline-none transition-all shadow-sm bg-gray-50 text-text-primary"
                />
              ))}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={loading}
            disabled={loading || fullOtp.length !== 6}
            className="rounded-xl h-12 font-bold text-base shadow-md"
          >
            تأكيد التفعيل <ArrowRight size={18} className="ms-2" />
          </Button>

          <div className="flex items-center justify-between text-xs pt-2">
            <span className="text-text-muted">لم يصلك الكود؟</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || resending}
              className={`flex items-center gap-1 font-bold transition-colors ${
                canResend ? 'text-brand-orange hover:underline cursor-pointer' : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <RotateCw size={13} className={resending ? 'animate-spin' : ''} />
              {canResend ? 'إعادة إرسال الكود' : `إعادة الإرسال بعد (${countdown}s)`}
            </button>
          </div>

          <div className="text-center pt-2 border-t border-gray-100">
            <Link href="/auth/login" className="text-xs text-text-muted hover:text-brand-orange transition-colors">
              العودة إلى تسجيل الدخول
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">جاري التحميل...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
