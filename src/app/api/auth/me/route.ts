// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUserId } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // One database round trip: verify the token, then load the user with relations.
    const userId = getAuthUserId(req);

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        priorProjects: true,
        platformProjects: true,
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
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const userSafe = { ...fullUser };
    delete (userSafe as { password?: string | null }).password;

    return NextResponse.json({
      user: {
        ...userSafe,
        avatarUrl: userSafe.avatar || null,
        image: userSafe.avatar || null,
        avatarType: userSafe.avatarType,
      },
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
