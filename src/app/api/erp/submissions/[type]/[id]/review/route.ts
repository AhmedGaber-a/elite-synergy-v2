// POST /api/erp/submissions/solo|team/:id/review
// body: { action: "approve" | "reject", grade?: 0-100, feedback?: string }
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyErpRequest } from '@/lib/services/erpAuth';
import { awardPoints, logErpAction } from '@/lib/services/points';

export const dynamic = 'force-dynamic';

function gradeLabel(grade: number): string {
  if (grade >= 90) return 'A';
  if (grade >= 80) return 'B';
  if (grade >= 70) return 'C';
  if (grade >= 60) return 'D';
  return 'F';
}

export async function POST(req: NextRequest, { params }: { params: { type: string; id: string } }) {
  const erp = await verifyErpRequest(req);
  if (!erp) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body.action;
  const feedback = typeof body.feedback === 'string' ? body.feedback.trim().slice(0, 2000) : null;
  const grade = Number(body.grade);

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
  }
  if (action === 'approve' && (!Number.isInteger(grade) || grade < 0 || grade > 100)) {
    return NextResponse.json({ error: 'grade must be an integer from 0 to 100' }, { status: 400 });
  }

  const reviewedAt = new Date();
  const status = action === 'approve' ? 'APPROVED' : 'REJECTED';

  if (params.type === 'solo') {
    const sub = await prisma.soloSubmission.findUnique({
      where: { id: params.id },
      include: { project: true, user: true },
    });
    if (!sub) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

    // Claim the row first so a double click cannot award points twice.
    const claimed = await prisma.soloSubmission.updateMany({
      where: { id: sub.id, status: 'PENDING' },
      data: { status, grade: action === 'approve' ? grade : null, feedback, reviewedBy: erp.actor, reviewedAt },
    });
    if (claimed.count === 0) return NextResponse.json({ error: 'Already reviewed' }, { status: 409 });

    if (action === 'approve') {
      await prisma.platformProject.create({
        data: {
          title: sub.project.title,
          desc: feedback || sub.project.description.slice(0, 500),
          domain: sub.project.domain,
          role: 'Solo',
          supervisor: sub.project.doctor || 'Elite Synergy',
          grade: gradeLabel(grade),
          score: grade,
          completedDate: reviewedAt.toISOString().slice(0, 10),
          status: 'Verified',
          userId: sub.userId,
        },
      });
      await awardPoints({
        userId: sub.userId,
        amount: grade,
        reason: `Practical solo: ${sub.project.title}`,
        source: 'PRACTICAL',
        referenceId: `solo:${sub.id}`,
        createdBy: erp.actor,
      });
    }
    await logErpAction(erp.actor, `submission.${action}`, `solo:${sub.id}`, { grade, feedback });
    return NextResponse.json({ success: true, status });
  }

  if (params.type === 'team') {
    const sub = await prisma.teamSubmission.findUnique({
      where: { id: params.id },
      include: { team: { include: { project: true, members: true } } },
    });
    if (!sub) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

    const claimed = await prisma.teamSubmission.updateMany({
      where: { id: sub.id, status: 'PENDING' },
      data: { status, grade: action === 'approve' ? grade : null, feedback, reviewedBy: erp.actor, reviewedAt },
    });
    if (claimed.count === 0) return NextResponse.json({ error: 'Already reviewed' }, { status: 409 });

    if (action === 'approve') {
      const project = sub.team.project;
      for (const member of sub.team.members) {
        await prisma.platformProject.create({
          data: {
            title: project?.title || sub.team.name,
            desc: feedback || (project?.description || '').slice(0, 500),
            domain: project?.domain || 'General',
            role: member.role,
            teamName: sub.team.name,
            supervisor: project?.doctor || 'Elite Synergy',
            grade: gradeLabel(grade),
            score: grade,
            completedDate: reviewedAt.toISOString().slice(0, 10),
            status: 'Verified',
            userId: member.userId,
          },
        });
        await awardPoints({
          userId: member.userId,
          amount: grade,
          reason: `Practical team: ${project?.title || sub.team.name}`,
          source: 'PRACTICAL',
          referenceId: `team:${sub.id}`,
          createdBy: erp.actor,
        });
      }
    }
    await logErpAction(erp.actor, `team-submission.${action}`, `team:${sub.id}`, { grade, feedback });
    return NextResponse.json({ success: true, status });
  }

  return NextResponse.json({ error: 'type must be solo or team' }, { status: 400 });
}
