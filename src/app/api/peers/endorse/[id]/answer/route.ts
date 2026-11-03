// POST /api/peers/endorse/:id/answer  body: { answers: number[] }
// Grading is deterministic against the stored answer key. Pass mark: 70%. Two attempts.
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { awardPoints } from '@/lib/services/points';

export const dynamic = 'force-dynamic';

const PASS_MARK = 70;
const MAX_ATTEMPTS = 2;
const POINTS_PER_SIDE = 10;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const learner = await getAuthUser(req);
  if (!learner) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  const endorsement = await prisma.skillEndorsement.findUnique({ where: { id: params.id } });
  if (!endorsement || endorsement.learnerId !== learner.id) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
  }
  if (endorsement.status !== 'EXAM_PENDING') {
    return NextResponse.json({ error: 'This exam is already closed' }, { status: 409 });
  }
  if (endorsement.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'No attempts left' }, { status: 409 });
  }

  const body = await req.json().catch(() => ({}));
  const answers: unknown = body.answers;
  const key = endorsement.answerKey as number[];
  if (!Array.isArray(answers) || answers.length !== key.length || answers.some((a) => !Number.isInteger(a))) {
    return NextResponse.json({ error: `Send exactly ${key.length} numeric answers` }, { status: 400 });
  }

  const correct = key.filter((k, i) => answers[i] === k).length;
  const score = Math.round((correct / key.length) * 100);
  const passed = score >= PASS_MARK;
  const attempts = endorsement.attempts + 1;
  const nextStatus = passed ? 'PASSED' : attempts >= MAX_ATTEMPTS ? 'FAILED' : 'EXAM_PENDING';

  // Claim the attempt so two parallel submits cannot both award points.
  const claimed = await prisma.skillEndorsement.updateMany({
    where: { id: endorsement.id, status: 'EXAM_PENDING', attempts: endorsement.attempts },
    data: { attempts, score, status: nextStatus },
  });
  if (claimed.count === 0) return NextResponse.json({ error: 'Please try again' }, { status: 409 });

  if (passed) {
    const me = await prisma.user.findUnique({ where: { id: learner.id }, select: { extraSkills: true } });
    if (!(me?.extraSkills || []).some((s) => s.toLowerCase() === endorsement.skill.toLowerCase())) {
      await prisma.user.update({
        where: { id: learner.id },
        data: { extraSkills: { push: endorsement.skill } },
      });
    }
    await awardPoints({
      userId: endorsement.teacherId,
      amount: POINTS_PER_SIDE,
      reason: `Taught ${endorsement.skill}`,
      source: 'PEER',
      referenceId: `endorse:${endorsement.id}`,
    });
    await awardPoints({
      userId: endorsement.learnerId,
      amount: POINTS_PER_SIDE,
      reason: `Learned ${endorsement.skill}`,
      source: 'PEER',
      referenceId: `endorse:${endorsement.id}`,
    });
  }

  return NextResponse.json({
    success: true,
    score,
    passed,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - attempts),
    status: nextStatus,
  });
}
