// src/lib/departments.ts
// The four departments a student can register in. `label` is the exact value stored in User.college.

export const DEPARTMENTS = [
  { key: 'CS', label: 'Computer Science', labelAr: 'علوم الحاسب' },
  { key: 'BIS', label: 'Business Information System', labelAr: 'نظم معلومات الأعمال' },
  { key: 'ACC_EN', label: 'Accounting (English)', labelAr: 'المحاسبة (إنجليزي)' },
  { key: 'ACC_AR', label: 'Accounting (Arabic)', labelAr: 'المحاسبة (عربي)' },
] as const;

export type DepartmentKey = (typeof DEPARTMENTS)[number]['key'];

// Shared community that every department can read and post in.
export const GENERAL_COMMUNITY = 'GENERAL' as const;
export type CommunityKey = DepartmentKey | typeof GENERAL_COMMUNITY;

export function getDepartment(key: string | null | undefined) {
  return DEPARTMENTS.find((d) => d.key === key) ?? null;
}

export function isCommunityKey(value: unknown): value is CommunityKey {
  return value === GENERAL_COMMUNITY || DEPARTMENTS.some((d) => d.key === value);
}

// Maps a stored User.college value to a department key. Returns null when the value is not one of the four.
export function departmentOf(college: string | null | undefined): DepartmentKey | null {
  if (!college) return null;
  const c = college.trim().toLowerCase();
  if (c === 'computer science' || /\bcomputer\b/.test(c)) return 'CS';
  if (/\bbis\b/.test(c) || c.includes('business')) return 'BIS';
  if (c.includes('accounting')) return c.includes('arab') ? 'ACC_AR' : 'ACC_EN';
  return null;
}

// A student may read or post in their own department and in the shared community. Nothing else.
export function canUseCommunity(college: string | null | undefined, community: string): boolean {
  if (community === GENERAL_COMMUNITY) return true;
  const dept = departmentOf(college);
  return dept !== null && dept === community;
}
