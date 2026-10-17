// src/lib/data/peers.ts

export interface Peer {
  id: string;
  name: string;
  discipline: string;
  specialty: string;
  skills: string[];
  avatar: string;
  avatarType: 'male' | 'female';
  college: string;
  bio: string;
  projects: PeerProject[];
  isFriend: boolean;
  matchScore?: number;
}

export interface PeerProject {
  id: string;
  title: string;
  skill: string;
  description: string;
  image: string;
}

// Allowed disciplines
export const ALLOWED_DISCIPLINES = [
  'Business Information System',
  'Computer Science',
  'Accounting (Arabic)',
  'Accounting (English)',
] as const;

export type Discipline = typeof ALLOWED_DISCIPLINES[number];

// Zero hardcoded peers policy - all peers are loaded dynamically from PostgreSQL via /api/peers
export const PEERS: Peer[] = [];
