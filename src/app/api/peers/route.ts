// src/app/api/peers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const collegeParam = searchParams.get('college') || searchParams.get('discipline') || '';
    const skill = searchParams.get('skill') || '';
    const currentUserId = authUser?.id || searchParams.get('currentUserId') || null;

    // Fetch only verified students from PostgreSQL, strictly excluding current logged-in user
    const users = await prisma.user.findMany({
      where: {
        isVerified: true,
        // CRITICAL RULE: Exclude the currently logged-in user from the response
        ...(currentUserId ? { id: { not: currentUserId } } : {}),
        ...(collegeParam
          ? {
              OR: [
                { college: { contains: collegeParam, mode: 'insensitive' } },
                { discipline: { contains: collegeParam, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
                { specialty: { contains: search, mode: 'insensitive' } },
                { skills: { has: search } },
              ],
            }
          : {}),
      },
      include: {
        priorProjects: true,
        platformProjects: true,
      },
      orderBy: { points: 'desc' },
    });

    const peers = users.map((u) => ({
      id: u.id,
      name: u.name,
      fullName: u.fullName,
      email: u.email,
      discipline: u.discipline || u.college,
      specialty: u.specialty,
      college: u.college,
      avatar: u.avatar || '',
      avatarType: u.avatarType,
      skills: u.skills,
      bio: u.bio || '',
      points: u.points,
      matchScore: u.matchScore ?? 85,
      isFriend: false,
      projects: u.priorProjects.map((p) => ({
        id: p.id,
        title: p.title,
        skill: p.skill,
        description: p.desc,
        image: '/assets/illustrations/feature_practical.jpg',
      })),
    }));

    // Filter by skill if requested
    const filteredPeers = skill
      ? peers.filter((p) => p.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase())))
      : peers;

    return NextResponse.json({ peers: filteredPeers });
  } catch (error) {
    console.error('Fetch peers error:', error);
    return NextResponse.json({ error: 'Failed to fetch peers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    const body = await req.json();
    const { peerId, message = 'Collaboration invite' } = body;

    if (!peerId) {
      return NextResponse.json({ error: 'Peer ID is required' }, { status: 400 });
    }

    if (peerId === authUser.id) {
      return NextResponse.json({ error: 'Cannot connect with yourself' }, { status: 400 });
    }

    // Upsert collaboration request in Prisma
    const request = await prisma.collaborationRequest.upsert({
      where: {
        senderId_receiverId: {
          senderId: authUser.id,
          receiverId: peerId,
        },
      },
      update: {
        message,
        status: 'PENDING',
      },
      create: {
        senderId: authUser.id,
        receiverId: peerId,
        message,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إرسال طلب التواصل بنجاح!',
      request,
    });
  } catch (error) {
    console.error('Connect peer error:', error);
    return NextResponse.json({ error: 'فشل إرسال طلب التواصل' }, { status: 500 });
  }
}
