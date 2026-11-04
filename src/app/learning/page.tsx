// src/app/learning/page.tsx
'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { DAY_NAMES_AR, DAY_NAMES_EN, TEACH_HOURS, hourLabel } from '@/lib/learningUi';
import { useLanguage } from '@/lib/context/LanguageContext';

type Tab = 'requests' | 'mine' | 'availability' | 'skills' | 'swaps';

export default function LearningPage() {
  const { t, lang } = useLanguage();
  const [tab, setTab] = useState<Tab>('requests');
  const [inbox, setInbox] = useState<any>(null);
  const [slots, setSlots] = useState<Set<string>>(new Set());
  const [wants, setWants] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [newWant, setNewWant] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dayNames = lang === 'ar' ? DAY_NAMES_AR : DAY_NAMES_EN;

  const TABS: { key: Tab; label: string }[] = [
    { key: 'requests', label: t('learning.tabRequests') },
    { key: 'mine', label: t('learning.tabMine') },
    { key: 'availability', label: t('learning.tabAvailability') },
    { key: 'skills', label: t('learning.tabSkills') },
    { key: 'swaps', label: t('learning.tabSwaps') },
  ];

  const loadAll = useCallback(async () => {
    const [i, a, w, s] = await Promise.all([
      fetch('/api/learning/inbox', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/learning/availability', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/learning/wants', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/learning/swaps', { cache: 'no-store' }).then((r) => r.json()),
    ]);
    setInbox(i);
    setSlots(new Set((a.slots || []).map((x: any) => `${x.dayOfWeek}-${x.hour}`)));
    setWants(w.wants || []);
    setSuggestions(s.suggestions || []);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const act = async (url: string, body: unknown, method = 'POST') => {
    setMsg(null);
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await res.json();
    if (!res.ok) setMsg(json.error || (lang === 'ar' ? 'حصل خطأ' : 'An error occurred'));
    await loadAll();
    return json;
  };

  const toggleSlot = (day: number, hour: number) => {
    const key = `${day}-${hour}`;
    setSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const saveAvailability = async () => {
    setSaving(true);
    const list = Array.from(slots).map((k) => {
      const [d, h] = k.split('-').map(Number);
      return { dayOfWeek: d, hour: h };
    });
    await act('/api/learning/availability', { slots: list }, 'PUT');
    setSaving(false);
    setMsg(t('learning.saved'));
  };

  const addWant = async () => {
    if (!newWant.trim()) return;
    await act('/api/learning/wants', { skill: newWant }, 'POST');
    setNewWant('');
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">{t('learning.title')}</h1>
          <p className="text-sm text-text-muted">{t('learning.subtitle')}</p>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-gray-200">
          {TABS.map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => { setTab(tabItem.key); setMsg(null); }}
              className={`px-4 py-2 text-sm font-bold whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === tabItem.key ? 'border-brand-orange text-brand-orange' : 'border-transparent text-text-muted hover:text-text-primary'}`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        {msg && <p className="text-xs font-semibold text-brand-navy">{msg}</p>}

        {tab === 'requests' && (
          <div className="space-y-3">
            {!inbox?.incomingLearners?.length && (
              <p className="text-sm text-text-muted text-center py-8">{t('learning.noRequests')}</p>
            )}
            {inbox?.incomingLearners?.map((r: any) => (
              <Card key={r.id}>
                <p className="font-bold text-text-primary">{r.learner.fullName || r.learner.name}</p>
                <p className="text-sm text-text-body">
                  {lang === 'ar'
                    ? `عايز يتعلم ${r.skill} يوم ${dayNames[r.dayOfWeek]} الساعة ${hourLabel(r.hour, lang)}`
                    : `Wants to learn ${r.skill} on ${dayNames[r.dayOfWeek]} at ${hourLabel(r.hour, lang)}`}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button variant="primary" size="sm" onClick={() => act(`/api/learning/member/${r.id}`, { action: 'accept' })}>
                    {t('learning.accept')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => act(`/api/learning/member/${r.id}`, { action: 'decline' })}>
                    {t('learning.decline')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'mine' && (
          <div className="space-y-3">
            {!inbox?.myLearning?.length && (
              <p className="text-sm text-text-muted text-center py-8">{t('learning.noMine')}</p>
            )}
            {inbox?.myLearning?.map((m: any) => (
              <Card key={m.id}>
                <p className="font-bold text-text-primary">
                  {m.skill} {lang === 'ar' ? 'مع' : 'with'} {m.teacher.fullName || m.teacher.name}
                </p>
                <p className="text-sm text-text-body">
                  {lang === 'ar'
                    ? `يوم ${dayNames[m.dayOfWeek]} الساعة ${hourLabel(m.hour, lang)}`
                    : `On ${dayNames[m.dayOfWeek]} at ${hourLabel(m.hour, lang)}`}
                </p>
                <span className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full ${m.status === 'ACCEPTED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {m.status === 'ACCEPTED' ? t('learning.confirmed') : t('learning.waiting')}
                </span>
              </Card>
            ))}
          </div>
        )}

        {tab === 'availability' && (
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <p className="text-sm text-text-muted">{t('learning.availabilityDesc')}</p>
            {dayNames.map((name, day) => (
              <div key={day}>
                <p className="text-sm font-bold text-text-primary mb-2">{name}</p>
                <div className="flex flex-wrap gap-2">
                  {TEACH_HOURS.map((h) => {
                    const on = slots.has(`${day}-${h}`);
                    return (
                      <button
                        key={h}
                        onClick={() => toggleSlot(day, h)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${on ? 'bg-brand-navy text-white border-brand-navy' : 'border-gray-200 text-text-muted hover:border-gray-300'}`}
                      >
                        {hourLabel(h, lang)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <Button variant="primary" isLoading={saving} onClick={saveAvailability}>
              {t('learning.saveAvailability')}
            </Button>
          </div>
        )}

        {tab === 'skills' && (
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <p className="text-sm text-text-muted">{t('learning.skillsDesc')}</p>
            <div className="flex gap-2">
              <input
                value={newWant}
                onChange={(e) => setNewWant(e.target.value)}
                placeholder={t('learning.placeholderSkill')}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
              <Button variant="primary" onClick={addWant}>{t('learning.add')}</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {wants.map((w) => (
                <span key={w} className="inline-flex items-center gap-2 bg-orange-50 text-brand-orange px-3 py-1.5 rounded-xl text-xs font-bold">
                  {w}
                  <button onClick={() => act(`/api/learning/wants?skill=${encodeURIComponent(w)}`, {}, 'DELETE')} aria-label={t('common.cancel')}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {tab === 'swaps' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="font-extrabold text-text-primary">{t('learning.swapSuggestions')}</h2>
              {suggestions.length === 0 && (
                <p className="text-sm text-text-muted">{t('learning.noSuggestions')}</p>
              )}
              {suggestions.map((s) => (
                <Card key={s.peer.id}>
                  <p className="font-bold text-text-primary">{s.peer.fullName || s.peer.name}</p>
                  <p className="text-sm text-text-body">
                    {lang === 'ar'
                      ? `ستعلّمه ${s.giveSkill} وسيعلّمك ${s.takeSkill}`
                      : `You will teach ${s.giveSkill} and they will teach you ${s.takeSkill}`}
                  </p>
                  <Button variant="primary" size="sm" className="mt-3" onClick={() => act('/api/learning/swaps', { toId: s.peer.id, giveSkill: s.giveSkill, takeSkill: s.takeSkill })}>
                    {t('learning.sendSwap')}
                  </Button>
                </Card>
              ))}
            </div>

            <div className="space-y-3">
              <h2 className="font-extrabold text-text-primary">{t('learning.incomingSwaps')}</h2>
              {!inbox?.swapsIn?.length && <p className="text-sm text-text-muted">{t('learning.noIncomingSwaps')}</p>}
              {inbox?.swapsIn?.map((s: any) => (
                <Card key={s.id}>
                  <p className="font-bold text-text-primary">{s.from.fullName || s.from.name}</p>
                  <p className="text-sm text-text-body">
                    {lang === 'ar'
                      ? `يريد أن يعلّمك ${s.giveSkill} مقابل أن تعلّمه ${s.takeSkill}`
                      : `Wants to teach you ${s.giveSkill} in exchange for learning ${s.takeSkill}`}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="primary" size="sm" onClick={() => act(`/api/learning/swaps/${s.id}`, { action: 'accept' })}>
                      {t('learning.accept')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => act(`/api/learning/swaps/${s.id}`, { action: 'decline' })}>
                      {t('learning.decline')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-3">
              <h2 className="font-extrabold text-text-primary">{t('learning.outgoingSwaps')}</h2>
              {!inbox?.swapsOut?.length && <p className="text-sm text-text-muted">{t('learning.noOutgoingSwaps')}</p>}
              {inbox?.swapsOut?.map((s: any) => (
                <Card key={s.id}>
                  <p className="text-sm text-text-body">
                    {lang === 'ar' ? 'إلى' : 'To'} {s.to.fullName || s.to.name}: {s.giveSkill} ⇄ {s.takeSkill}
                  </p>
                  <span className="text-xs font-bold text-text-muted">
                    {s.status === 'PENDING'
                      ? t('learning.waiting')
                      : s.status === 'ACCEPTED'
                        ? t('status.approved')
                        : t('status.rejected')}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">{children}</div>;
}
