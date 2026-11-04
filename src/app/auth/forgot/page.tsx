// src/app/auth/forgot/page.tsx
'use client';
import React, { useState } from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(t('forgot.enterEmail'));
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // The server always answers the same way, so the reply is shown as-is whatever the account is.
      await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } catch {
      setError(t('verify.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg-cream p-6 items-center justify-center">
      <div className="w-full max-w-sm">
        <h2 className="text-3xl font-extrabold text-text-primary mb-2 text-center">{t('forgot.title')}</h2>
        <p className="text-center text-xs text-text-muted mb-6">{t('forgot.sub')}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-2xl text-xs mb-5">{error}</div>
        )}

        {sent ? (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center space-y-4">
            <CheckCircle2 className="mx-auto text-green-500" size={36} />
            <p className="text-sm text-text-primary font-semibold">{t('forgot.sent')}</p>
            <Button
              variant="primary"
              fullWidth
              size="lg"
              className="rounded-xl h-11 font-bold"
              onClick={() => router.push(`/auth/reset?email=${encodeURIComponent(email.trim())}`)}
            >
              {t('forgot.haveCode')}
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Input
              label={t('login.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.emailPh')}
              leftIcon={<Mail size={16} />}
              autoComplete="email"
            />
            <Button type="submit" variant="primary" fullWidth isLoading={isLoading} size="lg" className="rounded-xl h-11 font-bold">
              {t('forgot.send')}
            </Button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:underline">
            {t('forgot.back')} <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
