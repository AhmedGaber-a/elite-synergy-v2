// src/lib/services/availability.ts
// Public status shown on a student's profile.
// A student who is still on an unsubmitted team project is never shown as open for projects.
import prisma from '@/lib/prisma';

export async function hasActiveProject(userId: string): Promise<boolean> {
  const row = await prisma.teamMember.findFirst({
    where: { userId, team: { submissions: { none: {} } } },
    select: { id: true },
  });
  return !!row;
}

export async function availabilityOf(user: { id: string; availableForSwaps: boolean; availableForProjects: boolean }) {
  const inActiveProject = await hasActiveProject(user.id);
  return {
    swaps: user.availableForSwaps,
    projects: user.availableForProjects && !inActiveProject,
    inActiveProject,
  };
}
