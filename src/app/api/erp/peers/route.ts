// GET /api/erp/peers?status=PASSED|FAILED|EXAM_PENDING : skill endorsements for monitoring
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyErpRequest } from '@/lib/services/erpAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!verifyErpRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const status = new URL(req.url).searchParams.get('status');
  const items = await prisma.skillEndorsement.findMany({
    where: status ? { status: status as 'PASSED' | 'FAILED' | 'EXAM_PENDING' } : {},
    select: {
      id: true, skill: true, status: true, score: true, attempts: true, createdAt: true,
      teacher: { select: { id: true, name: true, college: true } },
      learner: { select: { id: true, name: true, college: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return NextResponse.json({ items });
}
