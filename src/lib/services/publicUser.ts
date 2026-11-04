// src/lib/services/publicUser.ts
// Fields that are safe to send to other students. Never include passwordHash, email or tokens.
export const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  fullName: true,
  avatar: true,
  avatarType: true,
  role: true,
  college: true,
  specialty: true,
} as const;
