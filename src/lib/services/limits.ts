// src/lib/services/limits.ts
import { NextResponse } from 'next/server';

export const hourAgo = () => new Date(Date.now() - 60 * 60 * 1000);

export const tooMany = (msg: string) => NextResponse.json({ error: msg }, { status: 429 });

// Stops waiting on a slow external service instead of hanging the request.
export function withTimeout<T>(promise: Promise<T>, ms: number, label = 'timeout'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(label)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}
