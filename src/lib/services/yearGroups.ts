// src/lib/services/yearGroups.ts
// Every student is in one group chat per academic year and faculty. The group is created on demand.
import prisma from '@/lib/prisma';
import { departmentOf } from '@/lib/departments';

const YEAR_NAMES = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'];

export async function ensureYearGroup(user: { id: string; college: string; academicYear: number | null }) {
  if (!user.academicYear || user.academicYear < 1 || user.academicYear > 5) return;

  const faculty = departmentOf(user.college) ?? 'NONE';
  const groupKey = `year:${user.academicYear}:${faculty}`;

  const conv = await prisma.conversation.upsert({
    where: { groupKey },
    update: {},
    create: {
      groupKey,
      name: `الفرقة ${YEAR_NAMES[user.academicYear]} · ${user.college}`,
      isGroup: true,
      category: 'peers',
      lastMessage: 'مرحباً بزملاء الفرقة',
      participants: { create: [{ userId: user.id }] },
    },
  });

  await prisma.conversationParticipant.upsert({
    where: { conversationId_userId: { conversationId: conv.id, userId: user.id } },
    update: {},
    create: { conversationId: conv.id, userId: user.id },
  });
}
