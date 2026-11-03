// src/app/api/erp/community/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateErpApiKey, erpUnauthorized, erpCorsOptions, withErpCors } from '@/lib/utils/erpAuth';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  return erpCorsOptions(req);
}

export async function GET(req: NextRequest) {
  try {
    if (!validateErpApiKey(req)) {
      return erpUnauthorized(req);
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              fullName: true,
              email: true,
              college: true,
              specialty: true,
              avatar: true,
              avatarType: true,
            },
          },
          likes: {
            select: { userId: true },
          },
          comments: {
            select: {
              id: true,
              text: true,
              authorId: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      prisma.post.count(),
    ]);

    const feed = posts.map((post) => ({
      id: post.id,
      content: post.content,
      contentAr: post.contentAr,
      mediaType: post.mediaType,
      mediaUrl: post.mediaUrl,
      fileName: post.fileName,
      author: {
        id: post.author.id,
        name: post.author.name,
        fullName: post.author.fullName,
        email: post.author.email,
        college: post.author.college,
        specialty: post.author.specialty,
        avatarType: post.author.avatarType,
      },
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      comments: post.comments.map((c) => ({
        id: c.id,
        text: c.text,
        author: c.author.name,
        authorEmail: c.author.email,
        authorId: c.authorId,
        createdAt: c.createdAt,
      })),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    return withErpCors(
      NextResponse.json({
        success: true,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        posts: feed,
      }),
      req
    );
  } catch (error) {
    console.error('ERP community GET error:', error);
    return withErpCors(
      NextResponse.json({ error: 'Failed to fetch community feed' }, { status: 500 }),
      req
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!validateErpApiKey(req)) {
      return erpUnauthorized(req);
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    const commentId = searchParams.get('commentId');

    if (!postId && !commentId) {
      return withErpCors(
        NextResponse.json(
          { error: 'Either postId or commentId query parameter is required for moderation deletion' },
          { status: 400 }
        ),
        req
      );
    }

    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true },
      });

      if (!post) {
        return withErpCors(
          NextResponse.json({ error: 'Post not found' }, { status: 404 }),
          req
        );
      }

      await prisma.post.delete({ where: { id: postId } });

      return withErpCors(
        NextResponse.json({
          success: true,
          message: `Post ${postId} deleted successfully by ERP moderation`,
          deletedPostId: postId,
        }),
        req
      );
    }

    if (commentId) {
      const comment = await prisma.postComment.findUnique({
        where: { id: commentId },
        select: { id: true },
      });

      if (!comment) {
        return withErpCors(
          NextResponse.json({ error: 'Comment not found' }, { status: 404 }),
          req
        );
      }

      await prisma.postComment.delete({ where: { id: commentId } });

      return withErpCors(
        NextResponse.json({
          success: true,
          message: `Comment ${commentId} deleted successfully by ERP moderation`,
          deletedCommentId: commentId,
        }),
        req
      );
    }
  } catch (error) {
    console.error('ERP community DELETE error:', error);
    return withErpCors(
      NextResponse.json({ error: 'Failed to perform community moderation deletion' }, { status: 500 }),
      req
    );
  }
}
