// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import { AvatarType, UserRole } from '@prisma/client';

// تجهيز Nodemailer للإرسال عبر Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      fullName,
      email,
      password,
      college = 'Computer Science',
      specialty = 'Computer Science & Software Systems',
      skills = [],
      languages = [],
      toolSkills = [],
      extraSkills = [],
      bio = '',
      cvUrl = '',
      resumeUrl = '',
      socialLinks = {},
      avatarType = 'male',
      priorProjects = [],
    } = body;

    const trimmedEmail = (email || '').toLowerCase().trim();

    // 1. Strict university email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@fa-hists\.edu\.eg$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'عذراً، التسجيل مسموح فقط بالإيميل الجامعي الرسمي @fa-hists.edu.eg' },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // 2. Ensure email is not already registered
    const existingUser = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json({ error: 'هذا الحساب مسجل بالفعل، يمكنك تسجيل الدخول.' }, { status: 400 });
      } else {
        // If user registered but never verified, we can refresh OTP
        // Clean old tokens
        await prisma.verificationToken.deleteMany({ where: { identifier: trimmedEmail } });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.verificationToken.create({
          data: { identifier: trimmedEmail, token: otp, expires: expiresAt },
        });

        try {
          await transporter.sendMail({
            from: `"Elite Synergy" <${process.env.EMAIL_USER}>`,
            to: trimmedEmail,
            subject: 'كود تفعيل حسابك في Elite Synergy',
            html: `
              <div dir="rtl" style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2>مرحباً بك مجدداً!</h2>
                <p>كود تفعيل حسابك في منصة Elite Synergy هو:</p>
                <h1 style="color: #4F46E5; letter-spacing: 6px; font-size: 32px;">${otp}</h1>
                <p>هذا الكود صالح لمدة 15 دقيقة فقط.</p>
              </div>
            `,
          });
        } catch (mailErr) {
          console.error('Failed to send verification email via Nodemailer:', mailErr);
        }

        return NextResponse.json(
          {
            message: 'تم إعادة إرسال كود التفعيل إلى بريدك الجامعي.',
            redirectUrl: `/auth/verify?email=${encodeURIComponent(trimmedEmail)}`,
          },
          { status: 200 }
        );
      }
    }

    // 3. Hash password and create unverified student
    const hashedPassword = await bcrypt.hash(password, 10);
    const finalCvUrl = cvUrl || resumeUrl || null;
    const displayName = name || fullName?.split(' ')[0] || 'Student';

    const newUser = await prisma.user.create({
      data: {
        name: displayName,
        fullName: fullName || displayName,
        email: trimmedEmail,
        password: hashedPassword,
        college,
        specialty,
        discipline: college,
        skills: Array.isArray(skills) ? skills : [],
        languages: languages || null,
        toolSkills: toolSkills || null,
        extraSkills: Array.isArray(extraSkills) ? extraSkills : [],
        bio: bio || null,
        resumeUrl: finalCvUrl,
        socialLinks: socialLinks || null,
        avatarType: (avatarType === 'female' || avatarType === 'hijab' || avatarType === 'niqab')
          ? AvatarType.female
          : AvatarType.male,
        userRole: UserRole.STUDENT,
        isVerified: false,
        priorProjects: {
          create: (priorProjects || []).map((p: {
            title: string;
            desc?: string;
            skill?: string;
            emoji?: string;
            uploadDate?: string;
            fileUrl?: string;
          }) => ({
            title: p.title || 'Portfolio Project',
            desc: p.desc || 'Academic project uploaded during onboarding',
            skill: p.skill || 'General',
            emoji: p.emoji || '💼',
            uploadDate: p.uploadDate || new Date().toISOString().split('T')[0],
            source: 'registration',
            fileUrl: p.fileUrl || null,
          })),
        },
      },
    });

    // 4. Generate 6-digit OTP (15-min expiry)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { identifier: trimmedEmail, token: otp, expires: expiresAt },
    });

    // 5. Send OTP via Nodemailer
    try {
      await transporter.sendMail({
        from: `"Elite Synergy" <${process.env.EMAIL_USER}>`,
        to: trimmedEmail,
        subject: 'كود تفعيل حسابك في Elite Synergy',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>مرحباً ${newUser.name}!</h2>
            <p>شكراً لتسجيلك في منصة Elite Synergy. كود التفعيل الخاص بك هو:</p>
            <h1 style="color: #4F46E5; letter-spacing: 6px; font-size: 32px;">${otp}</h1>
            <p>هذا الكود صالح لمدة 15 دقيقة فقط.</p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error('Failed to send verification email via Nodemailer:', mailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء الحساب بنجاح. برجاء مراجعة بريدك الجامعي لتفعيل الحساب.',
        redirectUrl: `/auth/verify?email=${encodeURIComponent(trimmedEmail)}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الحساب' }, { status: 500 });
  }
}