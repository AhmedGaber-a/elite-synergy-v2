// src/lib/services/resetCodes.ts
// Password-reset codes live in VerificationToken under "reset:<email>", kept apart from sign-up codes.
// The code is stored as a SHA-256 hash, never in plain text.
import { createHash, randomInt, randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import { hourAgo } from '@/lib/services/limits';

export const RESET_CODE_TTL_MS = 10 * 60 * 1000;
export const RESET_COOLDOWN_MS = 60 * 1000;
export const RESET_MAX_WRONG = 3;

export const resetIdentifier = (email: string) => `reset:${email}`;

export function hashCode(email: string, code: string): string {
  return createHash('sha256').update(`${email}|${code}`).digest('hex');
}

export function newResetCode(): string {
  return randomInt(100000, 1000000).toString();
}

// Per-IP limit for the reset routes, using VerificationToken rows so no new table is needed.
export async function ipOverLimit(prefix: string, ip: string, max: number): Promise<boolean> {
  const id = `${prefix}:${ip}`;
  const count = await prisma.verificationToken.count({ where: { identifier: id, createdAt: { gte: hourAgo() } } });
  if (count >= max) return true;
  await prisma.verificationToken.create({
    data: { identifier: id, token: `${prefix}-${randomUUID()}`, expires: new Date(Date.now() + 60 * 60 * 1000) },
  });
  return false;
}
