// src/app/api/collab/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { areConnected } from '@/lib/services/connections';

export const dynamic = 'force-dynamic';

// Open (or create) the private collaboration room between me and an accepted peer.
export async function POST(req: NextRequest) {
  try {
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });

    const { peerId } = await req.json();
    if (!peerId || peerId === me.id) {
      return NextResponse.json({ error: 'زميل غير صالح' }, { status: 400 });
    }
    if (!(await areConnected(me.id, peerId))) {
      return NextResponse.json({ error: 'لازم الزميل يقبل طلب التواصل الأول' }, { status: 403 });
    }

    // Store the pair in a fixed order so each pair has exactly one room.
    const [userAId, userBId] = [me.id, peerId].sort();
    const room = await prisma.collabRoom.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      update: {},
      create: { userAId, userBId },
      select: { id: true },
    });

    return NextResponse.json({ roomId: room.id });
  } catch (error) {
    console.error('Open collab room error:', error);
    return NextResponse.json({ error: 'تعذر فتح الغرفة' }, { status: 500 });
  }
}
