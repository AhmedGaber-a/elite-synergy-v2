// src/app/api/auth/forgot/route.ts
// Sends a 6-digit reset code ONLY to existing, verified, student-domain accounts.
// Every path returns the same answer, so nobody can tell whether an account exists.
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendMail } from '@/lib/services/mailer';
import { clientIp } from '@/lib/services/ipRisk';
import { isStudentEmail, normalizeEmail } from '@/lib/services/studentEmail';
import {
  RESET_COOLDOWN_MS, RESET_CODE_TTL_MS, hashCode, ipOverLimit, newResetCode, resetIdentifier,
} from '@/lib/services/resetCodes';

export const dynamic = 'force-dynamic';

const GENERIC_MESSAGE = 'لو البريد مسجل عندنا، هيوصلك كود على الإيميل خلال دقايق.';
const generic = () => NextResponse.json({ success: true, message: GENERIC_MESSAGE });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body.email);

    // Per-IP limit: 10 requests an hour. Over the limit, the same generic answer and nothing is sent.
    if (await ipOverLimit('forgot-ip', clientIp(req.headers), 10)) return generic();

    if (!email || !isStudentEmail(email)) return generic();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isVerified) return generic();

    // Cooldown: at most one code per minute per email.
    const latest = await prisma.verificationToken.findFirst({
      where: { identifier: resetIdentifier(email) },
      orderBy: { createdAt: 'desc' },
    });
    if (latest && Date.now() - latest.createdAt.getTime() < RESET_COOLDOWN_MS) return generic();

    // Replace older codes so only the newest one can be used.
    await prisma.verificationToken.deleteMany({ where: { identifier: resetIdentifier(email) } });

    const code = newResetCode();
    await prisma.verificationToken.create({
      data: {
        identifier: resetIdentifier(email),
        token: hashCode(email, code),
        expires: new Date(Date.now() + RESET_CODE_TTL_MS),
      },
    });

    try {
      await sendMail({
        to: email,
        subject: 'كود استعادة كلمة المرور في Elite Synergy',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>مرحباً ${user.name}!</h2>
            <p>طلبت تعيين كلمة مرور جديدة. الكود هو:</p>
            <h1 style="color: #4F46E5; letter-spacing: 6px; font-size: 32px;">${code}</h1>
            <p>الكود صالح 10 دقايق.</p>
            <p>لو ماطلبتش الكود ده تجاهل الرسالة.</p>
          </div>
        `,
      });
    } catch (mailErr) {
      // The code is never logged; only the failure is.
      console.error('Forgot-password mail failed:', mailErr instanceof Error ? mailErr.message : 'unknown');
    }

    return generic();
  } catch (error) {
    console.error('Forgot password error:', error instanceof Error ? error.message : 'unknown');
    return generic();
  }
}
