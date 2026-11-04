import { hourAgo, tooMany } from '@/lib/services/limits';
// src/app/api/community/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { formatArabicTimeAgo } from '@/lib/utils/timeAgo';
import { canUseCommunity, departmentOf, GENERAL_COMMUNITY, isCommunityKey } from '@/lib/departments';
import { PUBLIC_USER_SELECT } from '@/lib/services/publicUser';
import { validateTextContent } from '@/lib/utils/sanitize';

// Only the fields the feed shows. Never load password hashes or private columns into list responses.
const AUTHOR_FIELDS = {
  id: true,
  name: true,
  fullName: true,
  avatar: true,
  avatarType: true,
  college: true,
  specialty: true,
} as const;

export const dynamic = 'force-dynamic';

// Files are uploaded straight to Vercel Blob by the browser; the server only stores their URLs.
// A base64 payload means the client skipped the upload, so it is refused here.
function hasInlineData(...urls: (string | null | undefined)[]): boolean {
  return urls.some((u) => typeof u === 'string' && (u.startsWith('data:') || u.startsWith('blob:')));
}

export async function GET(req: NextRequest) {
  try {
    const viewer = await getAuthUser(req);
    if (!viewer) {
      return NextResponse.json({ error: 'سجّل دخولك عشان تشوف المجتمع' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    // Safe pagination with limit = 20 by default
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 20, 1), 50);
    const page = Math.max(Number(searchParams.get('page')) || 1, 1);
    const skip = searchParams.get('skip') ? Math.max(Number(searchParams.get('skip')), 0) : (page - 1) * limit;

    // Default to the viewer's own department; "GENERAL" is the shared community for all departments.
    const requested = searchParams.get('community') || departmentOf(viewer.college) || GENERAL_COMMUNITY;
    if (!isCommunityKey(requested) || !canUseCommunity(viewer.college, requested)) {
      return NextResponse.json({ error: 'لا يمكنك دخول مجتمع قسم آخر' }, { status: 403 });
    }

    // Year scoping: inside a department, a student only sees posts for their own year.
    // The combined ("GENERAL") area shows every year and every department.
    const isStudent = viewer.userRole === 'STUDENT';
    const isDeptArea = requested !== GENERAL_COMMUNITY;
    let yearFilter: { academicYear: number } | undefined;
    if (isDeptArea && isStudent) {
      if (!viewer.academicYear) return NextResponse.json([]); // no year yet: nothing to show in the department area
      yearFilter = { academicYear: viewer.academicYear };
    } else if (isDeptArea && !isStudent) {
      const yearParam = Number(searchParams.get('year'));
      if (Number.isInteger(yearParam) && yearParam >= 1 && yearParam <= 5) yearFilter = { academicYear: yearParam };
    }

    const posts = await prisma.post.findMany({
      where: {
        community: requested,
        OR: [{ moderationStatus: 'APPROVED' }, { authorId: viewer.id }],
        ...(yearFilter ?? {}),
      },
      select: {
        id: true,
        authorId: true,
        academicYear: true,
        content: true,
        contentAr: true,
        mediaType: true,
        mediaUrl: true,
        fileName: true,
        fileUrl: true,
        sharedPostId: true,
        createdAt: true,
        updatedAt: true,
        author: { select: AUTHOR_FIELDS },
        sharedPost: {
          select: {
            id: true,
            authorId: true,
            content: true,
            mediaType: true,
            mediaUrl: true,
            fileName: true,
            fileUrl: true,
            createdAt: true,
            author: { select: AUTHOR_FIELDS },
          },
        },
        likes: {
          select: {
            user: { select: { name: true } },
          },
        },
        comments: {
          where: {
            parentId: null, // Top-level comments only
          },
          select: {
            id: true,
            authorId: true,
            text: true,
            textAr: true,
            createdAt: true,
            author: { select: AUTHOR_FIELDS },
            reactions: {
              select: {
                type: true,
                userId: true,
                user: { select: { name: true } },
              },
            },
            nestedReplies: {
              select: {
                id: true,
                authorId: true,
                text: true,
                textAr: true,
                createdAt: true,
                author: { select: AUTHOR_FIELDS },
                reactions: {
                  select: {
                    type: true,
                    userId: true,
                    user: { select: { name: true } },
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
            replies: {
              select: {
                id: true,
                authorId: true,
                text: true,
                textAr: true,
                createdAt: true,
                author: { select: AUTHOR_FIELDS },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: skip,
    });

    const formattedPosts = posts.map((post) => {
      const times = formatArabicTimeAgo(post.createdAt);

      return {
        id: post.id,
        authorId: post.authorId,
        academicYear: post.academicYear,
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
    const recentPosts = await prisma.post.count({ where: { authorId: authUser.id, createdAt: { gte: hourAgo() } } });
    if (recentPosts >= 10) return tooMany('وصلت للحد المسموح من المنشورات في الساعة، حاول بعدين');

    const body = await req.json();

    // Post into the requested community (default: the author's own department).
    const community = body.community || departmentOf(authUser.college) || GENERAL_COMMUNITY;
    if (!isCommunityKey(community) || !canUseCommunity(authUser.college, community)) {
      return NextResponse.json({ error: 'لا يمكنك النشر في مجتمع قسم آخر' }, { status: 403 });
    }

    // Year rules: a student's post always carries the student's own year (any year sent by the client is ignored).
    // Staff choose the year of the post themselves.
    let postYear: number | null;
    if (authUser.userRole === 'STUDENT') {
      if (!authUser.academicYear) {
        return NextResponse.json({ error: 'سجّل سنتك الدراسية الأول' }, { status: 403 });
      }
      postYear = authUser.academicYear;
    } else {
      const requestedYear = Number(body.academicYear);
      if (!Number.isInteger(requestedYear) || requestedYear < 1 || requestedYear > 5) {
        return NextResponse.json({ error: 'اختار السنة الدراسية اللي المنشور ده ليها' }, { status: 400 });
      }
      postYear = requestedYear;
    }

    const rawContent = body.content !== undefined ? body.content : body.text;
    const rawContentAr = body.contentAr;
    const sharedPostId = body.sharedPostId || null;
    let mediaType = body.mediaType || (body.mediaUrl ? 'image' : null);
    let mediaUrl = body.mediaUrl || body.image || null;
    let fileName = body.fileName || null;
    let fileUrl = body.fileUrl || null;

    const hasMedia = Boolean(mediaUrl || fileUrl);
    const isSharing = Boolean(sharedPostId);

    // Validate and sanitize content: max 5000 chars, required if no media or shared post
    const contentValidation = validateTextContent(rawContent, {
      maxLength: 5000,
      required: !hasMedia && !isSharing,
      fieldName: 'نص المنشور',
    });

    if (!contentValidation.valid) {
      return NextResponse.json({ error: contentValidation.error }, { status: 400 });
    }

    let sanitizedContentAr: string | null = null;
    if (rawContentAr !== undefined && rawContentAr !== null && typeof rawContentAr === 'string' && rawContentAr.trim()) {
      const arValidation = validateTextContent(rawContentAr, {
        maxLength: 5000,
        required: false,
        fieldName: 'النص العربي للمنشور',
      });
      if (!arValidation.valid) {
        return NextResponse.json({ error: arValidation.error }, { status: 400 });
      }
      sanitizedContentAr = arValidation.sanitized;
    }

    if (hasInlineData(mediaUrl, fileUrl)) {
      return NextResponse.json({ error: 'ارفع الملف أولاً ثم انشر المنشور' }, { status: 400 });
    }

    if (mediaType === 'file' && !fileUrl && mediaUrl) {
      fileUrl = mediaUrl;
    }

    // If sharing, verify original post exists
    let sharedPostData = null;
    if (sharedPostId) {
      const origPost = await prisma.post.findUnique({
        where: { id: sharedPostId },
        include: { author: { select: PUBLIC_USER_SELECT } },
      });
      if (origPost) {
        // Never embed a post from a community the author cannot read.
        if (!canUseCommunity(authUser.college, origPost.community)) {
          return NextResponse.json({ error: 'لا يمكنك مشاركة منشور من مجتمع قسم آخر' }, { status: 403 });
        }
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
        community,
        academicYear: postYear,
        content: contentValidation.sanitized,
        contentAr: sanitizedContentAr,
        mediaType: mediaType || null,
        mediaUrl: mediaUrl || null,
        fileName: fileName || null,
        fileUrl: fileUrl || null,
        sharedPostId: sharedPostId || null,
      },
      include: {
        author: { select: PUBLIC_USER_SELECT },
        sharedPost: {
          include: {
            author: { select: PUBLIC_USER_SELECT },
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
