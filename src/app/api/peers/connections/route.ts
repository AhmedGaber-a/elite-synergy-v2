// GET /api/peers/connections : ids of peers with an accepted connection to the logged-in student
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  const rows = await prisma.collaborationRequest.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ senderId: user.id }, { receiverId: user.id }],
    },
    select: { senderId: true, receiverId: true },
  });
  const ids = rows.map((r) => (r.senderId === user.id ? r.receiverId : r.senderId));
  return NextResponse.json({ ids });
}
