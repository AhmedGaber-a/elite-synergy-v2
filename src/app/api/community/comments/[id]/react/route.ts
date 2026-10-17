// src/app/api/community/comments/[id]/react/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

const VALID_REACTIONS = ['👍', '❤️', '🔥', '👏'];

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً للتفاعل' }, { status: 401 });
    }

    const body = await req.json();
    const { type } = body;

    if (!type || !VALID_REACTIONS.includes(type)) {
      return NextResponse.json(
        { error: 'نوع التفاعل غير صالح. التفاعلات المدعومة: 👍, ❤️, 🔥, 👏' },
        { status: 400 }
      );
    }

    const comment = await prisma.postComment.findUnique({
      where: { id: commentId },
      include: { author: true },
    });

    if (!comment) {
      return NextResponse.json({ error: 'التعليق غير موجود' }, { status: 404 });
    }

    // Check if user already reacted to this comment
    const existing = await prisma.commentReaction.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId: authUser.id,
        },
      },
    });

    let currentReaction: string | null = null;

    if (existing) {
      if (existing.type === type) {
        // Toggle off if same reaction clicked
        await prisma.commentReaction.delete({
          where: { id: existing.id },
        });
        currentReaction = null;
      } else {
        // Update to new reaction type
        await prisma.commentReaction.update({
          where: { id: existing.id },
          data: { type },
        });
        currentReaction = type;
      }
    } else {
      // Create new reaction
      await prisma.commentReaction.create({
        data: {
          commentId,
          userId: authUser.id,
          type,
        },
      });
      currentReaction = type;

      // Create notification if reactor is not the comment author
      if (comment.authorId !== authUser.id) {
        await prisma.notification.create({
          data: {
            userId: comment.authorId,
            senderId: authUser.id,
            category: 'community',
            title: 'تفاعل جديد على تعليقك',
            message: `${authUser.name} تفاعل بـ ${type} على تعليقك: "${comment.text.slice(0, 40)}..."`,
            messageAr: `${authUser.name} تفاعل بـ ${type} على تعليقك: "${comment.text.slice(0, 40)}..."`,
            actionUrl: `/community#post-${comment.postId}`,
          },
        });
      }
    }

    // Fetch updated reactions count & breakdown
    const allReactions = await prisma.commentReaction.findMany({
      where: { commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Group by emoji
    const reactionCounts: Record<string, number> = {
      '👍': 0,
      '❤️': 0,
      '🔥': 0,
      '👏': 0,
    };

    allReactions.forEach((r) => {
      if (reactionCounts[r.type] !== undefined) {
        reactionCounts[r.type]++;
      }
    });

    return NextResponse.json({
      success: true,
      currentReaction,
      totalCount: allReactions.length,
      counts: reactionCounts,
      reactions: allReactions.map((r) => ({
        id: r.id,
        type: r.type,
        userId: r.userId,
        userName: r.user.name,
      })),
    });
  } catch (error) {
    console.error('Comment reaction error:', error);
    return NextResponse.json({ error: 'Failed to process reaction' }, { status: 500 });
  }
}
