// src/components/learning/LearnModal.tsx
// Ask a peer to teach me one of their skills in one of their free hours.
'use client';
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DAY_NAMES, MAX_LEARNERS, hourLabel } from '@/lib/learningUi';

type Slot = { dayOfWeek: number; hour: number };
type Group = { skill: string; dayOfWeek: number; hour: number; taken: number; mine: boolean };
type Teacher = { teacher: { id: string; name: string; fullName: string | null }; skills: string[]; slots: Slot[]; groups: Group[] };

export function LearnModal({ teacherId, teacherName, onClose }: { teacherId: string; teacherName: string; onClose: () => void }) {
  const [data, setData] = useState<Teacher | null>(null);
  const [skill, setSkill] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/learning/teachers/${teacherId}`, { cache: 'no-store' });
        const json = await res.json();
        if (res.ok) {
          setData(json);
          setSkill(json.skills?.[0] || '');
        } else setError(json.error || 'تعذر التحميل');
      } catch {
        setError('تعذر الاتصال بالسيرفر');
      } finally {
        setLoading(false);
      }
    })();
  }, [teacherId]);

  const seatInfo = (day: number, hour: number) => data?.groups.find((g) => g.skill === skill && g.dayOfWeek === day && g.hour === hour);

  const book = async (day: number, hour: number) => {
    setError(null);
    setSending(true);
    try {
      const res = await fetch('/api/learning/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, skill, dayOfWeek: day, hour }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error || 'تعذر إرسال الطلب');
      else setDone(true);
    } catch {
      setError('تعذر الاتصال بالسيرفر');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl p-5 md:p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-text-primary">اطلب تتعلم من {teacherName}</h3>
          <button onClick={onClose} className="p-2 text-text-muted hover:bg-gray-100 rounded-full" aria-label="اقفل"><X size={18} /></button>
        </div>

        {loading && <p className="text-sm text-text-muted">جاري التحميل...</p>}

        {!loading && done && (
          <div className="text-center py-6">
            <p className="font-bold text-green-700 mb-2">اتبعت الطلب</p>
            <p className="text-sm text-text-muted mb-4">هيوصله إشعار، ولما يوافق هتتعرف على ميعادك.</p>
            <Button variant="primary" onClick={onClose}>تمام</Button>
          </div>
        )}

        {!loading && !done && !data && error && (
          <p className="text-sm text-red-600 font-semibold">{error}</p>
        )}

        {!loading && !done && data && (
          <div className="space-y-5">
            {data.skills.length === 0 ? (
              <p className="text-sm text-text-muted">الزميل ده لسه مضافش مهارات في بروفايله.</p>
            ) : (
              <>
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase mb-2">المهارة</p>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSkill(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${skill === s ? 'bg-brand-orange text-white border-brand-orange' : 'border-gray-200 text-text-body'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-text-muted uppercase mb-2">اختار الميعاد</p>
                  {data.slots.length === 0 ? (
                    <p className="text-sm text-text-muted">الزميل ده لسه مضافش مواعيد متاحة.</p>
                  ) : (
                    <div className="space-y-3">
                      {Array.from(new Set(data.slots.map((s) => s.dayOfWeek))).map((day) => (
                        <div key={day}>
                          <p className="text-sm font-bold text-text-primary mb-1">{DAY_NAMES[day]}</p>
                          <div className="flex flex-wrap gap-2">
                            {data.slots.filter((s) => s.dayOfWeek === day).map((s) => {
                              const g = seatInfo(s.dayOfWeek, s.hour);
                              const full = !!g && g.taken >= MAX_LEARNERS;
                              const booked = !!g && g.mine;
                              return (
                                <button
                                  key={`${day}-${s.hour}`}
                                  disabled={sending || full || booked || !skill}
                                  onClick={() => book(day, s.hour)}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 disabled:opacity-40 hover:border-brand-orange"
                                >
                                  {hourLabel(s.hour)}
                                  {g && <span className="ms-1 text-text-muted">({g.taken}/{MAX_LEARNERS})</span>}
                                  {booked && <span className="ms-1 text-green-600">· انت مسجل</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-text-muted">كل ميعاد بيتقسم بين 3 طلاب كحد أقصى.</p>
              </>
            )}
            {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
