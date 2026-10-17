// src/app/api/community/posts/[id]/like/route.ts
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
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً للإعجاب' }, { status: 401 });
    }
    const userId = authUser.id;

    const existing = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    let liked = false;
    if (existing) {
      await prisma.postLike.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
      liked = false;
    } else {
      await prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      });
      liked = true;
    }

    const totalLikes = await prisma.postLike.count({ where: { postId } });

    return NextResponse.json({ success: true, liked, count: totalLikes });
  } catch (error) {
    console.error('Toggle like error:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
