// src/app/api/auth/reset/route.ts
// Checks the reset code and sets a new password. Wrong codes void the code after 3 tries.
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { clientIp } from '@/lib/services/ipRisk';
import { isStudentEmail, normalizeEmail } from '@/lib/services/studentEmail';
import { RESET_MAX_WRONG, hashCode, ipOverLimit, resetIdentifier } from '@/lib/services/resetCodes';

export const dynamic = 'force-dynamic';

const BAD_CODE = 'الكود غير صحيح أو منتهي';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body.email);
    const code = typeof body.code === 'string' ? body.code.trim() : String(body.code ?? '').trim();
    const password = typeof body.password === 'string' ? body.password : '';

    if (await ipOverLimit('reset-ip', clientIp(req.headers), 30)) {
      return NextResponse.json({ error: 'محاولات كتير من جهازك، حاول بعد ساعة' }, { status: 429 });
    }

    if (!email || !isStudentEmail(email) || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: BAD_CODE }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 });
    }

    const identifier = resetIdentifier(email);
    const latest = await prisma.verificationToken.findFirst({
      where: { identifier },
      orderBy: { createdAt: 'desc' },
    });

    if (!latest || latest.expires < new Date() || latest.attempts >= RESET_MAX_WRONG) {
      if (latest) await prisma.verificationToken.deleteMany({ where: { identifier } });
      return NextResponse.json({ error: BAD_CODE }, { status: 400 });
    }

    if (latest.token !== hashCode(email, code)) {
      const attempts = latest.attempts + 1;
      if (attempts >= RESET_MAX_WRONG) {
        await prisma.verificationToken.deleteMany({ where: { identifier } });
      } else {
        await prisma.verificationToken.update({ where: { id: latest.id }, data: { attempts } });
      }
      return NextResponse.json({ error: BAD_CODE }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isVerified) {
      return NextResponse.json({ error: BAD_CODE }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Reset is one step: new password, codes gone, and the login lock for this email cleared.
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: passwordHash, failedLoginAttempts: 0 },
      }),
      prisma.verificationToken.deleteMany({ where: { identifier } }),
      prisma.loginAttempt.deleteMany({ where: { email } }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة المرور. سجّل دخولك بالكلمة الجديدة.',
      redirectUrl: '/auth/login',
    });
  } catch (error) {
    console.error('Reset password error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'حدث خطأ أثناء تغيير كلمة المرور' }, { status: 500 });
  }
}
