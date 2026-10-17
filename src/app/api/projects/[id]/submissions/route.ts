// src/app/api/projects/[id]/submissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً لرفع الحل' }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: {
        OR: [{ slug: params.id }, { id: params.id }],
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'المشروع غير موجود' }, { status: 404 });
    }

    if (project.type !== 'SOLO') {
      return NextResponse.json(
        { error: 'رفع الملفات الفردية مخصص فقط للمشاريع الفردية (SOLO)' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { fileName, fileSize, fileType = 'pdf', fileUrl, notes } = body;

    if (!fileName || !fileName.trim()) {
      return NextResponse.json({ error: 'اسم الملف مطلوب' }, { status: 400 });
    }

    const submission = await prisma.soloSubmission.create({
      data: {
        projectId: project.id,
        userId: authUser.id,
        name: fileName.trim(),
        size: fileSize || '1.2 MB',
        type: fileType || 'pdf',
        url: fileUrl || null,
        notes: notes ? notes.trim() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم رفع وتسليم ملف المشروع الفردي بنجاح!',
      submission: {
        id: submission.id,
        name: submission.name,
        size: submission.size,
        type: submission.type,
        url: submission.url,
        notes: submission.notes,
        createdAt: submission.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Solo submission error:', error);
    return NextResponse.json({ error: 'فشل تسليم الملف' }, { status: 500 });
  }
}
