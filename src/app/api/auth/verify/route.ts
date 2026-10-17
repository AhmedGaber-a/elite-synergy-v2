// src/app/api/auth/verify/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'الإيميل وكود التفعيل مطلوبان' }, { status: 400 });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedOtp = otp.toString().trim();

    const verificationRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: trimmedEmail,
        token: trimmedOtp,
      },
    });

    if (!verificationRecord) {
      return NextResponse.json({ error: 'كود التفعيل غير صحيح، برجاء التأكد من الكود المدخل' }, { status: 400 });
    }

    if (verificationRecord.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { id: verificationRecord.id } });
      return NextResponse.json({ error: 'انتهت صلاحية الكود، برجاء طلب كود جديد' }, { status: 400 });
    }

    // Mark student as verified
    await prisma.user.update({
      where: { email: trimmedEmail },
      data: { isVerified: true },
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: { id: verificationRecord.id },
    });

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
