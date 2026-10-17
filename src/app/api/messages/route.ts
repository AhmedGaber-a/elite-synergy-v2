// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { formatArabicTimeAgo } from '@/lib/utils/timeAgo';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    // Verify user is participant
    const isParticipant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: authUser.id,
        },
      },
    });

    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: authUser.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            fullName: true,
            avatar: true,
            avatarType: true,
            role: true,
          },
        },
        sharedPost: {
          include: {
            author: {
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
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = messages.map((m) => {
      const times = formatArabicTimeAgo(m.createdAt);
      return {
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        sender: m.sender.name,
        senderFullName: m.sender.fullName,
        senderAvatar: m.sender.avatar || '',
        senderAvatarType: m.sender.avatarType,
        text: m.text,
        isMe: m.senderId === authUser.id,
        time: times.relative,
        timeAgoEn: times.timeAgoEn,
        exactDate: times.exact,
        createdAt: m.createdAt,
        sharedPost: m.sharedPost
          ? {
              id: m.sharedPost.id,
              authorId: m.sharedPost.authorId,
              author: m.sharedPost.author.name,
              authorAvatar: m.sharedPost.author.avatar || '',
              authorAvatarType: m.sharedPost.author.avatarType,
              content: m.sharedPost.content,
              mediaType: m.sharedPost.mediaType,
              mediaUrl: m.sharedPost.mediaUrl,
              fileName: m.sharedPost.fileName,
              fileUrl: m.sharedPost.fileUrl,
              createdAt: m.sharedPost.createdAt,
            }
          : null,
      };
    });

    return NextResponse.json({ messages: formatted });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, text, sharedPostId } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    const trimmedText = text ? text.trim() : '';
    if (!trimmedText && !sharedPostId) {
      return NextResponse.json({ error: 'Message text or shared post is required' }, { status: 400 });
    }

    // Verify conversation and participation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const isMember = conversation.participants.some((p) => p.userId === authUser.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Not a member of this conversation' }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: authUser.id,
        text: trimmedText || 'منشور تمت مشاركته',
        sharedPostId: sharedPostId || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            fullName: true,
            avatar: true,
            avatarType: true,
          },
        },
        sharedPost: {
          include: {
            author: {
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
        },
      },
    });

    // Update conversation last message timestamp & text
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: trimmedText || 'منشور تمت مشاركته',
        lastMessageAt: new Date(),
      },
    });

    // Notify other participants
    const otherParticipants = conversation.participants.filter((p) => p.userId !== authUser.id);
    for (const p of otherParticipants) {
      await prisma.notification.create({
        data: {
          userId: p.userId,
          senderId: authUser.id,
          category: conversation.category === 'practical' ? 'practical' : 'peers',
          title: `رسالة جديدة من ${authUser.name}`,
          message: trimmedText || 'شارك معك منشوراً في المحادثة',
          messageAr: trimmedText || 'شارك معك منشوراً في المحادثة',
          actionUrl: `/messages?id=${conversationId}`,
        },
      });
    }

    const times = formatArabicTimeAgo(message.createdAt);

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        sender: message.sender.name,
        senderFullName: message.sender.fullName,
        senderAvatar: message.sender.avatar || '',
        senderAvatarType: message.sender.avatarType,
        text: message.text,
        isMe: true,
        time: times.relative,
        timeAgoEn: times.timeAgoEn,
        exactDate: times.exact,
        createdAt: message.createdAt,
        sharedPost: message.sharedPost
          ? {
              id: message.sharedPost.id,
              authorId: message.sharedPost.authorId,
              author: message.sharedPost.author.name,
              authorAvatar: message.sharedPost.author.avatar || '',
              authorAvatarType: message.sharedPost.author.avatarType,
              content: message.sharedPost.content,
              mediaType: message.sharedPost.mediaType,
              mediaUrl: message.sharedPost.mediaUrl,
              fileName: message.sharedPost.fileName,
              fileUrl: message.sharedPost.fileUrl,
              createdAt: message.sharedPost.createdAt,
            }
          : null,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
