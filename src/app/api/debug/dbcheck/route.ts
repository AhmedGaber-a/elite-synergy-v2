// TEMPORARY diagnostic: returns a hash of the DB host and whether the new column exists. No secrets.
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.DATABASE_URL || '';
  const host = url.replace(/^.*@/, '').replace(/[/?].*$/, '');
  const hostHash = createHash('sha256').update(host).digest('hex').slice(0, 10);
  let column: string | null = null;
  try {
    const rows = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
      `select column_name from information_schema.columns where table_name = 'User' and column_name = 'availableForSwaps'`
    );
    column = rows.length ? 'exists' : 'missing';
  } catch (e) {
    column = 'error: ' + (e instanceof Error ? e.name : 'unknown');
  }
  const afterHost = url.split('@')[1] || '';
  const dbName = afterHost.includes('/') ? afterHost.split('/')[1].split('?')[0] : null;
  const params = afterHost.includes('?') ? afterHost.split('?')[1].split('&').map((x) => x.split('=')[0]) : [];
  return NextResponse.json({ hostHash, dbName, urlParamNames: params, hasUrl: url.length > 0, column });
}
