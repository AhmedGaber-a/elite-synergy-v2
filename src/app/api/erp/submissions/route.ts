// GET /api/erp/submissions?type=solo|team&status=PENDING
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyErpRequest } from '@/lib/services/erpAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!await verifyErpRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'solo';
  const status = (searchParams.get('status') || 'PENDING').toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED';
  if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  if (type === 'team') {
    const items = await prisma.teamSubmission.findMany({
      where: { status },
      include: {
        team: { include: { project: { select: { id: true, title: true, domain: true, score: true } }, members: { include: { user: { select: { id: true, name: true, email: true } } } } } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ type: 'team', items });
  }

  const items = await prisma.soloSubmission.findMany({
    where: { status },
    include: {
      project: { select: { id: true, title: true, domain: true, score: true } },
      user: { select: { id: true, name: true, email: true, college: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ type: 'solo', items });
}
