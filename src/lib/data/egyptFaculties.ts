// src/lib/data/egyptFaculties.ts
// Only the academy's own departments are offered at registration. Each one has its own community.
import { DEPARTMENTS } from '@/lib/departments';

export const EGYPT_FACULTIES: readonly string[] = DEPARTMENTS.map((d) => d.label);
