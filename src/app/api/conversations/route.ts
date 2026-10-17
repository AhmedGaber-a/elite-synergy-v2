// src/app/api/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { formatArabicTimeAgo } from '@/lib/utils/timeAgo';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ conversations: [] });
    }

    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get('category'); // 'peers' | 'practical' | null

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: authUser.id },
        },
        ...(categoryParam ? { category: categoryParam } : {}),
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                fullName: true,
                avatar: true,
                avatarType: true,
                role: true,
                college: true,
                specialty: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    const formatted = conversations.map((conv) => {
      const otherParticipant = conv.participants.find((p) => p.userId !== authUser.id)?.user;
      const isGroup = conv.isGroup;
      const times = formatArabicTimeAgo(conv.lastMessageAt || conv.createdAt);

      const title = isGroup
        ? conv.name || 'مجموعة عمل تطبيقية'
        : otherParticipant?.fullName || otherParticipant?.name || 'محادثة أكاديمية';

      const role = isGroup
        ? conv.role || 'Project Workspace'
        : otherParticipant?.specialty || otherParticipant?.college || 'Student';

      const avatar = isGroup
        ? ''
        : otherParticipant?.avatar || '';

      const avatarType = isGroup
        ? conv.avatarType || 'male'
        : otherParticipant?.avatarType || 'male';

      const latestMsg = conv.messages[0];

      return {
        id: conv.id,
        name: title,
        role,
        avatar,
        avatarType,
        isGroup,
        category: conv.category || (isGroup ? 'practical' : 'peers'),
        projectId: conv.projectId,
        teamId: conv.teamId,
        lastMessage: latestMsg?.text || conv.lastMessage || 'بدأت المحادثة',
        time: times.relative,
        timeAgoEn: times.timeAgoEn,
        exactDate: times.exact,
        unread: latestMsg ? (!latestMsg.isRead && latestMsg.senderId !== authUser.id ? 1 : 0) : 0,
        otherUserId: otherParticipant?.id || null,
        otherUser: otherParticipant || null,
      };
    });

    return NextResponse.json({ conversations: formatted });
  } catch (error) {
    console.error('Fetch conversations error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { peerId, projectId, teamId, category = 'peers', name, role } = body;

    // Case 1: 1-on-1 Peer Chat
    if (peerId) {
      if (peerId === authUser.id) {
        return NextResponse.json({ error: 'Cannot chat with yourself' }, { status: 400 });
      }

      // Check if conversation already exists between these 2 users
      const existingConv = await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: {
              userId: { in: [authUser.id, peerId] },
            },
          },
        },
        include: {
          participants: {
            include: { user: true },
          },
        },
      });

      if (existingConv && existingConv.participants.length === 2) {
        return NextResponse.json({ success: true, conversationId: existingConv.id });
      }

      // Create new peer conversation
      const newConv = await prisma.conversation.create({
        data: {
          isGroup: false,
          category: 'peers',
          participants: {
            create: [
              { userId: authUser.id },
              { userId: peerId },
            ],
          },
        },
      });

      return NextResponse.json({ success: true, conversationId: newConv.id }, { status: 201 });
    }

    // Case 2: Project / Practical Group Workspace
    if (projectId || teamId) {
      const existingProjectConv = await prisma.conversation.findFirst({
        where: {
          isGroup: true,
          OR: [
            projectId ? { projectId } : {},
            teamId ? { teamId } : {},
          ],
        },
      });

      if (existingProjectConv) {
        // Ensure authUser is participant
        await prisma.conversationParticipant.upsert({
          where: {
            conversationId_userId: {
              conversationId: existingProjectConv.id,
              userId: authUser.id,
            },
          },
          create: {
            conversationId: existingProjectConv.id,
            userId: authUser.id,
          },
          update: {},
        });
        return NextResponse.json({ success: true, conversationId: existingProjectConv.id });
      }

      // Create new group conversation
      const newGroup = await prisma.conversation.create({
        data: {
          name: name || 'Project Workspace',
          isGroup: true,
          category: 'practical',
          projectId: projectId || null,
          teamId: teamId || null,
          role: role || 'Academic Team Space',
          participants: {
            create: [{ userId: authUser.id }],
          },
        },
      });

      return NextResponse.json({ success: true, conversationId: newGroup.id }, { status: 201 });
    }

    return NextResponse.json({ error: 'peerId or projectId required' }, { status: 400 });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
