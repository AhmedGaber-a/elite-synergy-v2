// src/app/api/community/comments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    const comment = await prisma.postComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: 'التعليق غير موجود' }, { status: 404 });
    }

    // Strict ownership check — only the comment author can edit
    if (comment.authorId !== authUser.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بتعديل هذا التعليق' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'نص التعليق لا يمكن أن يكون فارغاً' }, { status: 400 });
    }

    const updatedComment = await prisma.postComment.update({
      where: { id: commentId },
      data: {
        text: text.trim(),
      },
      include: {
        author: true,
        reactions: {
          include: { user: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تعديل التعليق بنجاح',
      comment: updatedComment,
    });
  } catch (error) {
    console.error('Update comment error:', error);
    return NextResponse.json({ error: 'فشل تعديل التعليق' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    const comment = await prisma.postComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: 'التعليق غير موجود' }, { status: 404 });
    }

    // Strict ownership check — only the comment author can delete via this route
    if (comment.authorId !== authUser.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بحذف هذا التعليق' },
        { status: 403 }
      );
    }

    // Prisma cascades nested replies and reactions
    await prisma.postComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف التعليق بنجاح',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json({ error: 'فشل حذف التعليق' }, { status: 500 });
  }
}
