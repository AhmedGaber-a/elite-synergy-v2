// src/app/api/community/route.ts
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

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    const formattedPosts = posts.map((post) => {
      const diffMs = Date.now() - new Date(post.createdAt).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const timeAgo = diffHours <= 0 ? 'Just now' : `${diffHours} hours ago`;
      const timeAgoAr = diffHours <= 0 ? 'دلوقتي حالا' : `من ${diffHours} ساعات`;

      return {
        id: post.id,
        authorId: post.authorId,
        author: post.author.name,
        authorAvatar: post.author.avatar || '',
        authorAvatarType: post.author.avatarType,
        authorDetails: {
          id: post.author.id,
          name: post.author.name,
          fullName: post.author.fullName,
          avatar: post.author.avatar || '',
          avatarType: post.author.avatarType,
          college: post.author.college,
          specialty: post.author.specialty,
        },
        role: `${post.author.college} · ${post.author.specialty}`,
        content: post.content,
        contentAr: post.contentAr,
        mediaType: post.mediaType as 'image' | 'video' | 'file' | null | undefined,
        mediaUrl: post.mediaUrl,
        fileName: post.fileName,
        fileUrl: post.fileUrl,
        likes: post.likes ? post.likes.map((like) => like.user?.name || '') : [],
        comments: post.comments
          ? post.comments.map((comment) => ({
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
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        timeAgo,
        timeAgoAr,
      };
    });

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error('Fetch community posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch community posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً لنشر منشور' }, { status: 401 });
    }

    const body = await req.json();
    const content = body.content !== undefined ? body.content : body.text;
    const contentAr = body.contentAr;
    let mediaType = body.mediaType || (body.mediaUrl ? 'image' : null);
    let mediaUrl = body.mediaUrl || body.image || null;
    let fileName = body.fileName || null;
    let fileUrl = body.fileUrl || null;

    const hasMedia = Boolean(mediaUrl || fileUrl);
    const hasContent = Boolean(content && typeof content === 'string' && content.trim());

    if (!hasContent && !hasMedia) {
      return NextResponse.json({ error: 'يرجى كتابة نص المنشور أو إرفاق ملف/صورة/فيديو' }, { status: 400 });
    }

    // Save Base64 mediaUrl if present
    if (mediaUrl && mediaUrl.startsWith('data:')) {
      const saved = saveBase64File(mediaUrl, mediaType === 'video' ? 'video' : 'media');
      if (saved) {
        mediaUrl = saved.url;
        if (!fileName && mediaType === 'file') {
          fileName = saved.fileName;
        }
      }
    }

    // Save Base64 fileUrl if present
    if (fileUrl && fileUrl.startsWith('data:')) {
      const saved = saveBase64File(fileUrl, 'doc');
      if (saved) {
        fileUrl = saved.url;
        if (!fileName) {
          fileName = body.fileName || saved.fileName;
        }
      }
    }

    // If mediaType is file and we have mediaUrl but no fileUrl, sync them
    if (mediaType === 'file' && !fileUrl && mediaUrl) {
      fileUrl = mediaUrl;
    }

    const newPost = await prisma.post.create({
      data: {
        authorId: authUser.id,
        content: content && typeof content === 'string' ? content.trim() : '',
        contentAr: contentAr && typeof contentAr === 'string' ? contentAr.trim() : null,
        mediaType: mediaType || null,
        mediaUrl: mediaUrl || null,
        fileName: fileName || null,
        fileUrl: fileUrl || null,
      },
      include: {
        author: true,
      },
    });

    return NextResponse.json(
      {
        ...newPost,
        id: newPost.id,
        authorId: newPost.authorId,
        author: newPost.author.name,
        authorAvatar: newPost.author.avatar || '',
        authorAvatarType: newPost.author.avatarType,
        authorDetails: {
          id: newPost.author.id,
          name: newPost.author.name,
          fullName: newPost.author.fullName,
          avatar: newPost.author.avatar || '',
          avatarType: newPost.author.avatarType,
          college: newPost.author.college,
          specialty: newPost.author.specialty,
        },
        role: `${newPost.author.college} · ${newPost.author.specialty}`,
        content: newPost.content,
        contentAr: newPost.contentAr,
        mediaType: newPost.mediaType as 'image' | 'video' | 'file' | null | undefined,
        mediaUrl: newPost.mediaUrl,
        fileName: newPost.fileName,
        fileUrl: newPost.fileUrl,
        likes: [],
        comments: [],
        timeAgo: 'Just now',
        timeAgoAr: 'دلوقتي حالا',
        createdAt: newPost.createdAt,
        updatedAt: newPost.updatedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create community post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
