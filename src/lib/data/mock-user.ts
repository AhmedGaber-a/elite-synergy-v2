// src/lib/data/mock-user.ts

export interface PriorProject {
  id: string
  title: string
  desc: string
  skill: string
  emoji: string
  uploadDate: string
  source: 'registration'
  fileUrl?: string
}

export interface PlatformProject {
  id: string
  title: string
  desc: string
  domain: string
  role: string
  teamName?: string
  supervisor: string
  grade: string
  score: number
  completedDate: string
  status: 'Completed' | 'Verified'
  badge: string
}

export const OFFICIAL_STUDENTS = [
  { name: 'Mariem ahmed', avatarType: 'niqab', specialty: 'Software Engineering & Cloud', college: 'CS' },
  { name: 'basmalha Ibrahim', avatarType: 'hijab', specialty: 'Data Science & BI', college: 'BIS' },
  { name: 'Dooa Abd-elftah', avatarType: 'hijab', specialty: 'Business Analysis', college: 'BIS' },
  { name: 'Raneem Yasser', avatarType: 'hijab', specialty: 'Full-Stack Web Dev', college: 'CS' },
  { name: 'Malak Mahmouad', avatarType: 'hijab', specialty: 'Financial Modeling & Accounting', college: 'Accounting (Arabic)' },
  { name: 'Rahma', avatarType: 'hijab', specialty: 'Mobile App Dev (Flutter)', college: 'CS' },
  { name: 'Nada Elsayed', avatarType: 'hijab', specialty: 'ERP Systems & Odoo', college: 'BIS' },
  { name: 'Rania Khaled', avatarType: 'hijab', specialty: 'Database Architecture & SQL', college: 'BIS' },
  { name: 'Mohamed hamada', avatarType: 'male', specialty: 'IoT & Embedded Hardware', college: 'CS' },
  { name: 'Shahd Mohamed', avatarType: 'hijab', specialty: 'Network & Cloud Security', college: 'CS' },
  { name: 'Shahd Khamees', avatarType: 'hijab', specialty: 'Auditing & Compliance', college: 'Accounting (English)' },
] as const

export const OFFICIAL_DOCTORS = [
  'Dr. Romany',
  'Dr. Hadeer',
  'Dr. Radwa',
] as const

export const MOCK_USER = {
  id: '1',
  name: 'ahmed',
  fullName: 'ahme gaber',
  email: 'ahmed.gaber@elite-synergy.edu.eg',
  specialty: 'Cloud Architect & Software Engineer',
  avatarType: 'niqab' as const,
  skills: [
    'Cloud Architecture',
    'AWS & Docker',
    'Linux Administration',
    'Python & Node.js',
    'ERP Systems',
    'PostgreSQL',
    'IoT Data Pipelines',
  ],
  college: 'Computer Science',
  age: 22,
  role: 'Student',
  address: 'Cairo, Egypt',
  points: 1450,
  bio: 'Computer Science student passionate about scalable cloud infrastructure, ERP integrations, and building high-impact real-world systems.',
  languages: [
    { name: 'Python', level: 90 },
    { name: 'JavaScript / TypeScript', level: 88 },
    { name: 'SQL & Database Design', level: 85 },
    { name: 'Bash / Linux Scripting', level: 80 },
  ],
  toolSkills: [
    { name: 'AWS Cloud Services', level: 90 },
    { name: 'Docker & Kubernetes', level: 85 },
    { name: 'Odoo ERP Backend', level: 82 },
    { name: 'Flutter & Dart APIs', level: 75 },
  ],
  extraSkills: ['Cloud Architecture', 'Systems Integration', 'Problem Solving', 'Team Leadership'],
  socialLinks: {
    x: 'https://x.com',
    twitter: 'https://x.com',
    instagram: 'https://instagram.com',
    behance: '#',
    linkedin: 'https://linkedin.com',
    facebook: 'https://facebook.com',
  },

  // Category 1: Projects uploaded during initial registration (Prior Experience)
  priorProjects: [
    {
      id: 'prior-1',
      title: 'Graduation Prep: Cloud Infrastructure Monitoring Dashboard',
      desc: 'A robust dashboard built prior to joining, monitoring cloud resource utilization, container health, and latency alerts.',
      skill: 'Cloud Architecture & AWS',
      emoji: '☁️',
      uploadDate: 'Uploaded during Registration',
      source: 'registration' as const,
    },
    {
      id: 'prior-2',
      title: 'IoT-Based Electrical Power Monitoring System',
      desc: 'An automated IoT sensor array measuring power voltage spikes with cloud alert dispatching.',
      skill: 'IoT & Systems Integration',
      emoji: '🔌',
      uploadDate: 'Uploaded during Registration',
      source: 'registration' as const,
    },
  ] as PriorProject[],

  // Category 2: Projects completed within the 'Elite Synergy' platform
  platformProjects: [
    {
      id: 'platform-1',
      title: 'Smart Enterprise: IoT + ERP + Flutter Integrated Ecosystem',
      desc: 'Capstone Mega Project completed in an 11-member cross-functional squad. Architected the central ERP API gateway connecting field IoT sensors to the Flutter mobile client.',
      domain: 'Cross-Disciplinary (IoT + ERP + Flutter)',
      role: 'Backend & Cloud Lead',
      teamName: 'الفراعنة (Team Alpha)',
      supervisor: 'Dr. Romany & Dr. Radwa',
      grade: 'A+ (98%)',
      score: 1000,
      completedDate: 'Completed on Elite Synergy — Fall Semester',
      status: 'Verified' as const,
      badge: 'Verified Elite Synergist 🏆',
    },
    {
      id: 'platform-2',
      title: 'Automated Supply Chain & Inventory Optimization Case',
      desc: 'Solo practical case analyzing multi-warehouse distribution bottlenecks and deploying optimized database queries.',
      domain: 'Business Information Systems',
      role: 'Solo Solver',
      supervisor: 'Dr. Hadeer',
      grade: 'A (95%)',
      score: 450,
      completedDate: 'Completed on Elite Synergy — Midterm',
      status: 'Completed' as const,
      badge: 'Case Master 🌟',
    },
  ] as PlatformProject[],

  // Backward compatibility alias
  get projects() {
    return this.priorProjects
  },
}