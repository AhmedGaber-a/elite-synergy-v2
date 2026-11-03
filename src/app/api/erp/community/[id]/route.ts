// POST /api/erp/community/:id  body: { action: "approve" | "remove", note?: string }
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyErpRequest } from '@/lib/services/erpAuth';
import { logErpAction } from '@/lib/services/points';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const erp = verifyErpRequest(req);
  if (!erp) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (body.action !== 'approve' && body.action !== 'remove') {
    return NextResponse.json({ error: 'action must be approve or remove' }, { status: 400 });
  }
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : null;
  const status = body.action === 'approve' ? 'APPROVED' : 'REMOVED';

  const updated = await prisma.post.updateMany({
    where: { id: params.id },
    data: { moderationStatus: status, moderationNote: note },
  });
  if (updated.count === 0) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  await logErpAction(erp.actor, `community.${body.action}`, params.id, { note });
  return NextResponse.json({ success: true, moderationStatus: status });
}
