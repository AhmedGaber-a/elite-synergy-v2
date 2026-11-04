// src/components/profile/AcademicYearCard.tsx
// Students pick their academic year once. After that it is locked (only admin or ERP staff can change it).
'use client';
import React, { useState } from 'react';
import { GraduationCap, Lock } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { YEAR_NAMES_AR } from '@/lib/utils/cairoDate';

export function AcademicYearCard() {
  const { user, refreshUser } = useAuth();
  const [year, setYear] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || user.userRole !== 'STUDENT') return null;

  const current = user.academicYear ?? null;

  const save = async () => {
    if (!year) {
      setError('اختار السنة الأول');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/profile/year', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ academicYear: year }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'تعذر حفظ السنة الدراسية');
        return;
      }
      await refreshUser();
    } catch {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="year" className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm scroll-mt-24">
      <div className="flex items-center gap-2 pb-3">
        <GraduationCap size={18} className="text-brand-orange" />
        <h3 className="font-extrabold text-text-primary">السنة الدراسية</h3>
      </div>

      {current ? (
        <div className="flex items-center justify-between gap-3">
          <p className="font-bold text-text-primary text-sm">{YEAR_NAMES_AR[current]}</p>
          <span className="inline-flex items-center gap-1 text-xs text-text-muted">
            <Lock size={13} /> مقفولة
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-text-muted">اختار سنتك عشان تشوف محتوى سنتك. بعد ما تحفظها مش هتقدر تغيرها، كلم الإدارة لو فيه غلط.</p>
          <select
            value={year ?? ''}
            onChange={(e) => setYear(Number(e.target.value) || null)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white"
          >
            <option value="">اختار السنة</option>
            {[1, 2, 3, 4, 5].map((y) => (
              <option key={y} value={y}>{YEAR_NAMES_AR[y]}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={save}
            disabled={saving || !year}
            className="w-full rounded-xl bg-brand-orange text-white font-bold py-2.5 text-sm disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ…' : 'احفظ السنة'}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-semibold pt-3">{error}</p>}
    </div>
  );
}
