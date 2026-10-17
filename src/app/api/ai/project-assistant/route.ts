// src/app/api/ai/project-assistant/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateProjectPlan, ProjectBreakdownInput } from '@/lib/services/aiService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { teamId, teamName, projectTitle, domain, goal, teamMembers, deadlineWeeks } = body;

    let projectInput: ProjectBreakdownInput;

    // Option A: If teamId is passed, load team and members dynamically from database
    if (teamId) {
      const team = await prisma.team.findFirst({
        where: {
          OR: [{ slug: teamId }, { id: teamId }],
        },
        include: {
          project: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!team) {
        return NextResponse.json({ error: 'Team not found for project assistant' }, { status: 404 });
      }

      projectInput = {
        teamName: team.name,
        projectTitle: team.project?.title || 'Integrated ERP & IoT Platform',
        domain: team.project?.domain || 'Cross-Disciplinary',
        goal: team.goal || 'Build a scalable integrated student enterprise project',
        deadlineWeeks: deadlineWeeks || 12,
        teamMembers: team.members.map((m) => ({
          name: m.user.name,
          role: m.role,
          domain: m.domain,
          skills: m.user.skills,
        })),
      };
    } else {
      // Option B: Provided directly in payload
      if (!teamName || !goal) {
        return NextResponse.json(
          { error: 'teamName and goal are required if teamId is not specified' },
          { status: 400 }
        );
      }

      projectInput = {
        teamName,
        projectTitle: projectTitle || teamName,
        domain: domain || 'Cross-Disciplinary',
        goal,
        deadlineWeeks: deadlineWeeks || 12,
        teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
      };
    }

    // Call AI Project Assistant with Gemini 2.5 Flash
    const breakdown = await generateProjectPlan(projectInput);

    return NextResponse.json(breakdown);
  } catch (error) {
    console.error('AI project-assistant endpoint error:', error);
    return NextResponse.json({ error: 'Failed to generate project breakdown' }, { status: 500 });
  }
}
