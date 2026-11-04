// src/app/api/profile/year/route.ts
// A student sets their academic year once. Only ADMIN or ERP staff can change it afterwards.
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { verifyErpRequest } from '@/lib/services/erpAuth';
import { logErpAction } from '@/lib/services/points';
import { ensureYearGroup } from '@/lib/services/yearGroups';

export const dynamic = 'force-dynamic';

const LOCKED_MESSAGE = 'السنة الدراسية متسجلة بالفعل ولا يمكن تغييرها. كلم الإدارة لو فيه غلط.';

export async function GET(req: NextRequest) {
  const viewer = await getAuthUser(req);
  if (!viewer) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });
  return NextResponse.json({
    academicYear: viewer.academicYear,
    locked: viewer.academicYear !== null,
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const year = Number(body.academicYear);
    if (!Number.isInteger(year) || year < 1 || year > 5) {
      return NextResponse.json({ error: 'اختار السنة الدراسية من 1 لـ 5' }, { status: 400 });
    }

    // ERP staff path: changes another user's year, always logged.
    const erp = await verifyErpRequest(req);
    if (erp) {
      const targetId = typeof body.userId === 'string' ? body.userId : '';
      const target = targetId ? await prisma.user.findUnique({ where: { id: targetId } }) : null;
      if (!target) return NextResponse.json({ error: 'الطالب مش موجود' }, { status: 404 });
      const updated = await prisma.user.update({ where: { id: target.id }, data: { academicYear: year } });
      await logErpAction(erp.actor, 'user.academicYear.set', target.id, { from: target.academicYear, to: year });
      return NextResponse.json({ success: true, academicYear: updated.academicYear });
    }

    const viewer = await getAuthUser(req);
    if (!viewer) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });

    // Admin path: an admin can change another user's year.
    const targetId = typeof body.userId === 'string' && body.userId !== viewer.id ? body.userId : null;
    if (targetId) {
      if (viewer.userRole !== 'ADMIN') return NextResponse.json({ error: 'مسموح للإدارة بس' }, { status: 403 });
      const target = await prisma.user.findUnique({ where: { id: targetId } });
      if (!target) return NextResponse.json({ error: 'الطالب مش موجود' }, { status: 404 });
      const updated = await prisma.user.update({ where: { id: target.id }, data: { academicYear: year } });
      return NextResponse.json({ success: true, academicYear: updated.academicYear });
    }

    // Self path: a student can set the year only once.
    if (viewer.academicYear !== null) {
      return NextResponse.json({ error: LOCKED_MESSAGE }, { status: 403 });
    }
    const updated = await prisma.user.update({ where: { id: viewer.id }, data: { academicYear: year } });
    await ensureYearGroup(updated).catch((err) => console.error('Year group error:', err));
    return NextResponse.json({ success: true, academicYear: updated.academicYear });
  } catch (error) {
    console.error('Set academic year error:', error);
    return NextResponse.json({ error: 'تعذر حفظ السنة الدراسية' }, { status: 500 });
  }
}
