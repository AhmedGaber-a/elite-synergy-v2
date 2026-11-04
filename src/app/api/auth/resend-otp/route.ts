import { randomInt } from 'crypto';
// src/app/api/auth/resend-otp/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import { isStudentEmail, normalizeEmail, GENERIC_AUTH_ERROR, GENERIC_CODE_MESSAGE } from '@/lib/services/studentEmail';

// تجهيز Nodemailer للإرسال عبر Gmail باستخدام EMAIL_USER و EMAIL_PASS
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
    }

    const trimmedEmail = normalizeEmail(email);
    const genericOk = () => NextResponse.json({ success: true, message: GENERIC_CODE_MESSAGE });

    // Non-student addresses and unknown/verified accounts get the same answer and no email.
    if (!isStudentEmail(trimmedEmail)) return genericOk();

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user || user.isVerified) return genericOk();

    // Cooldown: a new code can only be requested once a minute. Without this, each resend
    // creates a fresh token with 0 failed attempts, which would let an attacker keep guessing.
    const latest = await prisma.verificationToken.findFirst({
      where: { identifier: trimmedEmail },
      orderBy: { createdAt: 'desc' },
    });
    if (latest && Date.now() - latest.createdAt.getTime() < 60 * 1000) {
      return genericOk();
    }

    // Delete existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: trimmedEmail },
    });

    // Generate new OTP (15-min expiry)
    const otp = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: trimmedEmail,
        token: otp,
        expires: expiresAt,
      },
    });

    // Send via Nodemailer using EMAIL_USER and EMAIL_PASS
    try {
      await transporter.sendMail({
        from: `"Elite Synergy" <${process.env.EMAIL_USER}>`,
        to: trimmedEmail,
        subject: 'كود تفعيل حسابك الجديد في Elite Synergy',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>مرحباً ${user.name}!</h2>
            <p>طلبك لكود تفعيل جديد في منصة Elite Synergy. الكود الخاص بك هو:</p>
            <h1 style="color: #4F46E5; letter-spacing: 6px; font-size: 32px;">${otp}</h1>
            <p>هذا الكود صالح لمدة 15 دقيقة فقط.</p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error('Failed to resend verification email via Nodemailer:', mailErr);
    }

    return genericOk();
  } catch (error) {
    console.error('Resend OTP Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إعادة إرسال الكود' }, { status: 500 });
  }
}
