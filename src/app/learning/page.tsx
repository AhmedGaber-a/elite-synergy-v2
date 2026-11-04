// src/app/learning/page.tsx
'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { DAY_NAMES, TEACH_HOURS, hourLabel } from '@/lib/learningUi';

type Person = { id: string; name: string; fullName?: string | null };
type Tab = 'requests' | 'mine' | 'availability' | 'skills' | 'swaps';

const TABS: { key: Tab; label: string }[] = [
  { key: 'requests', label: 'طلبات واردة' },
  { key: 'mine', label: 'تعلّمي' },
  { key: 'availability', label: 'مواعيدي' },
  { key: 'skills', label: 'عايز أتعلم' },
  { key: 'swaps', label: 'تبادل مهارات' },
];

export default function LearningPage() {
  const [tab, setTab] = useState<Tab>('requests');
  const [inbox, setInbox] = useState<any>(null);
  const [slots, setSlots] = useState<Set<string>>(new Set());
  const [wants, setWants] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [newWant, setNewWant] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    if (!res.ok) setMsg(json.error || 'حصل خطأ');
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
    setMsg('اتحفظت المواعيد');
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
          <h1 className="text-2xl font-extrabold text-text-primary">التعلم والتبادل</h1>
          <p className="text-sm text-text-muted">مواعيدك، طلبات التعلم، وتبادل المهارات مع زمايلك.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setMsg(null); }}
              className={`px-4 py-2 text-sm font-bold whitespace-nowrap border-b-2 -mb-px ${tab === t.key ? 'border-brand-orange text-brand-orange' : 'border-transparent text-text-muted'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {msg && <p className="text-xs font-semibold text-brand-navy">{msg}</p>}

        {tab === 'requests' && (
          <div className="space-y-3">
            {!inbox?.incomingLearners?.length && <p className="text-sm text-text-muted text-center py-8">مفيش طلبات تعلم جديدة.</p>}
            {inbox?.incomingLearners?.map((r: any) => (
              <Card key={r.id}>
                <p className="font-bold text-text-primary">{r.learner.fullName || r.learner.name}</p>
                <p className="text-sm text-text-body">عايز يتعلم <b>{r.skill}</b> يوم {DAY_NAMES[r.dayOfWeek]} الساعة {hourLabel(r.hour)}</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="primary" size="sm" onClick={() => act(`/api/learning/member/${r.id}`, { action: 'accept' })}>موافق</Button>
                  <Button variant="outline" size="sm" onClick={() => act(`/api/learning/member/${r.id}`, { action: 'decline' })}>مش متاح</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'mine' && (
          <div className="space-y-3">
            {!inbox?.myLearning?.length && <p className="text-sm text-text-muted text-center py-8">لسه ما طلبتش تتعلم من حد.</p>}
            {inbox?.myLearning?.map((m: any) => (
              <Card key={m.id}>
                <p className="font-bold text-text-primary">{m.skill} مع {m.teacher.fullName || m.teacher.name}</p>
                <p className="text-sm text-text-body">يوم {DAY_NAMES[m.dayOfWeek]} الساعة {hourLabel(m.hour)}</p>
                <span className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full ${m.status === 'ACCEPTED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {m.status === 'ACCEPTED' ? 'متأكد' : 'مستني موافقة'}
                </span>
              </Card>
            ))}
          </div>
        )}

        {tab === 'availability' && (
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <p className="text-sm text-text-muted">اختار الساعات اللي تقدر تعلّم فيها زمايلك (توقيت القاهرة).</p>
            {DAY_NAMES.map((name, day) => (
              <div key={day}>
                <p className="text-sm font-bold text-text-primary mb-2">{name}</p>
                <div className="flex flex-wrap gap-2">
                  {TEACH_HOURS.map((h) => {
                    const on = slots.has(`${day}-${h}`);
                    return (
                      <button
                        key={h}
                        onClick={() => toggleSlot(day, h)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${on ? 'bg-brand-navy text-white border-brand-navy' : 'border-gray-200 text-text-muted'}`}
                      >
                        {hourLabel(h)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <Button variant="primary" isLoading={saving} onClick={saveAvailability}>احفظ المواعيد</Button>
          </div>
        )}

        {tab === 'skills' && (
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <p className="text-sm text-text-muted">المهارات اللي عايز تتعلمها. ده بيستخدم في اقتراح التبادل.</p>
            <div className="flex gap-2">
              <input
                value={newWant}
                onChange={(e) => setNewWant(e.target.value)}
                placeholder="مثلا: AWS"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
              <Button variant="primary" onClick={addWant}>أضف</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {wants.map((w) => (
                <span key={w} className="inline-flex items-center gap-2 bg-orange-50 text-brand-orange px-3 py-1.5 rounded-xl text-xs font-bold">
                  {w}
                  <button onClick={() => act(`/api/learning/wants?skill=${encodeURIComponent(w)}`, {}, 'DELETE')} aria-label="شيل">×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {tab === 'swaps' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="font-extrabold text-text-primary">اقتراحات تبادل</h2>
              {suggestions.length === 0 && (
                <p className="text-sm text-text-muted">ضيف مهارات عايز تتعلمها من تاب "عايز أتعلم"، وتأكد إن مهاراتك موجودة في بروفايلك.</p>
              )}
              {suggestions.map((s) => (
                <Card key={s.peer.id}>
                  <p className="font-bold text-text-primary">{s.peer.fullName || s.peer.name}</p>
                  <p className="text-sm text-text-body">هتعلمه <b>{s.giveSkill}</b> وهيعلمك <b>{s.takeSkill}</b></p>
                  <Button variant="primary" size="sm" className="mt-3" onClick={() => act('/api/learning/swaps', { toId: s.peer.id, giveSkill: s.giveSkill, takeSkill: s.takeSkill })}>
                    ابعت اقتراح التبادل
                  </Button>
                </Card>
              ))}
            </div>

            <div className="space-y-3">
              <h2 className="font-extrabold text-text-primary">طلبات تبادل واردة</h2>
              {!inbox?.swapsIn?.length && <p className="text-sm text-text-muted">مفيش طلبات.</p>}
              {inbox?.swapsIn?.map((s: any) => (
                <Card key={s.id}>
                  <p className="font-bold text-text-primary">{s.from.fullName || s.from.name}</p>
                  <p className="text-sm text-text-body">عايز يعلمك <b>{s.giveSkill}</b> مقابل إنك تعلمه <b>{s.takeSkill}</b></p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="primary" size="sm" onClick={() => act(`/api/learning/swaps/${s.id}`, { action: 'accept' })}>موافق</Button>
                    <Button variant="outline" size="sm" onClick={() => act(`/api/learning/swaps/${s.id}`, { action: 'decline' })}>مش موافق</Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-3">
              <h2 className="font-extrabold text-text-primary">اقتراحاتك المبعوتة</h2>
              {!inbox?.swapsOut?.length && <p className="text-sm text-text-muted">لسه ما بعتش اقتراحات.</p>}
              {inbox?.swapsOut?.map((s: any) => (
                <Card key={s.id}>
                  <p className="text-sm text-text-body">لـ {s.to.fullName || s.to.name}: {s.giveSkill} ⇄ {s.takeSkill}</p>
                  <span className="text-xs font-bold text-text-muted">{s.status === 'PENDING' ? 'مستني رد' : s.status === 'ACCEPTED' ? 'اتقبل' : 'اترفض'}</span>
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
