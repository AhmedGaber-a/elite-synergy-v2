// src/app/api/learning/swaps/route.ts
// Skill swaps: I want skill X and I have skill Y; a peer has X and wants Y.
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';
import { notify } from '@/lib/services/learning';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });

    const myWants = (await prisma.skillWant.findMany({ where: { userId: me.id }, select: { skill: true } })).map((w) => w.skill);
    const mySkills = me.skills || [];
    if (myWants.length === 0 || mySkills.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Peers who have a skill I want.
    const candidates = await prisma.user.findMany({
      where: { id: { not: me.id }, isVerified: true, skills: { hasSome: myWants } },
      select: {
        id: true, name: true, fullName: true, skills: true,
        skillWants: { select: { skill: true } },
      },
      take: 100,
    });

    const suggestions = candidates
      .map((c) => {
        const wantsFromMe = c.skillWants.map((w) => w.skill).filter((s) => mySkills.includes(s));
        const teachesMe = myWants.filter((s) => c.skills.includes(s));
        if (wantsFromMe.length === 0 || teachesMe.length === 0) return null;
        return {
          peer: { id: c.id, name: c.name, fullName: c.fullName },
          giveSkill: wantsFromMe[0], // I teach this
          takeSkill: teachesMe[0],   // they teach this
        };
      })
      .filter(Boolean);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Swap suggestions error:', error);
    return NextResponse.json({ error: 'تعذر تحميل الاقتراحات' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });

    const { toId, giveSkill, takeSkill } = await req.json();
    if (!toId || toId === me.id || !giveSkill || !takeSkill) {
      return NextResponse.json({ error: 'بيانات الطلب ناقصة' }, { status: 400 });
    }

    const other = await prisma.user.findFirst({ where: { id: toId, isVerified: true }, select: { id: true, skills: true } });
    if (!other || !other.skills.includes(takeSkill) || !(me.skills || []).includes(giveSkill)) {
      return NextResponse.json({ error: 'المهارات دي مش متاحة للتبادل' }, { status: 400 });
    }

    const pending = await prisma.skillSwap.findFirst({
      where: { fromId: me.id, toId, giveSkill, takeSkill, status: 'PENDING' },
      select: { id: true },
    });
    if (pending) return NextResponse.json({ error: 'الطلب ده متبعت قبل كده' }, { status: 409 });

    await prisma.skillSwap.create({ data: { fromId: me.id, toId, giveSkill, takeSkill } });

    await notify(
      toId,
      me.id,
      'اقتراح تبادل مهارات',
      `${me.fullName || me.name} عايز يعلمك ${giveSkill} مقابل إنك تعلمه ${takeSkill}`,
      '/learning'
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Create swap error:', error);
    return NextResponse.json({ error: 'تعذر إرسال الاقتراح' }, { status: 500 });
  }
}
