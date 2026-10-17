// src/app/api/ai/match-team/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { matchStudentToTeams, StudentProfileInput, AvailableTeamInput } from '@/lib/services/aiService';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const body = await req.json().catch(() => ({}));

    // 1. Resolve student profile (from body or current user in DB)
    let student: StudentProfileInput;

    if (body.skills && body.name) {
      student = {
        name: body.name,
        college: body.college || 'Computer Science',
        specialty: body.specialty || 'Software Engineering',
        skills: Array.isArray(body.skills) ? body.skills : [],
        bio: body.bio || '',
        points: body.points || 0,
      };
    } else {
      const user =
        authUser ||
        (await prisma.user.findFirst({
          where: { email: 'ahmed.gaber@elite-synergy.edu.eg' },
        }));

      if (!user) {
        return NextResponse.json({ error: 'User profile not found for AI matching' }, { status: 404 });
      }

      student = {
        name: user.name,
        college: user.college,
        specialty: user.specialty,
        skills: user.skills,
        bio: user.bio || '',
        points: user.points,
      };
    }

    // 2. Fetch all available teams with their project details and existing member roles
    const teamsFromDb = await prisma.team.findMany({
      include: {
        project: true,
        members: {
          include: {
            user: true,
          },
        },
      },
      where: {
        slots: { gt: 0 }, // Only teams with available open slots
      },
    });

    const teamsInput: AvailableTeamInput[] = teamsFromDb.map((t) => ({
      id: t.slug || t.id,
      name: t.name,
      projectTitle: t.project?.title,
      domain: t.project?.domain,
      goal: t.goal || '',
      level: t.level,
      slots: t.slots,
      maxSlots: t.maxSlots,
      existingMembers: t.members.map((m) => ({
        name: m.user.name,
        role: m.role,
        domain: m.domain,
      })),
    }));

    if (teamsInput.length === 0) {
      return NextResponse.json({
        studentName: student.name,
        topRecommendation: null,
        allMatches: [],
        overallAdvice: 'All current teams are at full capacity. You can create a new team as a team lead!',
      });
    }

    // 3. Run Gemini AI matching
    const result = await matchStudentToTeams(student, teamsInput);

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI match-team endpoint error:', error);
    return NextResponse.json({ error: 'Failed to process AI team matching' }, { status: 500 });
  }
}
