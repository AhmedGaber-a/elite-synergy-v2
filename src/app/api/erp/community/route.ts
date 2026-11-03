// GET /api/erp/community?status=PENDING|REMOVED|APPROVED
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyErpRequest } from '@/lib/services/erpAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!verifyErpRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') || 'PENDING').toUpperCase();
  if (!['PENDING', 'REMOVED', 'APPROVED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const posts = await prisma.post.findMany({
    where: { moderationStatus: status as 'PENDING' | 'REMOVED' | 'APPROVED' },
    select: {
      id: true,
      content: true,
      mediaType: true,
      moderationNote: true,
      createdAt: true,
      author: { select: { id: true, name: true, email: true, college: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json({ items: posts });
}
