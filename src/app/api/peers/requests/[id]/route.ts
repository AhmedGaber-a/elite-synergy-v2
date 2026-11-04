// POST /api/peers/requests/[id]  body: { action: "accept" | "decline" }
// Only the person who received the request can answer it.
// Accepting opens the chat between the two students; declining does nothing visible.
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'سجّل دخولك أولاً' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body.action;
  if (action !== 'accept' && action !== 'decline') {
    return NextResponse.json({ error: 'action لازم تكون accept أو decline' }, { status: 400 });
  }

  const row = await prisma.collaborationRequest.findUnique({ where: { id: params.id } });
  if (!row || row.receiverId !== me.id) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
  }
  if (row.status !== 'PENDING') {
    return NextResponse.json({ error: 'تم الرد على الطلب ده قبل كده' }, { status: 409 });
  }

  if (action === 'decline') {
    await prisma.collaborationRequest.update({ where: { id: row.id }, data: { status: 'REJECTED' } });
    return NextResponse.json({ success: true, status: 'REJECTED' });
  }

  await prisma.collaborationRequest.update({ where: { id: row.id }, data: { status: 'ACCEPTED' } });

  // Open a one-to-one chat between the two students, only now that it was accepted.
  const existingConv = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      AND: [
        { participants: { some: { userId: me.id } } },
        { participants: { some: { userId: row.senderId } } },
      ],
    },
  });
  if (!existingConv) {
    await prisma.conversation.create({
      data: {
        isGroup: false,
        category: 'peers',
        lastMessage: 'تم قبول طلب التواصل',
        participants: { create: [{ userId: me.id }, { userId: row.senderId }] },
      },
    });
  }

  await prisma.notification.create({
    data: {
      userId: row.senderId,
      senderId: me.id,
      category: 'peers',
      title: 'تم قبول طلب التواصل',
      message: `${me.name} قبل طلب التواصل الأكاديمي.`,
      messageAr: `${me.name} قبل طلب التواصل الأكاديمي.`,
      actionUrl: '/peers',
    },
  });

  return NextResponse.json({ success: true, status: 'ACCEPTED' });
}
