// src/components/profile/AvailabilityCard.tsx
// The student chooses what they are open to. Project availability is locked while on an active team.
'use client';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';

type Status = { availableForSwaps: boolean; availableForProjects: boolean; swaps: boolean; projects: boolean; inActiveProject: boolean };

export function AvailabilityCard() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/profile/status', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (d.swaps !== undefined) setStatus(d); })
      .catch(() => setError(t('avail.loadFail')));
  }, []);

  const update = async (patch: Partial<{ availableForSwaps: boolean; availableForProjects: boolean }>) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/profile/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || t('avail.saveFail'));
      else setStatus(data);
    } finally {
      setSaving(false);
    }
  };

  if (!status) return null;

  const Toggle = ({ on, disabled, onChange, label, hint }: { on: boolean; disabled?: boolean; onChange: () => void; label: string; hint?: string }) => (
    <label className={`flex items-center justify-between gap-4 py-3 ${disabled ? 'opacity-60' : ''}`}>
      <div>
        <p className="font-bold text-text-primary text-sm">{label}</p>
        {hint && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
      <button
        type="button"
        disabled={disabled || saving}
        onClick={onChange}
        className={`w-12 h-7 rounded-full relative transition-colors ${on ? 'bg-green-500' : 'bg-gray-300'} disabled:cursor-not-allowed`}
        aria-pressed={on}
      >
        <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${on ? 'end-0.5' : 'start-0.5'}`} />
      </button>
    </label>
  );

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm divide-y divide-gray-100">
      <h3 className="font-extrabold text-text-primary pb-3">{t('avail.title')}</h3>
      <Toggle
        label={t('avail.swapLabel')}
        hint={t('avail.swapHint')}
        on={status.availableForSwaps}
        onChange={() => update({ availableForSwaps: !status.availableForSwaps })}
      />
      <Toggle
        label={t('avail.projLabel')}
        hint={status.inActiveProject ? t('avail.projBusy') : t('avail.projOpen')}
        disabled={status.inActiveProject}
        on={status.projects}
        onChange={() => update({ availableForProjects: !status.availableForProjects })}
      />
      {error && <p className="text-xs text-red-600 font-semibold pt-3">{error}</p>}
    </div>
  );
}
