// POST /api/erp/points  body: { userId, amount (can be negative), reason }
// Used by staff and doctors to adjust points after review.
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyErpRequest } from '@/lib/services/erpAuth';
import { awardPoints, logErpAction } from '@/lib/services/points';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const erp = await verifyErpRequest(req);
  if (!erp) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const amount = Number(body.amount);
  const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 300) : '';

  if (!body.userId || !Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 500) {
    return NextResponse.json({ error: 'userId and a non-zero integer amount (max 500) are required' }, { status: 400 });
  }
  if (!reason) return NextResponse.json({ error: 'reason is required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: body.userId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const tx = await awardPoints({
    userId: body.userId,
    amount,
    reason,
    source: 'MANUAL',
    createdBy: erp.actor,
  });
  await logErpAction(erp.actor, 'points.adjust', body.userId, { amount, reason });
  return NextResponse.json({ success: true, transaction: tx }, { status: 201 });
}
