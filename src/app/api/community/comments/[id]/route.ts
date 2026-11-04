// src/app/api/community/comments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    const comment = await prisma.postComment.findUnique({
      where: { id: params.id },
    });

    if (!comment) {
      return NextResponse.json({ error: 'التعليق غير موجود' }, { status: 404 });
    }

    // Only comment author or ADMIN can delete
    if (comment.authorId !== authUser.id && authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بحذف هذا التعليق' }, { status: 403 });
    }

    await prisma.postComment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'تم حذف التعليق بنجاح' });
  } catch (error) {
    console.error('Delete community comment error:', error);
    return NextResponse.json({ error: 'فشل حذف التعليق' }, { status: 500 });
  }
}
