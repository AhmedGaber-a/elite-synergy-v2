// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { ProjectType } from '@prisma/client';

export const dynamic = 'force-dynamic';

// ── Helpers ──────────────────────────────────────────────────

/** Parse a value to an integer, returning the fallback when the result is NaN. */
function safeInt(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isNaN(n) ? fallback : Math.floor(n);
}

/** Strip dangerous protocols (javascript:, data:, vbscript:) from every string in an array. */
function sanitizeStringArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((v): v is string => typeof v === 'string')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => {
      // Block javascript: / data: / vbscript: URLs
      if (/^\s*(javascript|data|vbscript)\s*:/i.test(s)) return '';
      return s;
    })
    .filter((s) => s.length > 0);
}

/**
 * Generate a URL-safe slug from a title.
 * Latin characters are lowercased and kept; Arabic (\u0600-\u06FF) characters are preserved.
 * If the resulting base is empty, falls back to "project-<randomSuffix>".
 */
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const suffix = Math.random().toString(36).substring(2, 6);
  return base.length > 0 ? `${base}-${suffix}` : `project-${suffix}`;
}

// ── GET /api/projects ────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type');
    const domain = searchParams.get('domain');

    // Only filter by type when the param is explicitly SOLO or TEAM.
    let projectType: ProjectType | undefined;
    if (typeParam) {
      const upper = typeParam.toUpperCase();
      if (upper === 'SOLO') projectType = ProjectType.SOLO;
      else if (upper === 'TEAM') projectType = ProjectType.TEAM;
      // Any other value → no type filter (show all).
    }

    const projects = await prisma.project.findMany({
      where: {
        ...(projectType ? { type: projectType } : {}),
        ...(domain ? { domain: { equals: domain, mode: 'insensitive' as const } } : {}),
      },
      include: {
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    fullName: true,
                    avatarType: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        // Use _count instead of loading all soloSubmission records into memory
        _count: {
          select: { soloSubmissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedProjects = projects.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      type: p.type,
      maxTeams: p.maxTeams,
      teamsCount: p.teams.length,
      availableTeamsCount: Math.max(0, p.maxTeams - p.teams.length),
      domain: p.domain,
      forStudents: p.forStudents,
      level: p.level,
      doctor: p.doctor,
      score: p.score,
      completionTime: p.completionTime,
      maxSlots: p.maxSlots,
      isMega: p.isMega,
      phases: p.phases,
      category: p.category,
      teams: p.teams.map((t) => ({
        id: t.slug || t.id,
        dbId: t.id,
        name: t.name,
        emoji: t.emoji,
        slots: t.slots,
        maxSlots: t.maxSlots,
        level: t.level,
        membersCount: t.members.length,
        members: t.members.map((m) => m.user.name),
      })),
      submissionsCount: p._count.soloSubmissions,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({ projects: formattedProjects });
  } catch (error) {
    console.error('Fetch projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// ── POST /api/projects ───────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    // STRICT RULE: Students CANNOT create standalone projects on the platform. Only professors/admins can upload projects.
    if (authUser.userRole !== 'INSTRUCTOR' && authUser.userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'عذراً، صلاحية إضافة المشاريع العملية مخصصة للأساتذة والمشرفين الأكاديميين فقط.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      type = 'TEAM',
      maxTeams = 5,
      domain = 'Cross-Disciplinary',
      forStudents = 'All Departments — Level 4',
      level = 4,
      doctor = authUser.fullName || authUser.name || 'Professor',
      score = 1000,
      completionTime = '3 months',
      maxSlots = 11,
      isMega = false,
      phases = ['Planning & Requirements', 'Architecture & Prototyping', 'Execution & Integration', 'Final Defense'],
      companyBackground,
      businessProblem,
      relevantData = [],
      tasksToSolve = [],
      expectedDeliverables = [],
      category = 'Cross-Disciplinary',
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'عنوان المشروع مطلوب' }, { status: 400 });
    }

    // Safe integer parsing with NaN guards
    const safeMaxTeams = safeInt(maxTeams, 5);
    const safeLevel = safeInt(level, 4);
    const safeScore = safeInt(score, 1000);
    const safeMaxSlots = safeInt(maxSlots, 11);

    // Arabic-aware slug generation
    const slug = generateSlug(title.trim());

    // Sanitize string arrays and block javascript: URLs
    const safePhases = sanitizeStringArray(phases);
    const safeRelevantData = sanitizeStringArray(relevantData);
    const safeTasksToSolve = sanitizeStringArray(tasksToSolve);
    const safeExpectedDeliverables = sanitizeStringArray(expectedDeliverables);

    // Resolve professor name for schema consistency
    const professorName = typeof doctor === 'string' && doctor.trim()
      ? doctor.trim()
      : (authUser.fullName || authUser.name || 'Professor');

    const newProject = await prisma.project.create({
      data: {
        slug,
        title: title.trim(),
        description: description || 'Academic practical challenge uploaded by faculty professor.',
        type: type.toUpperCase() === 'SOLO' ? ProjectType.SOLO : ProjectType.TEAM,
        maxTeams: safeMaxTeams,
        domain,
        forStudents,
        level: safeLevel,
        doctor: professorName,        // set both doctor …
        score: safeScore,
        completionTime,
        maxSlots: safeMaxSlots,        // … and maxSlots for schema consistency
        isMega: Boolean(isMega),
        phases: safePhases,
        companyBackground: companyBackground || null,
        businessProblem: businessProblem || null,
        relevantData: safeRelevantData,
        tasksToSolve: safeTasksToSolve,
        expectedDeliverables: safeExpectedDeliverables,
        category,
      },
    });

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
