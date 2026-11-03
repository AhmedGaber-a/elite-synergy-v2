// src/lib/services/points.ts
import prisma from '@/lib/prisma';
import { PointSource } from '@prisma/client';

/** Adds points and writes the ledger row in one transaction. */
export async function awardPoints(params: {
  userId: string;
  amount: number;
  reason: string;
  source: PointSource;
  referenceId?: string | null;
  createdBy?: string | null;
}) {
  if (!Number.isInteger(params.amount) || params.amount === 0) return null;
  const [tx] = await prisma.$transaction([
    prisma.pointTransaction.create({
      data: {
        userId: params.userId,
        amount: params.amount,
        reason: params.reason,
        source: params.source,
        referenceId: params.referenceId || null,
        createdBy: params.createdBy || 'system',
      },
    }),
    prisma.user.update({
      where: { id: params.userId },
      data: { points: { increment: params.amount } },
    }),
  ]);
  return tx;
}

export async function logErpAction(actor: string, action: string, target: string | null, payload?: unknown) {
  await prisma.erpAuditLog.create({
    data: { actor, action, target, payload: (payload ?? null) as never },
  });
}
