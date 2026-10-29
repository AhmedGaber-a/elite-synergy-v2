// src/lib/services/authService.ts
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * The secret MUST come from the environment. There is intentionally no
 * hardcoded fallback: a public fallback would let anyone forge valid tokens.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}
const JWT_EXPIRES_IN = '30d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Sign a JWT token for an authenticated user
 */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the authenticated user from an incoming Next.js API Request
 * Supports 'Authorization: Bearer <token>' header or HTTP-only 'token' cookie.
 * Returns null if not authenticated.
 */
export async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    token = req.cookies.get('token')?.value || null;
  }

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload || !payload.userId) {
    return null;
  }

  return await prisma.user.findUnique({
    where: { id: payload.userId },
  });
}
