// src/app/api/teams/join/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { PUBLIC_USER_SELECT } from '@/lib/services/publicUser';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً للانضمام إلى الفريق' }, { status: 401 });
    }

    const body = await req.json();
    const { teamId, teamSlug, role = 'Software Engineer', domain = 'Engineering' } = body;

    const identifier = teamId || teamSlug;
    if (!identifier) {
      return NextResponse.json({ error: 'Team identifier is required' }, { status: 400 });
    }

    // Execute atomic team join transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Locate team by ID or slug
      const team = await tx.team.findFirst({
        where: {
          OR: [{ id: identifier }, { slug: identifier }],
        },
        include: {
          members: true,
        },
      });

      if (!team) {
        throw new Error('الفريق غير موجود');
      }

      // 2. Prevent joining the same team twice
      const isAlreadyMember = team.members.some((m) => m.userId === authUser.id);
      const existingTeamMembership = await tx.teamMember.findFirst({
        where: { teamId: team.id, userId: authUser.id },
      });
      if (isAlreadyMember || existingTeamMembership) {
        throw new Error('أنت عضو بالفعل في هذا الفريق');
      }

      // 2a. One active project at a time: must submit the current team first
      const activeTeam = await tx.teamMember.findFirst({
        where: { userId: authUser.id, team: { submissions: { none: {} } } },
        select: { id: true },
      });
      if (activeTeam) {
        throw new Error('انت في مشروع شغال حالياً. لازم تسلّمه الأول قبل ما تنضم لفريق تاني');
      }

      // 2b. Prevent joining multiple teams within the exact same project
      if (team.projectId) {
        const existingProjectMembership = await tx.teamMember.findFirst({
          where: {
            userId: authUser.id,
            team: {
              projectId: team.projectId,
            },
          },
        });
        if (existingProjectMembership) {
          throw new Error('أنت مسجل بالفعل في فريق عمل ضمن هذا المشروع الأكاديمي');
        }
      }

      // 3. Automated slot control: prevent joining if full (slots <= 0 or members >= maxSlots)
      const currentMembersCount = await tx.teamMember.count({
        where: { teamId: team.id },
      });

      if (team.slots <= 0 || currentMembersCount >= team.maxSlots || team.members.length >= team.maxSlots) {
        throw new Error('عذراً، هذا الفريق مكتمل بالكامل ولا توجد أماكن شاغرة');
      }

      const decrementResult = await tx.team.updateMany({
        where: {
          id: team.id,
          slots: { gt: 0 },
        },
        data: {
          slots: { decrement: 1 },
        },
      });

      if (decrementResult.count === 0) {
        throw new Error('عذراً، هذا الفريق مكتمل بالكامل ولا توجد أماكن شاغرة');
      }

      // 4. Add the student as a team member
      const member = await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId: authUser.id,
          role,
          domain,
          online: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              fullName: true,
              avatarType: true,
              avatar: true,
            },
          },
        },
      });

      const updatedTeam = await tx.team.findUnique({
        where: { id: team.id },
        include: {
          members: {
            include: {
              user: { select: PUBLIC_USER_SELECT },
            },
          },
        },
      });

      return { member, team: updatedTeam };
    });

    return NextResponse.json({
      success: true,
      message: 'تم الانضمام إلى الفريق بنجاح!',
      team: result.team,
      member: result.member,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل الانضمام إلى الفريق';
    console.error('Join team transaction error:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
