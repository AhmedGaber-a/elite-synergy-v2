// src/app/api/erp/projects/[id]/submissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateErpApiKey, erpUnauthorized, erpCorsOptions, withErpCors } from '@/lib/utils/erpAuth';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  return erpCorsOptions(req);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!validateErpApiKey(req)) {
      return erpUnauthorized(req);
    }

    const projectId = params.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    fullName: true,
                    email: true,
                    college: true,
                    specialty: true,
                    avatar: true,
                    skills: true,
                  },
                },
              },
            },
            files: true,
          },
        },
        soloSubmissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                fullName: true,
                email: true,
                college: true,
                specialty: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return withErpCors(
        NextResponse.json({ error: 'Project not found' }, { status: 404 }),
        req
      );
    }

    const teamSubmissions = project.teams.map((team) => ({
      type: 'team',
      teamId: team.id,
      teamName: team.name,
      teamEmoji: team.emoji,
      membersCount: team.members.length,
      members: team.members.map((m) => ({
        userId: m.user.id,
        name: m.user.name,
        fullName: m.user.fullName,
        email: m.user.email,
        college: m.user.college,
        specialty: m.user.specialty,
        role: m.role,
      })),
      files: team.files.map((f) => ({
        id: f.id,
        name: f.name,
        url: f.url,
        type: f.type,
        uploadedAt: f.createdAt,
      })),
    }));

    const soloSubmissions = project.soloSubmissions.map((sub) => ({
      type: 'solo',
      submissionId: sub.id,
      userId: sub.user.id,
      name: sub.user.name,
      fullName: sub.user.fullName,
      email: sub.user.email,
      college: sub.user.college,
      specialty: sub.user.specialty,
      fileUrl: sub.url,
      notes: sub.notes,
      submittedAt: sub.createdAt,
    }));

    return withErpCors(
      NextResponse.json({
        success: true,
        project: {
          id: project.id,
          title: project.title,
          courseCode: project.courseCode,
          professorName: project.professorName,
          deadline: project.deadline,
          source: project.source,
          erpReferenceId: project.erpReferenceId,
        },
        teamSubmissions,
        soloSubmissions,
        totalTeams: teamSubmissions.length,
        totalSoloSubmissions: soloSubmissions.length,
      }),
      req
    );
  } catch (error) {
    console.error('ERP submissions fetch error:', error);
    return withErpCors(
      NextResponse.json({ error: 'Failed to fetch project submissions' }, { status: 500 }),
      req
    );
  }
}
