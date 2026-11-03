// src/app/api/erp/community/comments/[id]/route.ts
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

    const commentId = params.id;

    const comment = await prisma.postComment.findUnique({
      where: { id: commentId },
      select: { id: true, text: true, authorId: true },
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
        message: `Comment ${commentId} deleted by ERP moderator`,
        deletedCommentId: commentId,
      }),
      req
    );
  } catch (error) {
    console.error('ERP delete comment error:', error);
    return withErpCors(
      NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 }),
      req
    );
  }
}
