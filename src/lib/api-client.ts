// src/lib/api-client.ts
/**
 * Type-safe client service to interact with the Elite Synergy Backend API.
 * Use these methods in your React components to replace static mock imports with live data.
 */

// ─── Profile APIs ─────────────────────────────────────────────────────────────

export async function fetchUserProfile() {
  const res = await fetch('/api/profile', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function updateUserProfile(data: {
  name?: string;
  fullName?: string;
  specialty?: string;
  college?: string;
  bio?: string;
  skills?: string[];
  address?: string;
  age?: number;
}) {
  const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user profile');
  return res.json();
}

// ─── Teams & Projects APIs ────────────────────────────────────────────────────

export async function fetchTeams() {
  const res = await fetch('/api/teams', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch teams');
  return res.json();
}

export async function fetchTeamDetails(teamIdOrSlug: string) {
  const res = await fetch(`/api/teams/${teamIdOrSlug}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch team details');
  return res.json();
}

export async function joinTeam(teamIdOrSlug: string, role: string, domain: string) {
  const res = await fetch(`/api/teams/${teamIdOrSlug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'join', role, domain }),
  });
  if (!res.ok) throw new Error('Failed to join team');
  return res.json();
}

export async function sendTeamMessage(teamIdOrSlug: string, text: string) {
  const res = await fetch(`/api/teams/${teamIdOrSlug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'message', text }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

// ─── Community Feed APIs ──────────────────────────────────────────────────────

export async function fetchCommunityPosts() {
  const res = await fetch('/api/community/posts', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch community posts');
  return res.json();
}

export async function createCommunityPost(
  content: string,
  options?: { contentAr?: string; mediaType?: 'image' | 'video' | 'file'; mediaUrl?: string; fileName?: string; fileUrl?: string }
) {
  const res = await fetch('/api/community/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, ...options }),
  });
  if (!res.ok) throw new Error('Failed to create community post');
  return res.json();
}

export async function updateCommunityPost(
  postId: string,
  data: { content?: string; contentAr?: string; mediaType?: string; mediaUrl?: string | null; fileName?: string | null; fileUrl?: string | null }
) {
  const res = await fetch(`/api/community/${postId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update community post');
  return res.json();
}

export async function togglePostLike(postId: string) {
  const res = await fetch(`/api/community/posts/${postId}/like`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to toggle like');
  return res.json();
}

export async function addPostComment(postId: string, text: string, commentId?: string) {
  const res = await fetch(`/api/community/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, commentId }),
  });
  if (!res.ok) throw new Error('Failed to add comment');
  return res.json();
}

// ─── Smart AI APIs (Powered by Google Gemini 2.5 Flash) ────────────────────────

export async function requestTeamMatchingAI(customStudentData?: {
  name?: string;
  college?: string;
  specialty?: string;
  skills?: string[];
  bio?: string;
}) {
  const res = await fetch('/api/ai/match-team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customStudentData || {}),
  });
  if (!res.ok) throw new Error('AI team matching failed');
  return res.json();
}

export async function requestProjectBreakdownAI(options: {
  teamId?: string;
  teamName?: string;
  projectTitle?: string;
  goal?: string;
  deadlineWeeks?: number;
}) {
  const res = await fetch('/api/ai/project-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  if (!res.ok) throw new Error('AI project assistant breakdown failed');
  return res.json();
}
