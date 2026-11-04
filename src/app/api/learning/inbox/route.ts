// src/app/api/learning/inbox/route.ts
// Everything on the learning page for the viewer.
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

const PERSON = { id: true, name: true, fullName: true } as const;

export async function GET(req: NextRequest) {
  try {
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });

    const [pendingForMe, myLearning, swapsIn, swapsOut] = await Promise.all([
      prisma.learnGroupMember.findMany({
        where: { status: 'PENDING', group: { teacherId: me.id } },
        include: { learner: { select: PERSON }, group: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.learnGroupMember.findMany({
        where: { learnerId: me.id, status: { not: 'DECLINED' } },
        include: { group: { include: { teacher: { select: PERSON } } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.skillSwap.findMany({
        where: { toId: me.id, status: 'PENDING' },
        include: { from: { select: PERSON } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.skillSwap.findMany({
        where: { fromId: me.id },
        include: { to: { select: PERSON } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      incomingLearners: pendingForMe.map((m) => ({
        id: m.id,
        learner: m.learner,
        skill: m.group.skill,
        dayOfWeek: m.group.dayOfWeek,
        hour: m.group.hour,
      })),
      myLearning: myLearning.map((m) => ({
        id: m.id,
        status: m.status,
        teacher: m.group.teacher,
        skill: m.group.skill,
        dayOfWeek: m.group.dayOfWeek,
        hour: m.group.hour,
      })),
      swapsIn,
      swapsOut,
    });
  } catch (error) {
    console.error('Learning inbox error:', error);
    return NextResponse.json({ error: 'تعذر تحميل الصفحة' }, { status: 500 });
  }
}
