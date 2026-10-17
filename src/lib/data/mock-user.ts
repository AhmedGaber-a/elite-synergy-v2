// src/lib/data/mock-user.ts

export interface PriorProject {
  id: string;
  title: string;
  desc: string;
  skill: string;
  emoji: string;
  uploadDate: string;
  source: 'registration' | 'profile_upload';
  fileUrl?: string | null;
}

export interface PlatformProject {
  id: string;
  title: string;
  desc: string;
  domain: string;
  role: string;
  teamName?: string | null;
  supervisor: string;
  grade: string;
  score: number;
  completedDate: string;
  status: 'Completed' | 'Verified';
  badge: string;
}

export const CURRENT_USER = {
  id: 'current-user',
  name: 'Student',
  fullName: 'Academic Student',
  email: 'student@fa-hists.edu.eg',
  avatarType: 'male' as const,
  role: 'Student',
};

// Zero Mock Data Policy — official students list starts empty, populated dynamically from PostgreSQL
export const OFFICIAL_STUDENTS: Array<{
  name: string;
  avatarType: string;
  specialty: string;
  college: string;
}> = [];

export const OFFICIAL_DOCTORS = [
  'Dr. Romany',
  'Dr. Hadeer',
  'Dr. Radwa',
] as const;

export const MOCK_USER = {
  id: CURRENT_USER.id,
  name: CURRENT_USER.name,
  fullName: CURRENT_USER.fullName,
  email: CURRENT_USER.email,
  specialty: 'Computer Science & Software Systems',
  avatarType: CURRENT_USER.avatarType,
  skills: [],
  college: 'Computer Science',
  age: 22,
  role: 'Student',
  address: 'Alexandria, Egypt',
  points: 0,
  bio: '',
  languages: [],
  toolSkills: [],
  extraSkills: [],
  socialLinks: {},
  priorProjects: [] as PriorProject[],
  platformProjects: [] as PlatformProject[],
  get projects() {
    return this.priorProjects;
  },
};

export const MOCK_PROFILE = MOCK_USER;