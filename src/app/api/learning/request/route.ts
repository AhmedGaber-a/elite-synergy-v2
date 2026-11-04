import { hourAgo, tooMany } from '@/lib/services/limits';
// src/app/api/learning/request/route.ts
// I ask a peer to teach me `skill` in a given weekly slot.
// All learners who pick the same teacher + skill + slot share one group (max 3).
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { MAX_LEARNERS_PER_GROUP, notify, hourLabel } from '@/lib/services/learning';

export const dynamic = 'force-dynamic';

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export async function POST(req: NextRequest) {
  try {
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });
    const recentLearn = await prisma.learnGroupMember.count({ where: { learnerId: me.id, createdAt: { gte: hourAgo() } } });
    if (recentLearn >= 20) return tooMany('وصلت للحد المسموح من طلبات التعلم في الساعة، حاول بعدين');

    const { teacherId, skill, dayOfWeek, hour } = await req.json();
    if (!teacherId || teacherId === me.id) {
      return NextResponse.json({ error: 'زميل غير صالح' }, { status: 400 });
    }

    const teacher = await prisma.user.findFirst({
      where: { id: teacherId, isVerified: true },
      select: { id: true, skills: true, name: true, fullName: true },
    });
    if (!teacher || !teacher.skills.includes(skill)) {
      return NextResponse.json({ error: 'المهارة دي مش عند الزميل ده' }, { status: 400 });
    }

    const slot = await prisma.teachingSlot.findFirst({
      where: { userId: teacherId, dayOfWeek, hour },
      select: { id: true },
    });
    if (!slot) return NextResponse.json({ error: 'الميعاد ده مش متاح' }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const group = await tx.learnGroup.upsert({
        where: { teacherId_skill_dayOfWeek_hour: { teacherId, skill, dayOfWeek, hour } },
        update: {},
        create: { teacherId, skill, dayOfWeek, hour },
      });

      const members = await tx.learnGroupMember.findMany({
        where: { groupId: group.id, status: { not: 'DECLINED' } },
        select: { learnerId: true },
      });
      if (members.some((m) => m.learnerId === me.id)) {
        return { error: 'انت مسجل بالفعل في الميعاد ده', status: 409 } as const;
      }
      if (members.length >= MAX_LEARNERS_PER_GROUP) {
        return { error: 'الجروب ده اكتمل (3 طلاب)', status: 409 } as const;
      }

      await tx.learnGroupMember.create({
        data: { groupId: group.id, learnerId: me.id, status: 'PENDING' },
      });
      return { ok: true } as const;
    });

    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });

    await notify(
      teacherId,
      me.id,
      'طلب تعلم جديد',
      `${me.fullName || me.name} عايز يتعلم ${skill} يوم ${DAYS[dayOfWeek]} الساعة ${hourLabel(hour)}`,
      '/learning'
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Learn request error:', error);
    return NextResponse.json({ error: 'تعذر إرسال الطلب' }, { status: 500 });
  }
}
