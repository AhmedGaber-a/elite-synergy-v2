// src/app/api/community/upload/route.ts
// Issues short-lived upload permissions for Vercel Blob. The browser uploads the file directly,
// so large videos never pass through the 4.5 MB serverless request limit.
import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

const MB = 1024 * 1024;

const RULES = {
  image: {
    contentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxBytes: 10 * MB,
  },
  video: {
    contentTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxBytes: 100 * MB,
  },
  file: {
    contentTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
    ],
    maxBytes: 25 * MB,
  },
} as const;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const user = await getAuthUser(req);
        if (!user) {
          throw new Error('UNAUTHORIZED');
        }
        const kind = clientPayload as keyof typeof RULES;
        const rule = RULES[kind];
        if (!rule) {
          throw new Error('BAD_KIND');
        }
        return {
          allowedContentTypes: [...rule.contentTypes],
          maximumSizeInBytes: rule.maxBytes,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: user.id }),
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(json);
  } catch (error) {
    const status = error instanceof Error && error.message === 'UNAUTHORIZED' ? 401 : 400;
    return NextResponse.json({ error: 'تعذر رفع الملف' }, { status });
  }
}
