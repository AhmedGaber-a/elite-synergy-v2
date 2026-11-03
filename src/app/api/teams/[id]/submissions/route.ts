// POST /api/teams/:id/submissions  body: { url?, notes? }
// Only members of the team can submit. ERP reviews the submission.
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  const team = await prisma.team.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: { members: { select: { userId: true } } },
  });
  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  if (!team.members.some((m) => m.userId === user.id)) {
    return NextResponse.json({ error: 'Only team members can submit' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const url = typeof body.url === 'string' && body.url.trim() ? body.url.trim().slice(0, 500) : null;
  const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 4000) : null;
  if (!url && !notes) return NextResponse.json({ error: 'Add a link or notes for the submission' }, { status: 400 });

  const submission = await prisma.teamSubmission.create({
    data: { teamId: team.id, submittedBy: user.id, url, notes },
    select: { id: true, status: true, createdAt: true },
  });
  return NextResponse.json({ success: true, submission }, { status: 201 });
}
