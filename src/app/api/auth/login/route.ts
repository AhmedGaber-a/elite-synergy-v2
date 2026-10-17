// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/services/authService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const trimmedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      include: {
        priorProjects: true,
        platformProjects: true,
        teamMemberships: {
          include: {
            team: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: 'هذا الحساب غير مسجل على المنصة. يرجى إنشاء حساب جديد (Sign Up) أولاً ثم تسجيل الدخول.',
          notRegistered: true,
        },
        { status: 404 }
      );
    }

    if (!password || !user.password) {
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }

    // --- شرط الحماية لمنع الدخول قبل تفعيل الإيميل ---
    if (!user.isVerified) {
      return NextResponse.json(
        {
          error: 'برجاء تفعيل حسابك أولاً باستخدام الكود المرسل إلى بريدك الجامعي',
          unverified: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const userSafe = { ...user };
    delete (userSafe as { password?: string | null }).password;

    const fullUserSafe = {
      ...userSafe,
      avatarUrl: userSafe.avatar || null,
      image: userSafe.avatar || null,
      avatarType: userSafe.avatarType,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: fullUserSafe,
    });

    // Set HTTP-only cookie for secure browser sessions
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}