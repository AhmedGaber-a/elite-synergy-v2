// src/app/api/teams/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamParam = params.id;
    const authUser = await getAuthUser(req);
    const currentUserId = authUser?.id;

    // Search by slug first (e.g. 'alpha', 'gamma') or by cuid id
    const team = await prisma.team.findFirst({
      where: {
        OR: [{ slug: teamParam }, { id: teamParam }],
      },
      include: {
        project: true,
        members: {
          include: {
            user: true,
          },
          orderBy: { joinedAt: 'asc' },
        },
        messages: {
          include: {
            user: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        files: {
          include: {
            uploadedBy: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const members = team.members.map((m) => ({
      userId: m.userId,
      name: m.user.name,
      fullName: m.user.fullName,
      role: m.role,
      avatar: m.user.avatar || '',
      avatarType: m.user.avatarType,
      domain: m.domain,
      online: m.online,
    }));

    const messages = team.messages.map((msg) => ({
      id: msg.id,
      author: msg.user.name,
      authorAvatarType: msg.user.avatarType,
      text: msg.text,
      time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: currentUserId ? msg.userId === currentUserId : false,
    }));

    const files = team.files.map((file) => ({
      id: file.id,
      name: file.name,
      size: file.size,
      uploadedBy: file.uploadedBy.name,
      time: new Date(file.createdAt).toLocaleDateString(),
      type: file.type,
      url: file.url,
    }));

    return NextResponse.json({
      id: team.slug || team.id,
      dbId: team.id,
      name: team.name,
      emoji: team.emoji,
      slots: team.slots,
      maxSlots: team.maxSlots,
      level: team.level,
      goal: team.goal,
      project: team.project,
      isMyTeam: currentUserId ? team.members.some((m) => m.userId === currentUserId) : false,
      members,
      messages,
      files,
    });
  } catch (error) {
    console.error('Fetch team details error:', error);
    return NextResponse.json({ error: 'Failed to fetch team details' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    const team = await prisma.team.findFirst({
      where: {
        OR: [{ slug: params.id }, { id: params.id }],
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'الفريق غير موجود' }, { status: 404 });
    }

    const body = await req.json();
    const { action, text, role = 'Software Engineer', domain = 'Engineering', fileName, fileSize, fileType, fileUrl } = body;

    // Security check: Only enrolled team members can post messages or upload files in this team workspace
    if (action !== 'join') {
      const isMember = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: team.id,
            userId: authUser.id,
          },
        },
      });

      if (!isMember) {
        return NextResponse.json(
          { error: 'عذراً، يجب أن تكون عضواً في هذا الفريق للمشاركة في المحادثة أو رفع الملفات.' },
          { status: 403 }
        );
      }
    }

    // Action 1: Post a message in the team chat
    if (action === 'message' || text) {
      const message = await prisma.teamMessage.create({
        data: {
          teamId: team.id,
          userId: authUser.id,
          text: (text || '').trim(),
        },
        include: {
          user: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: {
          id: message.id,
          author: message.user.name,
          text: message.text,
          time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
        },
      });
    }

    // Action 2: Join team with atomic concurrency transaction
    if (action === 'join') {
      const result = await prisma.$transaction(async (tx) => {
        const freshTeam = await tx.team.findUnique({
          where: { id: team.id },
          include: { members: true },
        });

        if (!freshTeam) throw new Error('الفريق غير موجود');

        if (freshTeam.members.some((m) => m.userId === authUser.id)) {
          throw new Error('أنت عضو بالفعل في هذا الفريق');
        }

        // Check if student is already in another team under the same project
        if (freshTeam.projectId) {
          const existingProjectMembership = await tx.teamMember.findFirst({
            where: {
              userId: authUser.id,
              team: {
                projectId: freshTeam.projectId,
              },
            },
          });
          if (existingProjectMembership) {
            throw new Error('أنت مسجل بالفعل في فريق عمل ضمن هذا المشروع الأكاديمي');
          }
        }

        if (freshTeam.slots <= 0 || freshTeam.members.length >= freshTeam.maxSlots) {
          throw new Error('عذراً، هذا الفريق مكتمل بالكامل');
        }

        const decrementResult = await tx.team.updateMany({
          where: {
            id: freshTeam.id,
            slots: { gt: 0 },
          },
          data: {
            slots: { decrement: 1 },
          },
        });

        if (decrementResult.count === 0) {
          throw new Error('عذراً، هذا الفريق مكتمل بالكامل');
        }

        const newMember = await tx.teamMember.create({
          data: {
            teamId: freshTeam.id,
            userId: authUser.id,
            role,
            domain,
            online: true,
          },
        });

        const updated = await tx.team.findUnique({
          where: { id: freshTeam.id },
          include: { members: { include: { user: true } } },
        });

        return { member: newMember, team: updated };
      });

      return NextResponse.json({
        success: true,
        message: 'تم الانضمام إلى الفريق بنجاح!',
        result,
      });
    }

    // Action 3: Upload Deliverable (TeamFile)
    if (action === 'file') {
      if (!fileName) {
        return NextResponse.json({ error: 'اسم الملف مطلوب' }, { status: 400 });
      }

      const file = await prisma.teamFile.create({
        data: {
          teamId: team.id,
          uploadedById: authUser.id,
          name: fileName,
          size: fileSize || '1.5 MB',
          type: fileType || 'pdf',
          url: fileUrl || null,
        },
        include: {
          uploadedBy: true,
        },
      });

      return NextResponse.json({
        success: true,
        file: {
          id: file.id,
          name: file.name,
          size: file.size,
          uploadedBy: file.uploadedBy.name,
          time: 'الآن',
          type: file.type,
          url: file.url,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل تنفيذ الإجراء';
    console.error('Team action error:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
