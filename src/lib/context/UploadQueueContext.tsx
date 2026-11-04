// src/lib/context/UploadQueueContext.tsx
// Background uploads. The context lives in the root layout, so a file keeps uploading while the user browses.
// When a job finishes, the post is saved and a "community:changed" event tells open pages to refresh.
'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { uploadCommunityFile, type UploadKind } from '@/lib/utils/communityUpload';

export type UploadJobStatus = 'uploading' | 'posting' | 'done' | 'failed';

export interface UploadJob {
  id: string;
  label: string;
  kind: UploadKind;
  status: UploadJobStatus;
  error?: string;
}

interface EnqueueOptions {
  label: string;
  file: File;
  kind: UploadKind;
  // Receives the uploaded file URL and saves the post (create or edit).
  submit: (mediaUrl: string) => Promise<unknown>;
}

interface UploadQueueContextType {
  jobs: UploadJob[];
  enqueue: (opts: EnqueueOptions) => string;
  retry: (id: string) => void;
  dismiss: (id: string) => void;
}

const UploadQueueContext = createContext<UploadQueueContextType>({
  jobs: [],
  enqueue: () => '',
  retry: () => {},
  dismiss: () => {},
});

export const COMMUNITY_CHANGED_EVENT = 'community:changed';
const SUCCESS_VISIBLE_MS = 4000;

export function UploadQueueProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  // The file and submit function are kept outside React state; they are not plain data.
  const payloads = useRef(new Map<string, EnqueueOptions>());

  const patch = useCallback((id: string, change: Partial<UploadJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...change } : j)));
  }, []);

  const run = useCallback(async (id: string) => {
    const payload = payloads.current.get(id);
    if (!payload) return;
    patch(id, { status: 'uploading', error: undefined });
    let mediaUrl: string;
    try {
      mediaUrl = await uploadCommunityFile(payload.file, payload.kind);
    } catch (err) {
      patch(id, {
        status: 'failed',
        error: err instanceof Error ? err.message : 'فشل الرفع',
      });
      return;
    }

    patch(id, { status: 'posting' });
    try {
      await payload.submit(mediaUrl);
      payloads.current.delete(id);
      patch(id, { status: 'done' });
      window.dispatchEvent(new Event(COMMUNITY_CHANGED_EVENT));
      // A successful job disappears by itself; a failed one stays until the user dismisses it.
      setTimeout(() => {
        setJobs((prev) => prev.filter((j) => j.id !== id || j.status !== 'done'));
      }, SUCCESS_VISIBLE_MS);
    } catch (err) {
      patch(id, {
        status: 'failed',
        error: err instanceof Error ? err.message : 'فشل نشر المنشور',
      });
    }
  }, [patch]);

  const enqueue = useCallback((opts: EnqueueOptions) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    payloads.current.set(id, opts);
    setJobs((prev) => [...prev, { id, label: opts.label, kind: opts.kind, status: 'uploading' }]);
    void run(id);
    return id;
  }, [run]);

  const retry = useCallback((id: string) => {
    void run(id);
  }, [run]);

  const dismiss = useCallback((id: string) => {
    payloads.current.delete(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  const value = useMemo(() => ({ jobs, enqueue, retry, dismiss }), [jobs, enqueue, retry, dismiss]);

  return <UploadQueueContext.Provider value={value}>{children}</UploadQueueContext.Provider>;
}

export const useUploadQueue = () => useContext(UploadQueueContext);
