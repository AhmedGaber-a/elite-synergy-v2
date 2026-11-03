// src/app/api/instructor/students/route.ts
// What an instructor sees: students' completed projects and approved practical cases.
// No emails, no passwords, no private messages. Instructors cannot change grades or points here.
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const viewer = await getAuthUser(req);
    if (!viewer) {
      return NextResponse.json({ error: 'سجّل دخولك أولاً' }, { status: 401 });
    }
    if (viewer.userRole !== 'INSTRUCTOR' && viewer.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'هذه الصفحة للدكاترة فقط' }, { status: 403 });
    }

    const college = new URL(req.url).searchParams.get('college') || '';

    const students = await prisma.user.findMany({
      where: {
        isVerified: true,
        userRole: 'STUDENT',
        ...(college ? { college } : {}),
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        college: true,
        academicYear: true,
        specialty: true,
        points: true,
        platformProjects: {
          select: { id: true, title: true, domain: true, grade: true, completedDate: true },
          orderBy: { createdAt: 'desc' },
        },
        soloSubmissions: {
          where: { status: 'APPROVED' },
          select: { id: true, name: true, grade: true, reviewedAt: true, project: { select: { title: true } } },
          orderBy: { reviewedAt: 'desc' },
        },
      },
      orderBy: { points: 'desc' },
      take: 200,
    });

    return NextResponse.json({
      students: students.map((s) => ({
        id: s.id,
        name: s.name,
        fullName: s.fullName,
        college: s.college,
        academicYear: s.academicYear,
        specialty: s.specialty,
        points: s.points,
        projects: s.platformProjects,
        approvedCases: s.soloSubmissions.map((c) => ({
          id: c.id,
          caseTitle: c.project?.title ?? '',
          fileName: c.name,
          grade: c.grade,
          reviewedAt: c.reviewedAt,
        })),
      })),
    });
  } catch (error) {
    console.error('Instructor students error:', error);
    return NextResponse.json({ error: 'تعذر تحميل الطلبة' }, { status: 500 });
  }
}
