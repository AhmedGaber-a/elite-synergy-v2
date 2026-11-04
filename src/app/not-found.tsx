// src/app/not-found.tsx
'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Home, Compass, ArrowRight } from 'lucide-react';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-bg-cream flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#ea580c] text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-pulse" />
          <span>{t('nf.code')}</span>
        </div>

        {/* Visual Graphic */}
        <div className="relative mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-[#ea580c] flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <Compass className="w-12 h-12 stroke-[1.75]" />
        </div>

        {/* Bilingual Headlines */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('nf.title')}
          </h1>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-700">
            Page Not Found
          </h2>
        </div>

        {/* Bilingual Explanations */}
        <div className="space-y-2 text-sm text-slate-600 max-w-md mx-auto">
          <p dir="rtl">
            {t('nf.desc')}
          </p>
          <p dir="ltr" className="text-slate-500">
            The page you are looking for doesn&apos;t exist, has been removed, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#ea580c] hover:bg-orange-700 text-white font-medium shadow-md shadow-orange-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>{t('nf.home')}</span>
          </Link>

          <Link
            href="/practical"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium transition-colors"
          >
            <span>{t('nf.projects')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
          {t('nf.brand')}
        </div>
      </div>
    </div>
  );
}
