// src/lib/services/connections.ts
// The one place that decides whether two students are connected.
// Connected = a collaboration request from one to the other was accepted.
import prisma from '@/lib/prisma';

export type ConnectionState = 'NONE' | 'SENT' | 'RECEIVED' | 'ACCEPTED';

export async function connectionWith(meId: string, otherId: string): Promise<ConnectionState> {
  if (!meId || !otherId || meId === otherId) return 'NONE';
  const row = await prisma.collaborationRequest.findFirst({
    where: {
      OR: [
        { senderId: meId, receiverId: otherId },
        { senderId: otherId, receiverId: meId },
      ],
    },
    select: { senderId: true, status: true },
  });
  if (!row) return 'NONE';
  if (row.status === 'ACCEPTED') return 'ACCEPTED';
  if (row.status === 'PENDING') return row.senderId === meId ? 'SENT' : 'RECEIVED';
  return 'NONE';
}

export async function areConnected(meId: string, otherId: string): Promise<boolean> {
  return (await connectionWith(meId, otherId)) === 'ACCEPTED';
}

// Ids of every student the viewer is connected with (accepted in either direction).
export async function acceptedPeerIds(meId: string): Promise<Set<string>> {
  const rows = await prisma.collaborationRequest.findMany({
    where: { status: 'ACCEPTED', OR: [{ senderId: meId }, { receiverId: meId }] },
    select: { senderId: true, receiverId: true },
  });
  return new Set(rows.map((r) => (r.senderId === meId ? r.receiverId : r.senderId)));
}
