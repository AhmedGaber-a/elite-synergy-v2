// src/app/api/auth/verify/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'الإيميل وكود التفعيل مطلوبان' }, { status: 400 });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedOtp = otp.toString().trim();

    // Only the newest code for this email is valid. Older codes are never accepted.
    const latest = await prisma.verificationToken.findFirst({
      where: { identifier: trimmedEmail },
      orderBy: { createdAt: 'desc' },
    });

    if (!latest) {
      return NextResponse.json({ error: 'كود التفعيل غير صحيح، برجاء التأكد من الكود المدخل' }, { status: 400 });
    }

    if (latest.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { id: latest.id } });
      return NextResponse.json({ error: 'انتهت صلاحية الكود، برجاء طلب كود جديد' }, { status: 400 });
    }

    // Brute-force protection: a 6-digit code has only a million values.
    if (latest.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'محاولات كتير، برجاء طلب كود جديد' }, { status: 429 });
    }

    if (latest.token !== trimmedOtp) {
      await prisma.verificationToken.update({
        where: { id: latest.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json({ error: 'كود التفعيل غير صحيح، برجاء التأكد من الكود المدخل' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.updateMany({ where: { email: trimmedEmail }, data: { isVerified: true } }),
      prisma.verificationToken.deleteMany({ where: { identifier: trimmedEmail } }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: 'تم تفعيل الحساب بنجاح، يمكنك الآن تسجيل الدخول.',
        redirectUrl: '/auth/login?verified=true',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تفعيل الحساب' }, { status: 500 });
  }
}
