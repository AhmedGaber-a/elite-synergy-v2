// src/app/api/teams/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const currentUserId = authUser?.id;
    const { searchParams } = new URL(req.url);
    const projectIdParam = searchParams.get('projectId');

    const teams = await prisma.team.findMany({
      where: projectIdParam
        ? {
            OR: [
              { projectId: projectIdParam },
              { project: { slug: projectIdParam } },
            ],
          }
        : {},
      include: {
        project: true,
        members: {
          include: {
            user: true,
          },
        },
        files: {
          include: {
            uploadedBy: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedTeams = teams.map((team) => {
      const memberNames = team.members.map((m) => m.user.name);
      const isMyTeam = currentUserId ? team.members.some((m) => m.userId === currentUserId) : false;

      return {
        id: team.slug || team.id,
        dbId: team.id,
        slug: team.slug,
        name: team.name,
        emoji: team.emoji,
        slots: team.slots,
        maxSlots: team.maxSlots,
        level: team.level,
        goal: team.goal || '',
        members: memberNames,
        isMyTeam,
        project: team.project
          ? {
              id: team.project.id,
              slug: team.project.slug,
              title: team.project.title,
              domain: team.project.domain,
              isMega: team.project.isMega,
              maxTeams: team.project.maxTeams,
            }
          : null,
        memberDetails: team.members.map((m) => ({
          userId: m.userId,
          name: m.user.name,
          fullName: m.user.fullName,
          role: m.role,
          domain: m.domain,
          online: m.online,
          avatarType: m.user.avatarType,
        })),
        filesCount: team.files.length,
      };
    });

    return NextResponse.json(formattedTeams);
  } catch (error) {
    console.error('Fetch teams error:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً لإنشاء فريق' }, { status: 401 });
    }

    const body = await req.json();
    const { name, emoji = '🚀', goal, projectId, level = 'All Levels' } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'اسم الفريق مطلوب' }, { status: 400 });
    }

    // STRICT RULE: Teams CANNOT be created as standalone/random groups.
    // A team MUST be created specifically inside a Professor's TEAM project.
    if (!projectId) {
      return NextResponse.json(
        { error: 'يجب اختيار مشروع أكاديمي تابع لأستاذ المادة لإنشاء الفريق داخله' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: {
          OR: [{ id: projectId }, { slug: projectId }],
        },
        include: {
          teams: true,
        },
      });

      if (!project) {
        throw new Error('المشروع الأكاديمي غير موجود');
      }

      if (project.type !== 'TEAM') {
        throw new Error('هذا المشروع فردي (SOLO) ولا يسمح بإنشاء فرق عمل داخله.');
      }

      // STRICT RULE: Decrementing available team count and enforcing maxTeams limit
      const currentTeamsCount = project.teams.length;
      if (currentTeamsCount >= project.maxTeams) {
        throw new Error(`عذراً، اكتمل الحد الأقصى لعدد الفرق المسموح بها في هذا المشروع (${project.maxTeams} فرق).`);
      }

      // Check if student is already in a team under this project
      const existingMembership = await tx.teamMember.findFirst({
        where: {
          userId: authUser.id,
          team: {
            projectId: project.id,
          },
        },
      });

      if (existingMembership) {
        throw new Error('أنت مسجل بالفعل في فريق عمل ضمن هذا المشروع الأكاديمي.');
      }

      const slug = `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Math.random().toString(36).substring(2, 6)}`;
      const teamSlots = project.maxSlots || 11;

      const newTeam = await tx.team.create({
        data: {
          name: name.trim(),
          slug,
          emoji,
          maxSlots: teamSlots,
          slots: Math.max(0, teamSlots - 1),
          goal: goal || '',
          projectId: project.id,
          level,
          members: {
            create: {
              userId: authUser.id,
              role: 'Team Lead',
              domain: 'Engineering',
              online: true,
            },
          },
        },
        include: {
          members: {
            include: { user: true },
          },
          project: true,
        },
      });

      const newAvailableTeams = Math.max(0, project.maxTeams - (currentTeamsCount + 1));

      return {
        team: newTeam,
        availableTeamsCount: newAvailableTeams,
      };
    });

    return NextResponse.json(
      {
        success: true,
        team: result.team,
        availableTeamsCount: result.availableTeamsCount,
        message: `تم إنشاء الفريق بنجاح! الشواغر المتبقية للفرق: ${result.availableTeamsCount}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
