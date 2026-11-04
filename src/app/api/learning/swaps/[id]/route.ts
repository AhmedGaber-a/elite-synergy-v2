// src/app/api/learning/swaps/[id]/route.ts
// The receiver accepts or declines a swap. Accepting opens (or reuses) the collaboration room.
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { notify } from '@/lib/services/learning';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });

    const { action } = await req.json();
    if (action !== 'accept' && action !== 'decline') {
      return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 });
    }

    const swap = await prisma.skillSwap.findUnique({ where: { id: params.id } });
    if (!swap || swap.toId !== me.id) {
      return NextResponse.json({ error: 'مش متاح ليك' }, { status: 403 });
    }

    if (action === 'decline') {
      await prisma.skillSwap.update({ where: { id: swap.id }, data: { status: 'DECLINED' } });
      await notify(swap.fromId, me.id, 'الاقتراح اترفض', `${me.fullName || me.name} مش موافق على التبادل`, '/learning');
      return NextResponse.json({ success: true });
    }

    const [userAId, userBId] = [swap.fromId, swap.toId].sort();
    const room = await prisma.$transaction(async (tx) => {
      await tx.skillSwap.update({ where: { id: swap.id }, data: { status: 'ACCEPTED' } });
      return tx.collabRoom.upsert({
        where: { userAId_userBId: { userAId, userBId } },
        update: {},
        create: { userAId, userBId },
        select: { id: true },
      });
    });

    await notify(
      swap.fromId,
      me.id,
      'اتقبل تبادل المهارات',
      `${me.fullName || me.name} وافق على التبادل: ${swap.giveSkill} مقابل ${swap.takeSkill}. تقدروا تتفقوا على المواعيد في الغرفة`,
      `/collab/${room.id}`
    );

    return NextResponse.json({ success: true, roomId: room.id });
  } catch (error) {
    console.error('Respond swap error:', error);
    return NextResponse.json({ error: 'تعذر تنفيذ الطلب' }, { status: 500 });
  }
}
