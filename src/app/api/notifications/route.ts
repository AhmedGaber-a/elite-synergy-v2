// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { formatArabicTimeAgo } from '@/lib/utils/timeAgo';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category'); // 'all', 'community', 'peers', 'practical'

    const notifications = await prisma.notification.findMany({
      where: {
        userId: authUser.id,
        ...(category && category !== 'all' ? { category } : {}),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            fullName: true,
            avatar: true,
            avatarType: true,
            college: true,
            specialty: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: authUser.id,
        unread: true,
      },
    });

    const formatted = notifications.map((n) => {
      const times = formatArabicTimeAgo(n.createdAt);
      return {
        id: n.id,
        userId: n.userId,
        senderId: n.senderId,
        sender: n.sender?.name || 'مستخدم في المنصة',
        senderFullName: n.sender?.fullName || n.sender?.name,
        avatar: n.sender?.avatar || '',
        avatarType: n.sender?.avatarType || 'male',
        category: n.category as 'community' | 'peers' | 'practical',
        title: n.title,
        message: n.message,
        messageAr: n.messageAr || n.message,
        actionUrl: n.actionUrl,
        unread: n.unread,
        timeAgo: times.timeAgoEn,
        timeAgoAr: times.relative,
        exactDate: times.exact,
        createdAt: n.createdAt,
      };
    });

    return NextResponse.json({
      notifications: formatted,
      unreadCount,
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, id } = body;

    if (action === 'mark_all_read') {
      await prisma.notification.updateMany({
        where: {
          userId: authUser.id,
          unread: true,
        },
        data: { unread: false },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { unread: false },
      });
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all') === 'true';

    if (all) {
      await prisma.notification.deleteMany({
        where: { userId: authUser.id },
      });
      return NextResponse.json({ success: true, message: 'All notifications cleared' });
    }

    if (id) {
      await prisma.notification.delete({
        where: { id, userId: authUser.id },
      });
      return NextResponse.json({ success: true, message: 'Notification dismissed' });
    }

    return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
