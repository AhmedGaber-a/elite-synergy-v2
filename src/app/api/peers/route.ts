// src/app/api/peers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { DEPARTMENTS, getDepartment } from '@/lib/departments';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const collegeParam = searchParams.get('college') || searchParams.get('discipline') || '';
    const skill = searchParams.get('skill') || '';
    const currentUserId = authUser?.id || searchParams.get('currentUserId') || null;
    // Department split: exact match on the registered college value. "ALL" or empty = every department.
    const department = getDepartment(searchParams.get('department'));

    // Fetch only verified students from PostgreSQL, strictly excluding current logged-in user
    const users = await prisma.user.findMany({
      where: {
        isVerified: true,
        // CRITICAL RULE: Exclude the currently logged-in user from the response
        ...(currentUserId ? { id: { not: currentUserId } } : {}),
        ...(department ? { college: department.label } : {}),
        ...(collegeParam
          ? {
              OR: [
                { college: { contains: collegeParam, mode: 'insensitive' } },
                { discipline: { contains: collegeParam, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        priorProjects: true,
        platformProjects: true,
      },
      orderBy: { points: 'desc' },
      take: 200, // cap the list so it stays fast as the student body grows
    });

    const peers = users.map((u) => ({
      id: u.id,
      name: u.name,
      fullName: u.fullName,
      discipline: u.discipline || u.college,
      specialty: u.specialty,
      college: u.college,
      avatar: u.avatar || '',
      avatarType: u.avatarType,
      skills: u.skills || [],
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

    // Dynamic case-insensitive free-text filter for skills & search
    let filteredPeers = peers;
    if (skill) {
      const sLower = skill.toLowerCase().trim();
      filteredPeers = filteredPeers.filter((p) =>
        p.skills.some((s) => s.toLowerCase().includes(sLower))
      );
    }

    if (search) {
      const qLower = search.toLowerCase().trim();
      filteredPeers = filteredPeers.filter((p) =>
        p.name.toLowerCase().includes(qLower) ||
        p.fullName.toLowerCase().includes(qLower) ||
        p.specialty.toLowerCase().includes(qLower) ||
        p.college.toLowerCase().includes(qLower) ||
        p.discipline.toLowerCase().includes(qLower) ||
        p.skills.some((s) => s.toLowerCase().includes(qLower))
      );
    }

    // Student counts per department, for the sidebar (ignores the current filters, excludes the viewer).
    const grouped = await prisma.user.groupBy({
      by: ['college'],
      where: {
        isVerified: true,
        ...(currentUserId ? { id: { not: currentUserId } } : {}),
      },
      _count: { _all: true },
    });
    const departmentCounts: Record<string, number> = {};
    for (const d of DEPARTMENTS) {
      departmentCounts[d.key] = grouped
        .filter((g) => g.college === d.label)
        .reduce((sum, g) => sum + g._count._all, 0);
    }

    // Each peer's link with the viewer, so the UI never relies on local memory.
    const links = currentUserId
      ? await prisma.collaborationRequest.findMany({
          where: { OR: [{ senderId: currentUserId }, { receiverId: currentUserId }] },
          select: { senderId: true, receiverId: true, status: true },
        })
      : [];
    const connectionWith = new Map<string, 'SENT' | 'RECEIVED' | 'ACCEPTED'>();
    for (const l of links) {
      const other = l.senderId === currentUserId ? l.receiverId : l.senderId;
      if (l.status === 'ACCEPTED') connectionWith.set(other, 'ACCEPTED');
      else if (l.status === 'PENDING') connectionWith.set(other, l.senderId === currentUserId ? 'SENT' : 'RECEIVED');
    }
    const withState = filteredPeers.map((p) => ({ ...p, connection: connectionWith.get(p.id) ?? 'NONE' }));

    return NextResponse.json({ peers: withState, departmentCounts });
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

    const existing = await prisma.collaborationRequest.findFirst({
      where: {
        OR: [
          { senderId: authUser.id, receiverId: peerId },
          { senderId: peerId, receiverId: authUser.id },
        ],
      },
    });
    if (existing?.status === 'ACCEPTED') {
      return NextResponse.json({ error: 'أنتم متواصلين بالفعل' }, { status: 409 });
    }
    if (existing?.status === 'PENDING' && existing.senderId === peerId) {
      return NextResponse.json({ error: 'عندك طلب وارد من الزميل ده، اقبله من الطلبات الواردة' }, { status: 409 });
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

    // Create a real Notification in database for the receiver
    await prisma.notification.create({
      data: {
        userId: peerId,
        senderId: authUser.id,
        category: 'peers',
        title: 'طلب تواصل أكاديمي جديد',
        message: `${authUser.name} أرسل لك دعوة للتواصل والتعاون الأكاديمي.`,
        messageAr: `${authUser.name} أرسل لك دعوة للتواصل والتعاون الأكاديمي.`,
        actionUrl: `/peers/${authUser.id}`,
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
