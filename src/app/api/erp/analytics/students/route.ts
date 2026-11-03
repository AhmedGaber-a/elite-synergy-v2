// src/app/api/erp/analytics/students/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateErpApiKey, erpUnauthorized, erpCorsOptions, withErpCors } from '@/lib/utils/erpAuth';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  return erpCorsOptions(req);
}

export async function GET(req: NextRequest) {
  try {
    if (!validateErpApiKey(req)) {
      return erpUnauthorized(req);
    }

    const { searchParams } = new URL(req.url);
    const college = searchParams.get('college');
    const minScore = parseInt(searchParams.get('minScore') || '0');

    // Fetch all verified students with their collaboration data
    const students = await prisma.user.findMany({
      where: {
        isVerified: true,
        userRole: 'STUDENT',
        ...(college ? { college: { contains: college, mode: 'insensitive' } } : {}),
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        email: true,
        college: true,
        specialty: true,
        skills: true,
        points: true,
        avatarType: true,
        // Peer connections
        sentRequests: {
          where: { status: 'ACCEPTED' },
          select: { id: true },
        },
        receivedRequests: {
          where: { status: 'ACCEPTED' },
          select: { id: true },
        },
        // Community engagement
        posts: {
          select: { id: true },
        },
        postComments: {
          select: {
            id: true,
            reactions: {
              select: { id: true },
            },
          },
        },
        // Projects & Teams
        teamMemberships: {
          select: { id: true },
        },
        soloSubmissions: {
          select: { id: true },
        },
      },
    });

    const analytics = students
      .map((student) => {
        const peersConnectedCount =
          student.sentRequests.length + student.receivedRequests.length;

        const communityPostsCount = student.posts.length;

        // A "helpful comment" is one that received at least one positive reaction
        const helpfulCommentsCount = student.postComments.filter(
          (c) => c.reactions.length > 0
        ).length;

        const activeProjectsCount = student.teamMemberships.length + student.soloSubmissions.length;
        const teamsJoinedCount = student.teamMemberships.length;

        // Synergy Score: weighted formula
        // Peers: 10pts each (max 100)
        // Helpful Comments: 15pts each (max 150)
        // Community Posts: 5pts each (max 50)
        // Active Projects: 20pts each (max 100)
        const synergyScore = Math.min(
          500,
          Math.round(
            Math.min(peersConnectedCount * 10, 100) +
            Math.min(helpfulCommentsCount * 15, 150) +
            Math.min(communityPostsCount * 5, 50) +
            Math.min(activeProjectsCount * 20, 100) +
            student.points * 0.1
          )
        );

        return {
          userId: student.id,
          name: student.name,
          fullName: student.fullName,
          email: student.email,
          college: student.college,
          specialty: student.specialty,
          skills: student.skills,
          peersConnectedCount,
          communityPostsCount,
          helpfulCommentsCount,
          activeProjectsCount,
          teamsJoinedCount,
          synergyScore,
          platformPoints: student.points,
        };
      })
      .filter((s) => s.synergyScore >= minScore)
      .sort((a, b) => b.synergyScore - a.synergyScore);

    // Top 3 collaborators
    const topCollaborators = analytics.slice(0, 3).map((s) => s.userId);

    return withErpCors(
      NextResponse.json({
        success: true,
        generatedAt: new Date().toISOString(),
        totalStudents: analytics.length,
        topCollaborators,
        students: analytics,
        scoringFormula: {
          description: 'Synergy Score = peer connections (10pts each, max 100) + helpful comments (15pts each, max 150) + community posts (5pts each, max 50) + active projects (20pts each, max 100) + platform points × 0.1',
          maxPossible: 500,
        },
      }),
      req
    );
  } catch (error) {
    console.error('ERP analytics students error:', error);
    return withErpCors(
      NextResponse.json({ error: 'Failed to generate student analytics' }, { status: 500 }),
      req
    );
  }
}
