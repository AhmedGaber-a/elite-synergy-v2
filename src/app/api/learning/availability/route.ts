// src/app/api/learning/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });
  const slots = await prisma.teachingSlot.findMany({
    where: { userId: me.id },
    select: { dayOfWeek: true, hour: true },
    orderBy: [{ dayOfWeek: 'asc' }, { hour: 'asc' }],
  });
  return NextResponse.json({ slots });
}

// Replace my whole weekly availability: { slots: [{ dayOfWeek, hour }] }
export async function PUT(req: NextRequest) {
  try {
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });

    const body = await req.json();
    const raw: { dayOfWeek: number; hour: number }[] = Array.isArray(body.slots) ? body.slots : [];
    const valid = raw.filter(
      (s) => Number.isInteger(s.dayOfWeek) && s.dayOfWeek >= 0 && s.dayOfWeek <= 6 &&
             Number.isInteger(s.hour) && s.hour >= 0 && s.hour <= 23
    );
    const unique = Array.from(new Map(valid.map((s) => [`${s.dayOfWeek}-${s.hour}`, s])).values());

    await prisma.$transaction([
      prisma.teachingSlot.deleteMany({ where: { userId: me.id } }),
      prisma.teachingSlot.createMany({
        data: unique.map((s) => ({ userId: me.id, dayOfWeek: s.dayOfWeek, hour: s.hour })),
      }),
    ]);
    return NextResponse.json({ success: true, count: unique.length });
  } catch (error) {
    console.error('Save availability error:', error);
    return NextResponse.json({ error: 'تعذر حفظ المواعيد' }, { status: 500 });
  }
}
