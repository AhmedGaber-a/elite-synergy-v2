// src/app/api/community/posts/[id]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { formatArabicTimeAgo } from '@/lib/utils/timeAgo';

export const dynamic = 'force-dynamic';

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
    const { text, textAr, commentId, parentId } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'نص التعليق مطلوب' }, { status: 400 });
    }

    const trimmedText = text.trim();
    const effectiveParentId = parentId || commentId || null;

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, content: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
    }

    // If parentId/commentId is provided, this is a nested Reply
    if (effectiveParentId) {
      const parentComment = await prisma.postComment.findUnique({
        where: { id: effectiveParentId },
        include: { author: true },
      });

      if (!parentComment) {
        return NextResponse.json({ error: 'التعليق الأصلي غير موجود' }, { status: 404 });
      }

      // Create nested comment reply with parentId
      const reply = await prisma.postComment.create({
        data: {
          postId,
          authorId,
          text: trimmedText,
          textAr: textAr ? textAr.trim() : null,
          parentId: effectiveParentId,
        },
        include: {
          author: true,
          reactions: {
            include: { user: true },
          },
        },
      });

      // Send notification to the parent comment's author
      if (parentComment.authorId !== authorId) {
        await prisma.notification.create({
          data: {
            userId: parentComment.authorId,
            senderId: authorId,
            category: 'community',
            title: 'رد جديد على تعليقك',
            message: `${authUser.name} رد على تعليقك: "${trimmedText.slice(0, 50)}..."`,
            messageAr: `${authUser.name} رد على تعليقك: "${trimmedText.slice(0, 50)}..."`,
            actionUrl: `/community#post-${postId}`,
          },
        });
      }

      const times = formatArabicTimeAgo(reply.createdAt);

      return NextResponse.json({
        success: true,
        reply: {
          id: reply.id,
          postId: reply.postId,
          parentId: reply.parentId,
          authorId: reply.authorId,
          author: reply.author.name,
          authorAvatar: reply.author.avatar || '',
          authorAvatarType: reply.author.avatarType,
          text: reply.text,
          textAr: reply.textAr,
          timeAgo: times.timeAgoEn,
          timeAgoAr: times.relative,
          exactDate: times.exact,
          createdAt: reply.createdAt,
          reactions: [],
        },
      });
    }

    // Otherwise, top-level comment
    const comment = await prisma.postComment.create({
      data: {
        postId,
        authorId,
        text: trimmedText,
        textAr: textAr ? textAr.trim() : null,
      },
      include: {
        author: true,
        reactions: {
          include: { user: true },
        },
      },
    });

    // Notify post author if not self
    if (post.authorId !== authorId) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          senderId: authorId,
          category: 'community',
          title: 'تعليق جديد على منشورك',
          message: `${authUser.name} علّق على منشورك: "${trimmedText.slice(0, 50)}..."`,
          messageAr: `${authUser.name} علّق على منشورك: "${trimmedText.slice(0, 50)}..."`,
          actionUrl: `/community#post-${postId}`,
        },
      });
    }

    const times = formatArabicTimeAgo(comment.createdAt);

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        author: comment.author.name,
        authorAvatar: comment.author.avatar || '',
        authorAvatarType: comment.author.avatarType,
        text: comment.text,
        textAr: comment.textAr,
        timeAgo: times.timeAgoEn,
        timeAgoAr: times.relative,
        exactDate: times.exact,
        createdAt: comment.createdAt,
        reactions: [],
        replies: [],
      },
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ error: 'فشل إضافة التعليق' }, { status: 500 });
  }
}
