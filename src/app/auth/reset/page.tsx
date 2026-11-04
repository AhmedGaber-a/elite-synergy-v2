// src/app/auth/reset/page.tsx
'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const COOLDOWN_SECONDS = 60;

function ResetForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams.get('email') || '').trim();

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const rules = [
    { ok: password.length >= 8, text: t('reset.ruleLen') },
    { ok: password.length > 0 && password === confirm, text: t('reset.ruleMatch') },
  ];

  const resend = async () => {
    setError('');
    setInfo('');
    await fetch('/api/auth/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setInfo(t('reset.sentNew'));
    setCooldown(COOLDOWN_SECONDS);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError(t('reset.needEmail')); return; }
    if (!/^\d{6}$/.test(code.trim())) { setError(t('reset.codeDigits')); return; }
    if (password.length < 8) { setError(t('reset.pwShort')); return; }
    if (password !== confirm) { setError(t('reset.pwMismatch')); return; }

    setIsLoading(true);
    setError('');
    setInfo('');
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || t('reset.failed'));
        return;
      }
      router.push('/auth/login?reset=true');
    } catch {
      setError(t('verify.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg-cream p-6 items-center justify-center">
      <div className="w-full max-w-sm">
        <h2 className="text-3xl font-extrabold text-text-primary mb-2 text-center">{t('reset.title')}</h2>
        <p className="text-center text-xs text-text-muted mb-6">{t('reset.sub')}</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-2xl text-xs mb-5">{error}</div>}
        {info && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-2xl text-xs mb-5">{info}</div>}

        <form onSubmit={submit} className="space-y-4">
          <Input
            label={t('reset.codeLabel')}
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
          />
          <Input
            label={t('reset.newPw')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={16} />}
            autoComplete="new-password"
          />
          <Input
            label={t('reset.confirmPw')}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            leftIcon={<Lock size={16} />}
            autoComplete="new-password"
          />

          <ul className="text-xs space-y-1.5">
            {rules.map((r) => (
              <li key={r.text} className={`flex items-center gap-2 ${r.ok ? 'text-green-600' : 'text-text-muted'}`}>
                {r.ok ? <Check size={14} /> : <X size={14} />}
                {r.text}
              </li>
            ))}
          </ul>

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} size="lg" className="rounded-xl h-11 font-bold">
            {t('reset.submit')}
          </Button>
        </form>

        <div className="flex items-center justify-between mt-6 text-xs">
          <button
            type="button"
            onClick={resend}
            disabled={cooldown > 0 || !email}
            className="font-bold text-brand-orange hover:underline disabled:text-text-muted disabled:no-underline disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `${t('reset.resendIn')} ${cooldown} ${t('reset.seconds')}` : t('reset.resend')}
          </button>
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 font-bold text-brand-orange hover:underline">
            {t('forgot.back')} <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">...</div>}>
      <ResetForm />
    </Suspense>
  );
}
