// src/lib/departments.ts
// Communities: one per faculty, plus one shared community ("GENERAL") for every student.
// The four original departments keep their fixed keys. Any other faculty gets a key derived from its name.

export const DEPARTMENTS = [
  { key: 'CS', label: 'Computer Science', labelAr: 'علوم الحاسب' },
  { key: 'BIS', label: 'Business Information System', labelAr: 'نظم معلومات الأعمال' },
  { key: 'ACC_EN', label: 'Accounting (English)', labelAr: 'المحاسبة (إنجليزي)' },
  { key: 'ACC_AR', label: 'Accounting (Arabic)', labelAr: 'المحاسبة (عربي)' },
] as const;

export type DepartmentKey = (typeof DEPARTMENTS)[number]['key'];

export const GENERAL_COMMUNITY = 'GENERAL' as const;
export type CommunityKey = string;

export function getDepartment(key: string | null | undefined) {
  return DEPARTMENTS.find((d) => d.key === key) ?? null;
}

// Community key for any faculty name, e.g. "Faculty of Law" -> "F_FACULTY_OF_LAW".
export function facultyKey(name: string): string {
  const slug = name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60);
  return `F_${slug}`;
}

export function isCommunityKey(value: unknown): value is CommunityKey {
  if (typeof value !== 'string') return false;
  return value === GENERAL_COMMUNITY || DEPARTMENTS.some((d) => d.key === value) || /^F_[A-Z0-9_]{1,60}$/.test(value);
}

// Maps a stored User.college (faculty name) to its community key. Returns null when there is no faculty.
export function departmentOf(college: string | null | undefined): string | null {
  if (!college || !college.trim()) return null;
  const c = college.trim().toLowerCase();
  if (c === 'computer science' || /\bcomputer science\b/.test(c)) return 'CS';
  if (/\bbis\b/.test(c) || c.includes('business information')) return 'BIS';
  if (c.includes('accounting')) return c.includes('arab') ? 'ACC_AR' : 'ACC_EN';
  return facultyKey(college);
}

// A student may read or post in their own faculty community and in the shared community. Nothing else.
export function canUseCommunity(college: string | null | undefined, community: string): boolean {
  if (community === GENERAL_COMMUNITY) return true;
  const own = departmentOf(college);
  return own !== null && own === community;
}
