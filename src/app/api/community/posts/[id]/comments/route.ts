import { hourAgo, tooMany } from '@/lib/services/limits';
// src/app/api/community/posts/[id]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { canUseCommunity } from '@/lib/departments';
import { formatArabicTimeAgo } from '@/lib/utils/timeAgo';
import { PUBLIC_USER_SELECT } from '@/lib/services/publicUser';
import { validateTextContent } from '@/lib/utils/sanitize';

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
    const recentComments = await prisma.postComment.count({ where: { authorId, createdAt: { gte: hourAgo() } } });
    if (recentComments >= 60) return tooMany('وصلت للحد المسموح من التعليقات في الساعة، حاول بعدين');

    const body = await req.json();
    const { text, textAr, commentId, parentId } = body;

    // Validate and sanitize comment text: max 2000 chars, required
    const textValidation = validateTextContent(text, {
      maxLength: 2000,
      required: true,
      fieldName: 'نص التعليق',
    });

    if (!textValidation.valid) {
      return NextResponse.json({ error: textValidation.error }, { status: 400 });
    }

    let sanitizedTextAr: string | null = null;
    if (textAr !== undefined && textAr !== null && typeof textAr === 'string' && textAr.trim()) {
      const arValidation = validateTextContent(textAr, {
        maxLength: 2000,
        required: false,
        fieldName: 'النص العربي للتعليق',
      });
      if (!arValidation.valid) {
        return NextResponse.json({ error: arValidation.error }, { status: 400 });
      }
      sanitizedTextAr = arValidation.sanitized;
    }

    const trimmedText = textValidation.sanitized;
    const effectiveParentId = parentId || commentId || null;

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, content: true, community: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
    }
    if (!canUseCommunity(authUser.college, post.community)) {
      return NextResponse.json({ error: 'هذا المنشور في مجتمع قسم آخر' }, { status: 403 });
    }

    // If parentId/commentId is provided, this is a nested Reply
    if (effectiveParentId) {
      const parentComment = await prisma.postComment.findUnique({
        where: { id: effectiveParentId },
        include: { author: { select: PUBLIC_USER_SELECT } },
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
          textAr: sanitizedTextAr,
          parentId: effectiveParentId,
        },
        include: {
          author: { select: PUBLIC_USER_SELECT },
          reactions: {
            include: { user: { select: PUBLIC_USER_SELECT } },
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
        textAr: sanitizedTextAr,
      },
      include: {
        author: { select: PUBLIC_USER_SELECT },
        reactions: {
          include: { user: { select: PUBLIC_USER_SELECT } },
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('commentId') || searchParams.get('id');
    if (!commentId) {
      return NextResponse.json({ error: 'معرف التعليق مطلوب' }, { status: 400 });
    }

    const comment = await prisma.postComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.postId !== params.id) {
      return NextResponse.json({ error: 'التعليق غير موجود' }, { status: 404 });
    }

    // Only comment author or ADMIN can delete
    if (comment.authorId !== authUser.id && authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بحذف هذا التعليق' }, { status: 403 });
    }

    await prisma.postComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true, message: 'تم حذف التعليق بنجاح' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json({ error: 'فشل حذف التعليق' }, { status: 500 });
  }
}
