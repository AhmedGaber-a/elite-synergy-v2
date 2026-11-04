// src/components/upload/UploadBar.tsx
// Fixed bar above the mobile nav that shows background uploads.
'use client';
import React from 'react';
import { Check, AlertCircle, RotateCcw, X, Loader2 } from 'lucide-react';
import { useUploadQueue, type UploadJob } from '@/lib/context/UploadQueueContext';

function statusText(job: UploadJob): string {
  if (job.status === 'uploading') return `جاري رفع ${job.label}…`;
  if (job.status === 'posting') return 'جاري النشر…';
  if (job.status === 'done') return 'تم النشر ✓';
  return job.error || 'فشل الرفع';
}

export function UploadBar() {
  const { jobs, retry, dismiss } = useUploadQueue();
  if (jobs.length === 0) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 md:bottom-4 md:start-auto md:end-4 md:w-96 z-[80] space-y-2" dir="rtl">
      {jobs.map((job) => {
        const failed = job.status === 'failed';
        const done = job.status === 'done';
        return (
          <div
            key={job.id}
            className={`rounded-2xl shadow-lg border px-4 py-3 flex items-center gap-3 text-sm bg-white ${
              failed ? 'border-red-200' : done ? 'border-green-200' : 'border-gray-100'
            }`}
          >
            {failed ? (
              <AlertCircle size={18} className="text-red-500 shrink-0" />
            ) : done ? (
              <Check size={18} className="text-green-600 shrink-0" />
            ) : (
              <Loader2 size={18} className="text-brand-orange animate-spin shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p className={`font-semibold truncate ${failed ? 'text-red-600' : 'text-text-primary'}`}>{statusText(job)}</p>
              {failed && (
                <p className="text-[11px] text-text-muted mt-0.5">
                  لو قفلت الصفحة قبل ما الرفع يخلص، لازم ترفع الملف تاني.
                </p>
              )}
            </div>

            {failed && (
              <button
                type="button"
                onClick={() => retry(job.id)}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-orange hover:underline shrink-0"
              >
                <RotateCcw size={13} /> أعد المحاولة
              </button>
            )}
            {failed && (
              <button type="button" onClick={() => dismiss(job.id)} className="p-1 text-text-muted hover:text-text-primary shrink-0" aria-label="إغلاق">
                <X size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
