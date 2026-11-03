// src/lib/services/erpAuth.ts
// The ERP is a server-to-server client. It authenticates with a shared secret
// in the x-erp-key header, never with a student's login token.
import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';

export function verifyErpRequest(req: NextRequest): { actor: string } | null {
  const expected = process.env.ERP_API_KEY;
  const provided = req.headers.get('x-erp-key') || '';
  if (!expected || expected.length < 32) {
    return null; // refuse everything until a strong key is configured
  }
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null;
  }
  // The actor name is optional and only recorded in the audit log.
  return { actor: req.headers.get('x-erp-user') || 'erp' };
}
