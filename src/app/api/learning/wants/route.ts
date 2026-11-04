// src/app/api/learning/wants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/services/authService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });
  const wants = await prisma.skillWant.findMany({ where: { userId: me.id }, select: { skill: true }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json({ wants: wants.map((w) => w.skill) });
}

export async function POST(req: NextRequest) {
  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });
  const { skill } = await req.json();
  const clean = typeof skill === 'string' ? skill.trim().slice(0, 60) : '';
  if (!clean) return NextResponse.json({ error: 'اكتب اسم المهارة' }, { status: 400 });
  await prisma.skillWant.upsert({
    where: { userId_skill: { userId: me.id, skill: clean } },
    update: {},
    create: { userId: me.id, skill: clean },
  });
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'سجّل دخولك الأول' }, { status: 401 });
  const skill = new URL(req.url).searchParams.get('skill') || '';
  await prisma.skillWant.deleteMany({ where: { userId: me.id, skill } });
  return NextResponse.json({ success: true });
}
