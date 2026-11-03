// src/app/api/peers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const peerId = params.id;
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: peerId,
        isVerified: true,
      },
      include: {
        priorProjects: true,
        platformProjects: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Peer not found' }, { status: 404 });
    }

    let connectionStatus: 'NONE' | 'PENDING' | 'CONNECTED' = 'NONE';
    if (authUser) {
      const existingRequest = await prisma.collaborationRequest.findFirst({
        where: {
          OR: [
            { senderId: authUser.id, receiverId: peerId },
            { senderId: peerId, receiverId: authUser.id },
          ],
        },
      });

      if (existingRequest) {
        if (existingRequest.status === 'ACCEPTED') {
          connectionStatus = 'CONNECTED';
        } else if (existingRequest.status === 'PENDING') {
          connectionStatus = 'PENDING';
        }
      }
    }

    const peer = {
      id: user.id,
      name: user.name,
      fullName: user.fullName,
      email: user.email,
      discipline: user.discipline || user.college,
      specialty: user.specialty,
      college: user.college,
      avatar: user.avatar || '',
      avatarType: user.avatarType,
      skills: user.skills,
      bio: user.bio || '',
      points: user.points,
      matchScore: user.matchScore ?? 85,
      isFriend: connectionStatus === 'CONNECTED',
      connectionStatus,
      projects: user.priorProjects.map((p) => ({
        id: p.id,
        title: p.title,
        skill: p.skill,
        description: p.desc,
        image: '/assets/illustrations/feature_practical.jpg',
      })),
    };

    return NextResponse.json({ peer });
  } catch (error) {
    console.error('Fetch peer error:', error);
    return NextResponse.json({ error: 'Failed to fetch peer details' }, { status: 500 });
  }
}
