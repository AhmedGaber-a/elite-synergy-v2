// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        priorProjects: {
          orderBy: { createdAt: 'desc' },
        },
        platformProjects: {
          orderBy: { createdAt: 'desc' },
        },
        teamMemberships: {
          include: {
            team: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    });

    if (!fullUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const responseData = {
      id: fullUser.id,
      name: fullUser.name,
      fullName: fullUser.fullName,
      email: fullUser.email,
      specialty: fullUser.specialty,
      avatarType: fullUser.avatarType,
      avatar: fullUser.avatar || '',
      avatarUrl: fullUser.avatar || '',
      image: fullUser.avatar || '',
      college: fullUser.college,
      discipline: fullUser.discipline || fullUser.college,
      age: fullUser.age || null,
      role: fullUser.role,
      userRole: fullUser.userRole,
      address: fullUser.address || '',
      points: fullUser.points,
      bio: fullUser.bio || '',
      matchScore: fullUser.matchScore ?? 95,
      isVerified: fullUser.isVerified,
      resumeUrl: fullUser.resumeUrl || '',
      skills: fullUser.skills,
      languages: fullUser.languages || [],
      toolSkills: fullUser.toolSkills || [],
      extraSkills: fullUser.extraSkills || [],
      socialLinks: fullUser.socialLinks || {},
      priorProjects: fullUser.priorProjects.map((p) => ({
        id: p.id,
        title: p.title,
        desc: p.desc,
        skill: p.skill,
        emoji: p.emoji,
        uploadDate: p.uploadDate,
        source: p.source,
        fileUrl: p.fileUrl,
      })),
      platformProjects: fullUser.platformProjects.map((p) => ({
        id: p.id,
        title: p.title,
        desc: p.desc,
        domain: p.domain,
        role: p.role,
        teamName: p.teamName,
        supervisor: p.supervisor,
        grade: p.grade,
        score: p.score,
        completedDate: p.completedDate,
        status: p.status,
        badge: p.badge,
      })),
      teams: fullUser.teamMemberships.map((tm) => ({
        id: tm.team.id,
        slug: tm.team.slug,
        name: tm.team.name,
        emoji: tm.team.emoji,
        roleInTeam: tm.role,
        domain: tm.domain,
        projectTitle: tm.team.project?.title || '',
      })),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    // Sub-action: Add a prior project
    if (action === 'add_prior_project' || body.priorProject) {
      const proj = body.priorProject || body;
      const createdProject = await prisma.priorProject.create({
        data: {
          userId: authUser.id,
          title: proj.title || 'Untitled Project',
          desc: proj.desc || proj.description || '',
          skill: proj.skill || 'General',
          emoji: proj.emoji || '💼',
          uploadDate: proj.uploadDate || new Date().toISOString().split('T')[0],
          fileUrl: proj.fileUrl || null,
          source: 'profile_upload',
        },
      });

      return NextResponse.json({ success: true, priorProject: createdProject });
    }

    // Sub-action: Add a single skill
    if (action === 'add_skill' && body.skill) {
      const currentSkills = authUser.skills || [];
      const trimmedSkill = body.skill.trim();
      if (!currentSkills.includes(trimmedSkill)) {
        await prisma.user.update({
          where: { id: authUser.id },
          data: {
            skills: { push: trimmedSkill },
          },
        });
      }
      return NextResponse.json({ success: true, skill: trimmedSkill });
    }

    // Sub-action: Upload / Update CV
    if (action === 'update_cv' || body.resumeUrl !== undefined) {
      const updated = await prisma.user.update({
        where: { id: authUser.id },
        data: {
          resumeUrl: body.resumeUrl || body.cvUrl || null,
        },
      });
      return NextResponse.json({ success: true, resumeUrl: updated.resumeUrl });
    }

    const avatarValue = body.avatar !== undefined ? body.avatar : body.avatarUrl;
    const validAvatarTypes = ['male', 'female', 'hijab', 'niqab'];
    const avatarTypeValue = body.avatarType && validAvatarTypes.includes(body.avatarType)
      ? body.avatarType
      : undefined;

    // Sub-action: Update avatar / profile picture
    if (action === 'update_avatar') {
      const updateData: { avatar?: string | null; avatarType?: any } = {};
      if (avatarValue !== undefined) updateData.avatar = avatarValue ? avatarValue : null;
      if (avatarTypeValue !== undefined) updateData.avatarType = avatarTypeValue;

      const updated = await prisma.user.update({
        where: { id: authUser.id },
        data: updateData,
      });
      const userSafe = { ...updated };
      delete (userSafe as { password?: string | null }).password;

      return NextResponse.json({
        success: true,
        user: {
          ...userSafe,
          avatarUrl: userSafe.avatar || null,
          image: userSafe.avatar || null,
          avatarType: userSafe.avatarType,
        },
        avatar: updated.avatar,
        avatarType: updated.avatarType,
      });
    }

    // Standard profile fields update
    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        avatar: avatarValue !== undefined ? (avatarValue ? avatarValue : null) : undefined,
        avatarType: avatarTypeValue,
        name: body.name !== undefined ? body.name : undefined,
        fullName: body.fullName !== undefined ? body.fullName : undefined,
        specialty: body.specialty !== undefined ? body.specialty : undefined,
        college: body.college !== undefined ? body.college : undefined,
        discipline: body.college !== undefined ? body.college : undefined,
        age: body.age !== undefined ? (body.age ? Number(body.age) : null) : undefined,
        address: body.address !== undefined ? body.address : undefined,
        bio: body.bio !== undefined ? body.bio : undefined,
        skills: body.skills !== undefined ? body.skills : undefined,
        languages: body.languages !== undefined ? body.languages : undefined,
        toolSkills: body.toolSkills !== undefined ? body.toolSkills : undefined,
        extraSkills: body.extraSkills !== undefined ? body.extraSkills : undefined,
        socialLinks: body.socialLinks !== undefined ? body.socialLinks : undefined,
        resumeUrl: body.resumeUrl !== undefined ? body.resumeUrl : undefined,
      },
      include: {
        priorProjects: true,
        platformProjects: true,
      },
    });

    const userSafe = { ...updatedUser };
    delete (userSafe as { password?: string | null }).password;

    return NextResponse.json({
      success: true,
      user: {
        ...userSafe,
        avatarUrl: userSafe.avatar || null,
        image: userSafe.avatar || null,
        avatarType: userSafe.avatarType,
      },
      avatar: updatedUser.avatar,
      avatarType: updatedUser.avatarType,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return PATCH(req);
}
