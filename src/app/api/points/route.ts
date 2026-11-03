// GET /api/points : the logged-in student's points, history, and skill exams
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  const [transactions, received, given, pendingExams] = await Promise.all([
    prisma.pointTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, amount: true, reason: true, source: true, createdAt: true },
    }),
    prisma.skillEndorsement.findMany({
      where: { learnerId: user.id, status: 'PASSED' },
      select: { id: true, skill: true, score: true, teacher: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.skillEndorsement.findMany({
      where: { teacherId: user.id },
      select: { id: true, skill: true, status: true, learner: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.skillEndorsement.findMany({
      where: { learnerId: user.id, status: 'EXAM_PENDING' },
      select: { id: true, skill: true, questions: true, attempts: true, teacher: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return NextResponse.json({
    points: user.points,
    transactions,
    skillsLearned: received,
    skillsTaught: given,
    pendingExams,
  });
}
