// src/app/api/learning/teachers/[id]/route.ts
// What a student can book from a peer: their skills, free hours, and session seats.
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { MAX_LEARNERS_PER_GROUP } from '@/lib/services/learning';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });

    const teacher = await prisma.user.findFirst({
      where: { id: params.id, isVerified: true },
      select: { id: true, name: true, fullName: true, skills: true },
    });
    if (!teacher) return NextResponse.json({ error: 'الزميل مش موجود' }, { status: 404 });

    const [slots, groups] = await Promise.all([
      prisma.teachingSlot.findMany({
        where: { userId: teacher.id },
        select: { dayOfWeek: true, hour: true },
        orderBy: [{ dayOfWeek: 'asc' }, { hour: 'asc' }],
      }),
      prisma.learnGroup.findMany({
        where: { teacherId: teacher.id },
        include: { members: { where: { status: { not: 'DECLINED' } }, select: { learnerId: true } } },
      }),
    ]);

    return NextResponse.json({
      teacher: { id: teacher.id, name: teacher.name, fullName: teacher.fullName },
      skills: teacher.skills,
      slots,
      maxLearners: MAX_LEARNERS_PER_GROUP,
      groups: groups.map((g) => ({
        skill: g.skill,
        dayOfWeek: g.dayOfWeek,
        hour: g.hour,
        taken: g.members.length,
        mine: g.members.some((m) => m.learnerId === me.id),
      })),
    });
  } catch (error) {
    console.error('Teacher availability error:', error);
    return NextResponse.json({ error: 'تعذر تحميل المواعيد' }, { status: 500 });
  }
}
