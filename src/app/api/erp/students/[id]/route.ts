// GET /api/erp/students/:id : one student's full picture for review
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyErpRequest } from '@/lib/services/erpAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await verifyErpRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const student = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, fullName: true, email: true, college: true, specialty: true,
      points: true, skills: true, extraSkills: true, isVerified: true, createdAt: true,
      platformProjects: true,
      pointTransactions: { orderBy: { createdAt: 'desc' }, take: 50 },
      soloSubmissions: { orderBy: { createdAt: 'desc' }, take: 20, select: { id: true, name: true, status: true, grade: true, createdAt: true, project: { select: { title: true } } } },
      endorsementsGiven: { select: { id: true, skill: true, status: true, score: true, learner: { select: { name: true } } } },
      endorsementsReceived: { select: { id: true, skill: true, status: true, score: true, teacher: { select: { name: true } } } },
    },
  });
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  return NextResponse.json({ student });
}
