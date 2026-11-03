// src/app/api/unread/route.ts
// Real unread counts for the navbar badges. Badges only show when a count is above zero.
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ messages: 0, notifications: 0 }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const [messages, notifications] = await Promise.all([
      prisma.message.count({
        where: {
          isRead: false,
          senderId: { not: authUser.id },
          conversation: { participants: { some: { userId: authUser.id } } },
        },
      }),
      prisma.notification.count({
        where: { userId: authUser.id, unread: true },
      }),
    ]);

    return NextResponse.json({ messages, notifications }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Unread counts error:', error);
    return NextResponse.json({ messages: 0, notifications: 0 }, { status: 500 });
  }
}
