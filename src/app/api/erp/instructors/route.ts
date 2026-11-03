// POST /api/erp/instructors  body: { email, role: "INSTRUCTOR" | "STUDENT" }
// Only Elite Synergy staff can grant or remove instructor access. Nobody can pick it at registration.
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyErpRequest } from '@/lib/services/erpAuth';
import { logErpAction } from '@/lib/services/points';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const erp = await verifyErpRequest(req);
  if (!erp) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
  const role = body.role === 'INSTRUCTOR' || body.role === 'STUDENT' ? body.role : null;
  if (!email || !role) {
    return NextResponse.json({ error: 'email and role (INSTRUCTOR or STUDENT) are required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await prisma.user.update({ where: { id: user.id }, data: { userRole: role } });
  await logErpAction(erp.actor, 'user.set_role', user.id, { role });

  return NextResponse.json({ success: true, userId: user.id, role });
}
