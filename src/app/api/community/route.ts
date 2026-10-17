// src/app/api/community/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { formatArabicTimeAgo } from '@/lib/utils/timeAgo';

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
        sharedPost: {
          include: {
            author: true,
          },
        },
        likes: {
          include: {
            user: true,
          },
        },
        comments: {
          where: {
            parentId: null, // Top-level comments only
          },
          include: {
            author: true,
            reactions: {
              include: {
                user: true,
              },
            },
            nestedReplies: {
              include: {
                author: true,
                reactions: {
                  include: {
                    user: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
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
      const times = formatArabicTimeAgo(post.createdAt);

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
        sharedPostId: post.sharedPostId,
        sharedPost: post.sharedPost
          ? {
              id: post.sharedPost.id,
              authorId: post.sharedPost.authorId,
              author: post.sharedPost.author.name,
              authorAvatar: post.sharedPost.author.avatar || '',
              authorAvatarType: post.sharedPost.author.avatarType,
              role: `${post.sharedPost.author.college} · ${post.sharedPost.author.specialty}`,
              content: post.sharedPost.content,
              mediaType: post.sharedPost.mediaType as 'image' | 'video' | 'file' | null | undefined,
              mediaUrl: post.sharedPost.mediaUrl,
              fileName: post.sharedPost.fileName,
              fileUrl: post.sharedPost.fileUrl,
              timeAgo: formatArabicTimeAgo(post.sharedPost.createdAt).timeAgoEn,
              timeAgoAr: formatArabicTimeAgo(post.sharedPost.createdAt).relative,
              exactDate: formatArabicTimeAgo(post.sharedPost.createdAt).exact,
              createdAt: post.sharedPost.createdAt,
            }
          : null,
        likes: post.likes ? post.likes.map((like) => like.user?.name || '') : [],
        comments: post.comments
          ? post.comments.map((comment) => {
              const cTimes = formatArabicTimeAgo(comment.createdAt);

              // Merge CommentReply items and PostComment nestedReplies
              const combinedReplies = [
                ...(comment.nestedReplies || []).map((nr) => {
                  const rTimes = formatArabicTimeAgo(nr.createdAt);
                  return {
                    id: nr.id,
                    authorId: nr.authorId,
                    author: nr.author?.name || '',
                    authorAvatar: nr.author?.avatar || '',
                    authorAvatarType: nr.author?.avatarType,
                    text: nr.text,
                    textAr: nr.textAr,
                    timeAgo: rTimes.timeAgoEn,
                    timeAgoAr: rTimes.relative,
                    exactDate: rTimes.exact,
                    createdAt: nr.createdAt,
                    reactions: (nr.reactions || []).map((rx) => ({
                      type: rx.type,
                      userId: rx.userId,
                      userName: rx.user.name,
                    })),
                  };
                }),
                ...(comment.replies || []).map((r) => {
                  const rTimes = formatArabicTimeAgo(r.createdAt);
                  return {
                    id: r.id,
                    authorId: r.authorId,
                    author: r.author?.name || '',
                    authorAvatar: r.author?.avatar || '',
                    authorAvatarType: r.author?.avatarType,
                    text: r.text,
                    textAr: r.textAr,
                    timeAgo: rTimes.timeAgoEn,
                    timeAgoAr: rTimes.relative,
                    exactDate: rTimes.exact,
                    createdAt: r.createdAt,
                    reactions: [],
                  };
                }),
              ];

              return {
                id: comment.id,
                authorId: comment.authorId,
                author: comment.author?.name || '',
                authorAvatar: comment.author?.avatar || '',
                authorAvatarType: comment.author?.avatarType,
                text: comment.text,
                textAr: comment.textAr,
                timeAgo: cTimes.timeAgoEn,
                timeAgoAr: cTimes.relative,
                exactDate: cTimes.exact,
                createdAt: comment.createdAt,
                reactions: (comment.reactions || []).map((rx) => ({
                  type: rx.type,
                  userId: rx.userId,
                  userName: rx.user.name,
                })),
                replies: combinedReplies,
              };
            })
          : [],
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        timeAgo: times.timeAgoEn,
        timeAgoAr: times.relative,
        exactDate: times.exact,
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
    const sharedPostId = body.sharedPostId || null;
    let mediaType = body.mediaType || (body.mediaUrl ? 'image' : null);
    let mediaUrl = body.mediaUrl || body.image || null;
    let fileName = body.fileName || null;
    let fileUrl = body.fileUrl || null;

    const hasMedia = Boolean(mediaUrl || fileUrl);
    const hasContent = Boolean(content && typeof content === 'string' && content.trim());
    const isSharing = Boolean(sharedPostId);

    if (!hasContent && !hasMedia && !isSharing) {
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

    if (mediaType === 'file' && !fileUrl && mediaUrl) {
      fileUrl = mediaUrl;
    }

    // If sharing, verify original post exists
    let sharedPostData = null;
    if (sharedPostId) {
      const origPost = await prisma.post.findUnique({
        where: { id: sharedPostId },
        include: { author: true },
      });
      if (origPost) {
        sharedPostData = origPost;
        // Notify original author
        if (origPost.authorId !== authUser.id) {
          await prisma.notification.create({
            data: {
              userId: origPost.authorId,
              senderId: authUser.id,
              category: 'community',
              title: 'مشاركة جديدة لمنشورك',
              message: `${authUser.name} قام بمشاركة منشورك في مجتمع Elite Synergy.`,
              messageAr: `${authUser.name} قام بمشاركة منشورك في مجتمع Elite Synergy.`,
              actionUrl: `/community#post-${origPost.id}`,
            },
          });
        }
      }
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
        sharedPostId: sharedPostId || null,
      },
      include: {
        author: true,
        sharedPost: {
          include: {
            author: true,
          },
        },
      },
    });

    const times = formatArabicTimeAgo(newPost.createdAt);

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
        sharedPostId: newPost.sharedPostId,
        sharedPost: newPost.sharedPost
          ? {
              id: newPost.sharedPost.id,
              authorId: newPost.sharedPost.authorId,
              author: newPost.sharedPost.author.name,
              authorAvatar: newPost.sharedPost.author.avatar || '',
              authorAvatarType: newPost.sharedPost.author.avatarType,
              role: `${newPost.sharedPost.author.college} · ${newPost.sharedPost.author.specialty}`,
              content: newPost.sharedPost.content,
              mediaType: newPost.sharedPost.mediaType as 'image' | 'video' | 'file' | null | undefined,
              mediaUrl: newPost.sharedPost.mediaUrl,
              fileName: newPost.sharedPost.fileName,
              fileUrl: newPost.sharedPost.fileUrl,
              timeAgo: formatArabicTimeAgo(newPost.sharedPost.createdAt).timeAgoEn,
              timeAgoAr: formatArabicTimeAgo(newPost.sharedPost.createdAt).relative,
              exactDate: formatArabicTimeAgo(newPost.sharedPost.createdAt).exact,
              createdAt: newPost.sharedPost.createdAt,
            }
          : null,
        likes: [],
        comments: [],
        timeAgo: times.timeAgoEn,
        timeAgoAr: times.relative,
        exactDate: times.exact,
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
