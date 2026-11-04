// src/lib/services/learning.ts
// Shared rules for teaching sessions and skill swaps.
import prisma from '@/lib/prisma';

export const MAX_LEARNERS_PER_GROUP = 3;

export async function notify(userId: string, senderId: string, title: string, message: string, actionUrl: string) {
  try {
    await prisma.notification.create({
      data: { userId, senderId, category: 'peers', title, message, messageAr: message, actionUrl },
    });
  } catch (err) {
    console.error('Learning notification failed:', err);
  }
}

export function hourLabel(hour: number) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${hour < 12 ? 'ص' : 'م'}`;
}
