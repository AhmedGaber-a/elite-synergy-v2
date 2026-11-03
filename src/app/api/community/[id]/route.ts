// src/app/api/community/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

// Files are uploaded straight to Vercel Blob by the browser; the server only stores their URLs.
// A base64 payload means the client skipped the upload, so it is refused here.
function hasInlineData(...urls: (string | null | undefined)[]): boolean {
  return urls.some((u) => typeof u === 'string' && (u.startsWith('data:') || u.startsWith('blob:')));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: { author: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
    }

    if (post.authorId !== authUser.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بتعديل هذا المنشور. التعديل متاح فقط لصاحب المنشور.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const content = body.content !== undefined ? body.content : body.text;
    const contentAr = body.contentAr !== undefined ? body.contentAr : undefined;
    let mediaType = body.mediaType !== undefined ? body.mediaType : undefined;
    let mediaUrl = body.mediaUrl !== undefined ? body.mediaUrl : undefined;
    let fileName = body.fileName !== undefined ? body.fileName : undefined;
    let fileUrl = body.fileUrl !== undefined ? body.fileUrl : undefined;

    const hasMedia = Boolean(mediaUrl !== undefined ? mediaUrl : (post.mediaUrl || post.fileUrl));
    const finalContent = content !== undefined ? (typeof content === 'string' ? content.trim() : '') : post.content;
    const hasContent = Boolean(finalContent && finalContent.trim());

    if (!hasContent && !hasMedia) {
      return NextResponse.json({ error: 'محتوى المنشور لا يمكن أن يكون فارغاً بدون مرفق' }, { status: 400 });
    }

    if (hasInlineData(mediaUrl, fileUrl)) {
      return NextResponse.json({ error: 'ارفع الملف أولاً ثم انشر المنشور' }, { status: 400 });
    }

    if (mediaType === 'file' && !fileUrl && mediaUrl) {
      fileUrl = mediaUrl;
    }

    const updated = await prisma.post.update({
      where: { id: params.id },
      data: {
        content: content !== undefined ? (typeof content === 'string' ? content.trim() : '') : undefined,
        contentAr: contentAr !== undefined ? (contentAr ? contentAr.trim() : null) : undefined,
        mediaType: mediaType !== undefined ? mediaType : undefined,
        mediaUrl: mediaUrl !== undefined ? mediaUrl : undefined,
        fileName: fileName !== undefined ? fileName : undefined,
        fileUrl: fileUrl !== undefined ? fileUrl : undefined,
      },
      include: {
        author: true,
        likes: {
          include: {
            user: true,
          },
        },
        comments: {
          include: {
            author: true,
            replies: {
              include: {
                author: true,
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const diffMs = Date.now() - new Date(updated.createdAt).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const timeAgo = diffHours <= 0 ? 'Just now' : `${diffHours} hours ago`;
    const timeAgoAr = diffHours <= 0 ? 'دلوقتي حالا' : `من ${diffHours} ساعات`;

    return NextResponse.json({
      id: updated.id,
      authorId: updated.authorId,
      author: updated.author.name,
      authorAvatar: updated.author.avatar || '',
      authorAvatarType: updated.author.avatarType,
      authorDetails: {
        id: updated.author.id,
        name: updated.author.name,
        fullName: updated.author.fullName,
        avatar: updated.author.avatar || '',
        avatarType: updated.author.avatarType,
        college: updated.author.college,
        specialty: updated.author.specialty,
      },
      role: `${updated.author.college} · ${updated.author.specialty}`,
      content: updated.content,
      contentAr: updated.contentAr,
      mediaType: updated.mediaType as 'image' | 'video' | 'file' | null | undefined,
      mediaUrl: updated.mediaUrl,
      fileName: updated.fileName,
      fileUrl: updated.fileUrl,
      likes: updated.likes ? updated.likes.map((like) => like.user?.name || '') : [],
      comments: updated.comments
        ? updated.comments.map((comment) => ({
            id: comment.id,
            author: comment.author?.name || '',
            authorAvatar: comment.author?.avatar || '',
            authorAvatarType: comment.author?.avatarType,
            text: comment.text,
            textAr: comment.textAr,
            timeAgo: 'Recently',
            replies: comment.replies
              ? comment.replies.map((reply) => ({
                  id: reply.id,
                  author: reply.author?.name || '',
                  authorAvatar: reply.author?.avatar || '',
                  authorAvatarType: reply.author?.avatarType,
                  text: reply.text,
                  textAr: reply.textAr,
                }))
              : [],
          }))
        : [],
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      timeAgo,
      timeAgoAr,
    });
  } catch (error) {
    console.error('Update community post error:', error);
    return NextResponse.json({ error: 'فشل تعديل المنشور' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: { params: { id: string } }) {
  return PATCH(req, ctx);
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

    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
    }

    if (post.authorId !== authUser.id) {
      return NextResponse.json({ error: 'غير مصرح لك بحذف هذا المنشور' }, { status: 403 });
    }

    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'تم حذف المنشور بنجاح' });
  } catch (error) {
    console.error('Delete community post error:', error);
    return NextResponse.json({ error: 'فشل حذف المنشور' }, { status: 500 });
  }
}
