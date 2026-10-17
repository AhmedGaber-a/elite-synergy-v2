// src/app/api/community/posts/[id]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً للتعليق' }, { status: 401 });
    }
    const authorId = authUser.id;

    const body = await req.json();
    const { text, textAr, commentId } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
    }

    // If commentId is provided, this is a nested Reply to an existing comment
    if (commentId) {
      const reply = await prisma.commentReply.create({
        data: {
          commentId,
          authorId,
          text: text.trim(),
          textAr: textAr ? textAr.trim() : null,
        },
        include: {
          author: true,
        },
      });

      return NextResponse.json({
        success: true,
        reply: {
          id: reply.id,
          author: reply.author.name,
          authorAvatar: reply.author.avatar || '',
          authorAvatarType: reply.author.avatarType,
          text: reply.text,
          textAr: reply.textAr,
        },
      });
    }

    // Otherwise, it's a top-level comment on the post
    const comment = await prisma.postComment.create({
      data: {
        postId,
        authorId,
        text: text.trim(),
        textAr: textAr ? textAr.trim() : null,
      },
      include: {
        author: true,
      },
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        author: comment.author.name,
        authorAvatar: comment.author.avatar || '',
        authorAvatarType: comment.author.avatarType,
        text: comment.text,
        textAr: comment.textAr,
        timeAgo: 'Just now',
        replies: [],
      },
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
