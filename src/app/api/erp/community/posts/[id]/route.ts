// src/app/api/erp/community/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateErpApiKey, erpUnauthorized, erpCorsOptions, withErpCors } from '@/lib/utils/erpAuth';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  return erpCorsOptions(req);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!validateErpApiKey(req)) {
      return erpUnauthorized(req);
    }

    const postId = params.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, content: true, authorId: true },
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
        message: `Post ${postId} deleted by ERP moderator`,
        deletedPostId: postId,
      }),
      req
    );
  } catch (error) {
    console.error('ERP delete post error:', error);
    return withErpCors(
      NextResponse.json({ error: 'Failed to delete post' }, { status: 500 }),
      req
    );
  }
}
