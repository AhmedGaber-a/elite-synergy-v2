// src/app/api/erp/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ProjectType } from '@prisma/client';
import { validateErpApiKey, erpUnauthorized, erpCorsOptions, withErpCors } from '@/lib/utils/erpAuth';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  return erpCorsOptions(req);
}

// GET: Fetch all ERP projects pushed to the platform
export async function GET(req: NextRequest) {
  try {
    if (!validateErpApiKey(req)) {
      return erpUnauthorized(req);
    }

    const { searchParams } = new URL(req.url);
    const courseCode = searchParams.get('courseCode');

    const erpProjects = await prisma.project.findMany({
      where: {
        source: 'ERP',
        ...(courseCode ? { courseCode: { equals: courseCode, mode: 'insensitive' } } : {}),
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
                    college: true,
                    specialty: true,
                    avatar: true,
                    avatarType: true,
                  },
                },
              },
            },
          },
        },
        soloSubmissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                fullName: true,
                college: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return withErpCors(
      NextResponse.json({
        success: true,
        count: erpProjects.length,
        projects: erpProjects,
      }),
      req
    );
  } catch (error) {
    console.error('Fetch ERP projects error:', error);
    return withErpCors(
      NextResponse.json({ error: 'Failed to fetch ERP projects' }, { status: 500 }),
      req
    );
  }
}

// POST: Webhook/API endpoint to receive and sync project payloads from ERP/University system
export async function POST(req: NextRequest) {
  try {
    if (!validateErpApiKey(req)) {
      return erpUnauthorized(req);
    }

    const body = await req.json();
    const {
      title,
      description,
      erpReferenceId,
      professorName,
      doctor,
      courseCode,
      deadline,
      attachments = [],
      maxTeamSize = 11,
      maxTeams = 5,
      type = 'TEAM',
      domain = 'Cross-Disciplinary',
      forStudents = 'All Departments — Level 4',
      level = 4,
      score = 1000,
      completionTime = '3 months',
      companyBackground,
      businessProblem,
      relevantData = [],
      tasksToSolve = [],
      expectedDeliverables = [],
      phases = ['Planning & Requirements', 'Architecture & Prototyping', 'Execution & Integration', 'Final Defense'],
      category = 'Cross-Disciplinary',
    } = body;

    if (!title || !title.trim()) {
      return withErpCors(
        NextResponse.json({ error: 'Project title is required' }, { status: 400 }),
        req
      );
    }

    if (!description || !description.trim()) {
      return withErpCors(
        NextResponse.json({ error: 'Project description is required' }, { status: 400 }),
        req
      );
    }

    const effectiveDoctor = professorName || doctor || 'Professor / Course Director';
    const effectiveType = type && type.toUpperCase() === 'SOLO' ? ProjectType.SOLO : ProjectType.TEAM;
    const parsedDeadline = deadline ? new Date(deadline) : null;
    const numMaxTeamSize = Number(maxTeamSize) || 11;
    const numMaxTeams = Number(maxTeams) || 5;

    let project;

    if (erpReferenceId) {
      const existing = await prisma.project.findFirst({
        where: { erpReferenceId },
      });

      if (existing) {
        project = await prisma.project.update({
          where: { id: existing.id },
          data: {
            title: title.trim(),
            description: description.trim(),
            professorName: effectiveDoctor,
            doctor: effectiveDoctor,
            courseCode: courseCode || existing.courseCode,
            deadline: parsedDeadline !== null ? parsedDeadline : existing.deadline,
            attachments: Array.isArray(attachments) ? attachments : existing.attachments,
            maxTeamSize: numMaxTeamSize,
            maxSlots: numMaxTeamSize,
            maxTeams: numMaxTeams,
            type: effectiveType,
            domain: domain || existing.domain,
            forStudents: forStudents || existing.forStudents,
            level: Number(level) || existing.level,
            score: Number(score) || existing.score,
            completionTime: completionTime || existing.completionTime,
            companyBackground: companyBackground !== undefined ? companyBackground : existing.companyBackground,
            businessProblem: businessProblem !== undefined ? businessProblem : existing.businessProblem,
            relevantData: Array.isArray(relevantData) ? relevantData : existing.relevantData,
            tasksToSolve: Array.isArray(tasksToSolve) ? tasksToSolve : existing.tasksToSolve,
            expectedDeliverables: Array.isArray(expectedDeliverables) ? expectedDeliverables : existing.expectedDeliverables,
            phases: Array.isArray(phases) ? phases : existing.phases,
            category: category || existing.category,
            source: 'ERP',
          },
        });

        return withErpCors(
          NextResponse.json({
            success: true,
            message: 'ERP project updated successfully',
            project,
          }),
          req
        );
      }
    }

    // Generate unique slug
    const cleanSlugBase = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 50);
    const uniqueSuffix = erpReferenceId
      ? erpReferenceId.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : Math.random().toString(36).substring(2, 6);
    const slug = `${cleanSlugBase}-${uniqueSuffix}`;

    project = await prisma.project.create({
      data: {
        slug,
        title: title.trim(),
        description: description.trim(),
        source: 'ERP',
        erpReferenceId: erpReferenceId || null,
        professorName: effectiveDoctor,
        doctor: effectiveDoctor,
        courseCode: courseCode || null,
        deadline: parsedDeadline,
        attachments: Array.isArray(attachments) ? attachments : [],
        maxTeamSize: numMaxTeamSize,
        maxSlots: numMaxTeamSize,
        maxTeams: numMaxTeams,
        type: effectiveType,
        domain,
        forStudents,
        level: Number(level) || 4,
        score: Number(score) || 1000,
        completionTime,
        companyBackground: companyBackground || null,
        businessProblem: businessProblem || null,
        relevantData: Array.isArray(relevantData) ? relevantData : [],
        tasksToSolve: Array.isArray(tasksToSolve) ? tasksToSolve : [],
        expectedDeliverables: Array.isArray(expectedDeliverables) ? expectedDeliverables : [],
        phases: Array.isArray(phases) ? phases : [],
        category,
      },
    });

    return withErpCors(
      NextResponse.json(
        {
          success: true,
          message: 'ERP project ingested and published successfully',
          project,
        },
        { status: 201 }
      ),
      req
    );
  } catch (error) {
    console.error('Ingest ERP project error:', error);
    return withErpCors(
      NextResponse.json({ error: 'Failed to ingest ERP project' }, { status: 500 }),
      req
    );
  }
}
