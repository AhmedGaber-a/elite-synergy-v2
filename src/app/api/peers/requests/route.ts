// GET /api/peers/requests : pending requests for the logged-in student
// incoming = others asked to connect with me, outgoing = I asked them.
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

const PERSON = { select: { id: true, name: true, fullName: true, college: true } } as const;

export async function GET(req: NextRequest) {
  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'سجّل دخولك أولاً' }, { status: 401 });

  const [incoming, outgoing] = await Promise.all([
    prisma.collaborationRequest.findMany({
      where: { receiverId: me.id, status: 'PENDING' },
      include: { sender: PERSON },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.collaborationRequest.findMany({
      where: { senderId: me.id, status: 'PENDING' },
      include: { receiver: PERSON },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return NextResponse.json({
    incoming: incoming.map((r) => ({ id: r.id, person: r.sender, createdAt: r.createdAt })),
    outgoing: outgoing.map((r) => ({ id: r.id, person: r.receiver, createdAt: r.createdAt })),
  });
}
