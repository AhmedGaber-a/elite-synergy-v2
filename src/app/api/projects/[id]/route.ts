// src/app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectParam = params.id;
    const authUser = await getAuthUser(req);
    const currentUserId = authUser?.id;

    // Search project by slug or cuid id
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ slug: projectParam }, { id: projectParam }],
      },
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
                    avatar: true,
                    avatarType: true,
                    college: true,
                    specialty: true,
                  },
                },
              },
              orderBy: { joinedAt: 'asc' },
            },
            messages: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                    avatarType: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
            files: {
              include: {
                uploadedBy: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        soloSubmissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                fullName: true,
                avatar: true,
                avatarType: true,
                college: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const availableTeamsCount = Math.max(0, project.maxTeams - project.teams.length);

    // Identify user's team under this project
    let myTeam = null;
    if (currentUserId && project.type === 'TEAM') {
      const found = project.teams.find((t) =>
        t.members.some((m) => m.userId === currentUserId)
      );
      if (found) {
        myTeam = {
          id: found.slug || found.id,
          dbId: found.id,
          slug: found.slug,
          name: found.name,
          emoji: found.emoji,
          slots: found.slots,
          maxSlots: found.maxSlots,
          level: found.level,
          goal: found.goal,
          isLead: found.members.some(
            (m) => m.userId === currentUserId && m.role.toLowerCase().includes('lead')
          ),
          members: found.members.map((m) => ({
            userId: m.userId,
            name: m.user.name,
            fullName: m.user.fullName,
            role: m.role,
            domain: m.domain,
            online: m.online,
            avatar: m.user.avatar || '',
            avatarType: m.user.avatarType,
          })),
          messages: found.messages.map((msg) => ({
            id: msg.id,
            author: msg.user.name,
            authorAvatar: msg.user.avatar || '',
            authorAvatarType: msg.user.avatarType,
            text: msg.text,
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: currentUserId ? msg.userId === currentUserId : false,
          })),
          files: found.files.map((file) => ({
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
            url: file.url,
            uploadedBy: file.uploadedBy.name,
            time: new Date(file.createdAt).toLocaleDateString(),
            isMe: currentUserId ? file.uploadedById === currentUserId : false,
          })),
        };
      }
    }

    // Filter user's solo submissions
    const userSubmissions = currentUserId
      ? project.soloSubmissions.filter((s) => s.userId === currentUserId)
      : [];

    return NextResponse.json({
      project: {
        id: project.id,
        slug: project.slug,
        title: project.title,
        description: project.description,
        type: project.type,
        maxTeams: project.maxTeams,
        teamsCount: project.teams.length,
        availableTeamsCount,
        domain: project.domain,
        forStudents: project.forStudents,
        level: project.level,
        doctor: project.doctor,
        score: project.score,
        completionTime: project.completionTime,
        maxSlots: project.maxSlots,
        isMega: project.isMega,
        phases: project.phases,
        companyBackground: project.companyBackground,
        businessProblem: project.businessProblem,
        relevantData: project.relevantData,
        tasksToSolve: project.tasksToSolve,
        expectedDeliverables: project.expectedDeliverables,
        illustration: project.illustration,
        category: project.category,
      },
      teams: project.teams.map((t) => ({
        id: t.slug || t.id,
        dbId: t.id,
        slug: t.slug,
        name: t.name,
        emoji: t.emoji,
        slots: t.slots,
        maxSlots: t.maxSlots,
        level: t.level,
        goal: t.goal,
        isMyTeam: currentUserId ? t.members.some((m) => m.userId === currentUserId) : false,
        membersCount: t.members.length,
        members: t.members.map((m) => ({
          userId: m.userId,
          name: m.user.name,
          role: m.role,
          avatar: m.user.avatar || '',
          avatarType: m.user.avatarType,
        })),
        filesCount: t.files.length,
      })),
      myTeam,
      mySubmissions: userSubmissions.map((s) => ({
        id: s.id,
        name: s.name,
        size: s.size,
        type: s.type,
        url: s.url,
        notes: s.notes,
        createdAt: s.createdAt,
      })),
      allSubmissionsCount: project.soloSubmissions.length,
    });
  } catch (error) {
    console.error('Fetch project detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch project detail' }, { status: 500 });
  }
}
