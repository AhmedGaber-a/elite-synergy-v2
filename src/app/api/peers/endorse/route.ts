// GET  /api/peers/endorse        : exams waiting for the logged-in learner (no answers included)
// POST /api/peers/endorse        : a student who knows a skill starts an endorsement for a peer
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { generateSkillExam } from '@/lib/services/aiModeration';

export const dynamic = 'force-dynamic';

const MAX_ENDORSEMENTS_PER_DAY = 5;

function hasSkill(list: string[] | null | undefined, skill: string) {
  return (list || []).some((s) => s.trim().toLowerCase() === skill.trim().toLowerCase());
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  const items = await prisma.skillEndorsement.findMany({
    where: { learnerId: user.id, status: 'EXAM_PENDING' },
    select: { id: true, skill: true, questions: true, attempts: true, teacher: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const teacher = await getAuthUser(req);
  if (!teacher) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const learnerId = typeof body.learnerId === 'string' ? body.learnerId : '';
  const skill = typeof body.skill === 'string' ? body.skill.trim().slice(0, 60) : '';

  if (!learnerId || !skill) return NextResponse.json({ error: 'learnerId and skill are required' }, { status: 400 });
  if (learnerId === teacher.id) return NextResponse.json({ error: 'You cannot endorse yourself' }, { status: 400 });

  // The teacher must actually have the skill. Otherwise anyone could hand out points for anything.
  if (!hasSkill([...(teacher.skills || []), ...(teacher.extraSkills || [])], skill)) {
    return NextResponse.json({ error: 'You can only teach skills that are on your own profile' }, { status: 403 });
  }

  const learner = await prisma.user.findUnique({ where: { id: learnerId }, select: { id: true, isVerified: true } });
  if (!learner || !learner.isVerified) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

  // Teaching only happens between students who accepted each other's connection request.
  const connection = await prisma.collaborationRequest.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { senderId: teacher.id, receiverId: learnerId },
        { senderId: learnerId, receiverId: teacher.id },
      ],
    },
    select: { id: true },
  });
  if (!connection) {
    return NextResponse.json({ error: 'Connect with this peer first' }, { status: 403 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayCount = await prisma.skillEndorsement.count({
    where: { teacherId: teacher.id, createdAt: { gte: startOfDay } },
  });
  if (todayCount >= MAX_ENDORSEMENTS_PER_DAY) {
    return NextResponse.json({ error: 'Daily endorsement limit reached' }, { status: 429 });
  }

  const existing = await prisma.skillEndorsement.findUnique({
    where: { teacherId_learnerId_skill: { teacherId: teacher.id, learnerId, skill } },
  });
  if (existing) return NextResponse.json({ error: 'Already endorsed for this skill' }, { status: 409 });

  let exam;
  try {
    exam = await generateSkillExam(skill);
  } catch (error) {
    console.error('Exam generation failed:', error);
    return NextResponse.json({ error: 'Could not create the exam right now. Try again later.' }, { status: 503 });
  }

  const created = await prisma.skillEndorsement.create({
    data: {
      teacherId: teacher.id,
      learnerId,
      skill,
      // Learners get questions without the answer key.
      questions: exam.map(({ question, options }) => ({ question, options })),
      answerKey: exam.map((q) => q.answer),
    },
    select: { id: true, skill: true, status: true },
  });

  return NextResponse.json({ success: true, endorsement: created }, { status: 201 });
}
