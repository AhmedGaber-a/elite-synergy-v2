// src/app/api/community/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

function saveBase64File(dataUrl: string, prefix = 'community'): { url: string; fileName: string } | null {
  try {
    const matches = dataUrl.match(/^data:([^;,]+)(?:;[^,]*)*;base64,([\s\S]+)$/);
    if (!matches || matches.length < 3) {
      return null;
    }
    const mimeType = matches[1].toLowerCase();
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = 'bin';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('mp4')) ext = 'mp4';
    else if (mimeType.includes('webm')) ext = 'webm';
    else if (mimeType.includes('quicktime') || mimeType.includes('mov')) ext = 'mov';
    else if (mimeType.includes('pdf')) ext = 'pdf';
    else if (mimeType.includes('word') || mimeType.includes('doc')) ext = 'docx';
    else if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || mimeType.includes('ppt')) ext = 'pptx';
    else if (mimeType.includes('zip') || mimeType.includes('compressed')) ext = 'zip';

    const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return {
      url: `/uploads/${filename}`,
      fileName: filename,
    };
  } catch (err) {
    console.error('Error saving base64 file:', err);
    return null;
  }
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

    // Save Base64 mediaUrl if new base64 sent
    if (mediaUrl && mediaUrl.startsWith('data:')) {
      const saved = saveBase64File(mediaUrl, mediaType === 'video' ? 'video' : 'media');
      if (saved) {
        mediaUrl = saved.url;
        if (!fileName && mediaType === 'file') {
          fileName = saved.fileName;
        }
      }
    }

    // Save Base64 fileUrl if new base64 sent
    if (fileUrl && fileUrl.startsWith('data:')) {
      const saved = saveBase64File(fileUrl, 'doc');
      if (saved) {
        fileUrl = saved.url;
        if (!fileName) {
          fileName = body.fileName || saved.fileName;
        }
      }
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
