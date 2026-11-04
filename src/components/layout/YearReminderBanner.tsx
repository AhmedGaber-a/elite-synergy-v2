// src/components/layout/YearReminderBanner.tsx
// Shown to students who have not set their academic year yet. It cannot be closed until the year is set.
'use client';
import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import Link from 'next/link';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export function YearReminderBanner() {
  const { t } = useLanguage();
  const { user } = useAuth();
  if (!user || user.userRole !== 'STUDENT' || user.academicYear) return null;

  return (
    <Link
      href="/profile#year"
      className="flex items-center justify-center gap-2 bg-brand-orange text-white text-sm font-bold px-4 py-2.5 hover:brightness-110"
      dir="rtl"
    >
      <GraduationCap size={18} />
      <span>{t('year.bannerText')}</span>
      <ArrowLeft size={16} />
    </Link>
  );
}
