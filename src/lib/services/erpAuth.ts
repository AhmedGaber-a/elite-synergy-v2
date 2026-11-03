// src/lib/services/erpAuth.ts
// Two ways into the ERP API:
//  1. Staff session: Authorization: Bearer <token> issued by /api/erp/auth/login (used by the Flutter app).
//  2. Server key: x-erp-key header (only for trusted server-to-server jobs, never shipped in an app).
import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export const ERP_TOKEN_TTL = '8h';

export function getErpJwtSecret(): string | null {
  const secret = process.env.ERP_JWT_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function keyMatches(provided: string): boolean {
  const expected = process.env.ERP_API_KEY;
  if (!expected || expected.length < 32) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function verifyErpRequest(req: NextRequest): Promise<{ actor: string; role: string } | null> {
  const key = req.headers.get('x-erp-key');
  if (key && keyMatches(key)) {
    return { actor: 'erp-server', role: 'ADMIN' };
  }

  const authHeader = req.headers.get('authorization') || '';
  const secret = getErpJwtSecret();
  if (!authHeader.startsWith('Bearer ') || !secret) return null;

  try {
    const payload = jwt.verify(authHeader.slice(7), secret) as { staffId?: string; typ?: string };
    if (payload.typ !== 'erp' || !payload.staffId) return null;
    // Re-check the database so a disabled staff account stops working immediately.
    const staff = await prisma.erpStaff.findUnique({ where: { id: payload.staffId } });
    if (!staff || !staff.active) return null;
    return { actor: staff.email, role: staff.role };
  } catch {
    return null;
  }
}
