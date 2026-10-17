// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { ProjectType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type');
    const domain = searchParams.get('domain');

    const projectType =
      typeParam && (typeParam.toUpperCase() === 'SOLO' ? ProjectType.SOLO : ProjectType.TEAM);

    const projects = await prisma.project.findMany({
      where: {
        ...(projectType ? { type: projectType } : {}),
        ...(domain ? { domain: { equals: domain, mode: 'insensitive' } } : {}),
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
        soloSubmissions: {
          select: {
            id: true,
            userId: true,
          },
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
      submissionsCount: p.soloSubmissions.length,
    }));

    return NextResponse.json({ projects: formattedProjects });
  } catch (error) {
    console.error('Fetch projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

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

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Math.random().toString(36).substring(2, 6)}`;

    const newProject = await prisma.project.create({
      data: {
        slug,
        title: title.trim(),
        description: description || 'Academic practical challenge uploaded by faculty professor.',
        type: type.toUpperCase() === 'SOLO' ? ProjectType.SOLO : ProjectType.TEAM,
        maxTeams: Number(maxTeams) || 5,
        domain,
        forStudents,
        level: Number(level),
        doctor,
        score: Number(score),
        completionTime,
        maxSlots: Number(maxSlots),
        isMega: Boolean(isMega),
        phases,
        companyBackground: companyBackground || null,
        businessProblem: businessProblem || null,
        relevantData,
        tasksToSolve,
        expectedDeliverables,
        category,
      },
    });

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
