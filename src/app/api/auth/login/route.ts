import { clientIp } from '@/lib/services/ipRisk';
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/services/authService';
import { isStudentEmail, normalizeEmail, GENERIC_AUTH_ERROR, GENERIC_CODE_MESSAGE } from '@/lib/services/studentEmail';

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Failures are counted per email AND per IP, so one attacker cannot lock a student out.
    const ip = clientIp(req.headers);
    const recentFails = await prisma.loginAttempt.count({
      where: { email: trimmedEmail, ip, createdAt: { gte: new Date(Date.now() - LOCK_MINUTES * 60 * 1000) } },
    });
    if (recentFails >= MAX_LOGIN_ATTEMPTS) {
      return NextResponse.json(
        { error: `محاولات كتير غلط. حاول بعد ${LOCK_MINUTES} دقيقة.`, locked: true },
        { status: 429 }
      );
    }

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

    // Unknown account, wrong domain and wrong password all get the same answer.
    if (!user || !isStudentEmail(trimmedEmail)) {
      await prisma.loginAttempt.create({ data: { email: trimmedEmail, ip } });
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    if (!password || !user.password) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    // Account lock after repeated wrong passwords (brute-force protection).
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `تم قفل الحساب مؤقتاً بسبب محاولات كتير. حاول بعد ${minutes} دقيقة.`, locked: true },
        { status: 429 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      await prisma.loginAttempt.create({ data: { email: trimmedEmail, ip } });
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }
    // Correct password: forget this IP's failures for this email.
    await prisma.loginAttempt.deleteMany({ where: { email: trimmedEmail, ip } });

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
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

    // Set HTTP-only cookie for secure browser sessions (30-day persistent session)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}