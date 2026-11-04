// src/app/api/profile/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { availabilityOf } from '@/lib/services/availability';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });
  return NextResponse.json({
    availableForSwaps: me.availableForSwaps,
    availableForProjects: me.availableForProjects,
    ...(await availabilityOf(me)),
  });
}

// { availableForSwaps?: boolean, availableForProjects?: boolean }
export async function PUT(req: NextRequest) {
  try {
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });

    const body = await req.json();
    const data: { availableForSwaps?: boolean; availableForProjects?: boolean } = {};
    if (typeof body.availableForSwaps === 'boolean') data.availableForSwaps = body.availableForSwaps;
    if (typeof body.availableForProjects === 'boolean') data.availableForProjects = body.availableForProjects;

    const updated = await prisma.user.update({ where: { id: me.id }, data });
    return NextResponse.json({
      availableForSwaps: updated.availableForSwaps,
      availableForProjects: updated.availableForProjects,
      ...(await availabilityOf(updated)),
    });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({ error: 'تعذر حفظ الحالة' }, { status: 500 });
  }
}
