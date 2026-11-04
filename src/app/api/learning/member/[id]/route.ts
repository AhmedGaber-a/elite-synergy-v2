// src/app/api/learning/member/[id]/route.ts
// Teacher accepts or declines a learner who asked to join a session.
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { notify, hourLabel } from '@/lib/services/learning';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });

    const { action } = await req.json();
    if (action !== 'accept' && action !== 'decline') {
      return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 });
    }

    const member = await prisma.learnGroupMember.findUnique({
      where: { id: params.id },
      include: { group: true },
    });
    if (!member || member.group.teacherId !== me.id) {
      return NextResponse.json({ error: 'مش متاح ليك' }, { status: 403 });
    }

    await prisma.learnGroupMember.update({
      where: { id: member.id },
      data: { status: action === 'accept' ? 'ACCEPTED' : 'DECLINED' },
    });

    await notify(
      member.learnerId,
      me.id,
      action === 'accept' ? 'اتقبل طلب التعلم' : 'الطلب اترفض',
      action === 'accept'
        ? `${me.fullName || me.name} وافق يعلمك ${member.group.skill} الساعة ${hourLabel(member.group.hour)}`
        : `${me.fullName || me.name} مش متاح لطلب ${member.group.skill} في الميعاد ده`,
      '/learning'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Respond learner error:', error);
    return NextResponse.json({ error: 'تعذر تنفيذ الطلب' }, { status: 500 });
  }
}
