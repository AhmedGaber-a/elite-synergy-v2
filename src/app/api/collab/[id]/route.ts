// src/app/api/collab/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

const PERSON = { id: true, name: true, fullName: true, avatar: true, avatarType: true } as const;

// Room is visible only to its two members.
async function loadMemberRoom(roomId: string, meId: string) {
  const room = await prisma.collabRoom.findUnique({
    where: { id: roomId },
    include: {
      userA: { select: PERSON },
      userB: { select: PERSON },
      items: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, name: true, fullName: true } } },
      },
    },
  });
  if (!room) return { room: null, allowed: false };
  const allowed = room.userAId === meId || room.userBId === meId;
  return { room, allowed };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });

    const { room, allowed } = await loadMemberRoom(params.id, me.id);
    if (!room || !allowed) return NextResponse.json({ error: 'الغرفة مش متاحة' }, { status: 404 });

    const peer = room.userAId === me.id ? room.userB : room.userA;
    return NextResponse.json({
      room: {
        id: room.id,
        callToken: room.callToken,
        peer,
        items: room.items,
      },
      meId: me.id,
    });
  } catch (error) {
    console.error('Get collab room error:', error);
    return NextResponse.json({ error: 'تعذر تحميل الغرفة' }, { status: 500 });
  }
}

// Add a note, a skill being taught, or a file link to the room.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });

    const { room, allowed } = await loadMemberRoom(params.id, me.id);
    if (!room || !allowed) return NextResponse.json({ error: 'الغرفة مش متاحة' }, { status: 404 });

    const body = await req.json();
    const kind = body.kind;
    if (!['NOTE', 'SKILL', 'FILE'].includes(kind)) {
      return NextResponse.json({ error: 'نوع المحتوى غير صالح' }, { status: 400 });
    }

    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 150) : null;
    const text = typeof body.body === 'string' ? body.body.trim().slice(0, 5000) : null;
    const url = typeof body.url === 'string' ? body.url : null;

    if (kind === 'FILE' && (!url || !url.startsWith('https://'))) {
      return NextResponse.json({ error: 'ارفع الملف الأول' }, { status: 400 });
    }
    if (kind !== 'FILE' && !text && !title) {
      return NextResponse.json({ error: 'اكتب محتوى قبل الإضافة' }, { status: 400 });
    }

    const item = await prisma.collabItem.create({
      data: { roomId: room.id, authorId: me.id, kind, title, body: text, url },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Add collab item error:', error);
    return NextResponse.json({ error: 'تعذر الإضافة' }, { status: 500 });
  }
}

// Delete one of my own items: /api/collab/[id]?itemId=...
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });

    const itemId = new URL(req.url).searchParams.get('itemId');
    if (!itemId) return NextResponse.json({ error: 'itemId مطلوب' }, { status: 400 });

    const { room, allowed } = await loadMemberRoom(params.id, me.id);
    if (!room || !allowed) return NextResponse.json({ error: 'الغرفة مش متاحة' }, { status: 404 });

    const result = await prisma.collabItem.deleteMany({
      where: { id: itemId, roomId: room.id, authorId: me.id },
    });
    if (result.count === 0) return NextResponse.json({ error: 'مش تقدر تحذف ده' }, { status: 403 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete collab item error:', error);
    return NextResponse.json({ error: 'تعذر الحذف' }, { status: 500 });
  }
}
