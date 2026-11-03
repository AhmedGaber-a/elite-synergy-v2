// POST /api/erp/auth/login  body: { email, password } -> { token }
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { ERP_TOKEN_TTL, getErpJwtSecret } from '@/lib/services/erpAuth';

export const dynamic = 'force-dynamic';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function POST(req: NextRequest) {
  const secret = getErpJwtSecret();
  if (!secret) return NextResponse.json({ error: 'ERP is not configured' }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });

  const staff = await prisma.erpStaff.findUnique({ where: { email } });
  // Same message for unknown email and wrong password, so accounts cannot be enumerated.
  const invalid = NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  if (!staff || !staff.active) return invalid;

  if (staff.lockedUntil && staff.lockedUntil > new Date()) {
    return NextResponse.json({ error: 'Account temporarily locked' }, { status: 429 });
  }

  const ok = await bcrypt.compare(password, staff.passwordHash);
  if (!ok) {
    const attempts = staff.failedAttempts + 1;
    const lock = attempts >= MAX_ATTEMPTS;
    await prisma.erpStaff.update({
      where: { id: staff.id },
      data: {
        failedAttempts: lock ? 0 : attempts,
        lockedUntil: lock ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000) : null,
      },
    });
    return invalid;
  }

  if (staff.failedAttempts > 0 || staff.lockedUntil) {
    await prisma.erpStaff.update({ where: { id: staff.id }, data: { failedAttempts: 0, lockedUntil: null } });
  }

  const token = jwt.sign({ staffId: staff.id, role: staff.role, typ: 'erp' }, secret, { expiresIn: ERP_TOKEN_TTL });
  return NextResponse.json({ token, role: staff.role, email: staff.email });
}
