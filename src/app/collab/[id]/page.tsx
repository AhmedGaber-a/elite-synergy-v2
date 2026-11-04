// src/app/collab/[id]/page.tsx
'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Trash2, Video, BookOpen } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { checkUploadSize, uploadCommunityFile } from '@/lib/utils/communityUpload';

type Person = { id: string; name: string; fullName?: string | null; avatar?: string | null; avatarType?: string | null };
type Item = {
  id: string;
  kind: 'NOTE' | 'SKILL' | 'FILE';
  title: string | null;
  body: string | null;
  url: string | null;
  createdAt: string;
  authorId: string;
  author: { id: string; name: string; fullName?: string | null };
};
type Room = { id: string; callToken: string; peer: Person; items: Item[] };

const KIND_LABEL: Record<Item['kind'], string> = { NOTE: 'ملاحظة', SKILL: 'مهارة', FILE: 'ملف' };

export default function CollabRoomPage({ params }: { params: { id: string } }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [meId, setMeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'content' | 'call'>('content');

  const [kind, setKind] = useState<'NOTE' | 'SKILL' | 'FILE'>('NOTE');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/collab/${params.id}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'تعذر تحميل الغرفة');
        return;
      }
      setRoom(data.room);
      setMeId(data.meId);
    } catch {
      setError('تعذر الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const addItem = async (payload: Record<string, unknown>) => {
    const res = await fetch(`/api/collab/${params.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'تعذر الإضافة');
    await load();
  };

  const submitText = async () => {
    setFormError(null);
    setBusy(true);
    try {
      await addItem({ kind, title, body: text });
      setTitle('');
      setText('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'تعذر الإضافة');
    } finally {
      setBusy(false);
    }
  };

  const submitFile = async (file: File) => {
    setFormError(null);
    const sizeError = checkUploadSize(file, 'file');
    if (sizeError) return setFormError(sizeError);
    setBusy(true);
    try {
      const url = await uploadCommunityFile(file, 'file');
      await addItem({ kind: 'FILE', title: title || file.name, url });
      setTitle('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'تعذر رفع الملف');
    } finally {
      setBusy(false);
    }
  };

  const removeItem = async (itemId: string) => {
    await fetch(`/api/collab/${params.id}?itemId=${itemId}`, { method: 'DELETE' });
    await load();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error || !room) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-8 text-center">
          <p className="text-text-body mb-4">{error || 'الغرفة مش متاحة'}</p>
          <Link href="/peers"><Button variant="primary">ارجع للزملاء</Button></Link>
        </div>
      </AppLayout>
    );
  }

  const peerName = room.peer.fullName || room.peer.name;
  const callUrl = `https://meet.jit.si/EliteCollab-${room.id}-${room.callToken}`;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <Link href={`/peers/${room.peer.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-brand-orange">
          <ArrowLeft size={16} /> رجوع للبروفايل
        </Link>

        <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <Avatar src={room.peer.avatar || ''} name={room.peer.name} size="lg" />
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">غرفة التعاون</p>
            <h1 className="text-xl md:text-2xl font-extrabold text-text-primary">{peerName}</h1>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setTab('content')}
            className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 -mb-px ${tab === 'content' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-text-muted'}`}
          >
            <BookOpen size={16} /> المحتوى العلمي
          </button>
          <button
            onClick={() => setTab('call')}
            className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 -mb-px ${tab === 'call' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-text-muted'}`}
          >
            <Video size={16} /> مكالمة فيديو
          </button>
        </div>

        {tab === 'content' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
              <div className="flex flex-wrap gap-2">
                {(['NOTE', 'SKILL', 'FILE'] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setKind(k)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${kind === k ? 'bg-brand-navy text-white border-brand-navy' : 'border-gray-200 text-text-muted'}`}
                  >
                    {KIND_LABEL[k]}
                  </button>
                ))}
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={kind === 'SKILL' ? 'اسم المهارة' : kind === 'FILE' ? 'اسم الملف (اختياري)' : 'عنوان (اختياري)'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
              {kind !== 'FILE' ? (
                <>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    placeholder={kind === 'SKILL' ? 'اشرح الفكرة أو الخطوات' : 'اكتب الملاحظة'}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                  <Button variant="primary" size="sm" isLoading={busy} onClick={submitText} className="rounded-xl">إضافة</Button>
                </>
              ) : (
                <label className="inline-flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer">
                  <FileText size={16} /> {busy ? 'جاري الرفع...' : 'اختر ملف (PDF / DOCX / PPTX / ZIP)'}
                  <input
                    type="file"
                    className="hidden"
                    disabled={busy}
                    accept=".pdf,.docx,.pptx,.zip"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) submitFile(f);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              {formError && <p className="text-xs text-red-600 font-semibold">{formError}</p>}
            </div>

            <div className="space-y-3">
              {room.items.length === 0 && (
                <p className="text-sm text-text-muted text-center py-8">لسه مفيش محتوى. ابدأ بمهارة أو ملف.</p>
              )}
              {room.items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange">{KIND_LABEL[item.kind]}</span>
                      {item.title && <p className="font-bold text-text-primary">{item.title}</p>}
                      {item.body && <p className="text-sm text-text-body whitespace-pre-line mt-1">{item.body}</p>}
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-brand-navy underline">
                          فتح الملف
                        </a>
                      )}
                      <p className="text-[11px] text-text-muted mt-2">
                        {item.author.fullName || item.author.name} · {new Date(item.createdAt).toLocaleString('ar-EG')}
                      </p>
                    </div>
                    {item.authorId === meId && (
                      <button onClick={() => removeItem(item.id)} className="p-2 text-text-muted hover:text-red-600" aria-label="احذف">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'call' && (
          <div className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-900">
              <iframe
                src={callUrl}
                title="مكالمة فيديو"
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full border-0"
              />
            </div>
            <p className="text-xs text-text-muted mt-3">
              المكالمة بتشتغل على Jitsi. الرابط خاص بالغرفة دي، واللي يعرفه بس انتو الاتنين.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
