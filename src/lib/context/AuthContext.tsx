// src/lib/context/AuthContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  fullName: string;
  email: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  image?: string | null;
  avatarType?: 'male' | 'female' | string;
  specialty?: string;
  role?: string;
  userRole?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  college?: string;
  discipline?: string | null;
  points: number;
  skills: string[];
  bio?: string | null;
  resumeUrl?: string | null;
  age?: number | null;
  address?: string | null;
  languages?: Array<{ name: string; level: number }> | null;
  toolSkills?: Array<{ name: string; level: number }> | null;
  extraSkills?: string[];
  socialLinks?: { x?: string; linkedin?: string; facebook?: string; github?: string } | null;
  isAvailable?: boolean;
  matchScore?: number | null;
  isVerified: boolean;
  priorProjects?: Array<{
    id: string;
    title: string;
    desc: string;
    skill: string;
    emoji: string;
    uploadDate: string;
    source: string;
    fileUrl?: string | null;
  }>;
  platformProjects?: Array<{
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
    status: string;
    badge: string;
  }>;
  teamMemberships?: Array<{
    id: string;
    teamId: string;
    role: string;
    domain: string;
    team: {
      id: string;
      name: string;
      slug?: string | null;
      emoji: string;
      project?: {
        id: string;
        title: string;
        domain: string;
      } | null;
    };
  }>;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; unverified?: boolean; notRegistered?: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
  updateUser: () => {},
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('elite_user');
        if (cached) {
          return JSON.parse(cached);
        }
      } catch {
        // ignore cache parse failure
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hydrate user session from /api/auth/me on initial mount
  const refreshUser = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers,
        cache: 'no-store',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('elite_user', JSON.stringify(data.user));
          }
          return;
        }
      } else if (res.status === 401) {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('elite_user');
          localStorage.removeItem('token');
        }
        return;
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
      // If a cached user already exists in localStorage, keep it as fallback cache
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem('elite_user');
          if (cached) {
            setUser(JSON.parse(cached));
          }
        } catch {
          // ignore parse error
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const updateUser = useCallback((updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updatedData };
      if (typeof window !== 'undefined') {
        localStorage.setItem('elite_user', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      // The server may answer with a non-JSON page (e.g. a crash page from the host).
      // Read it as text first so we can show a useful message instead of a generic one.
      const raw = await res.text();
      let data: { error?: string; unverified?: boolean; notRegistered?: boolean; user?: User; token?: string } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        return {
          success: false,
          error: `الخادم رجّع رد غير متوقع (${res.status}). لو المشكلة مستمرة، اتأكد من متغيرات البيئة (Environment Variables) على Vercel.`,
        };
      }

      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'فشل تسجيل الدخول',
          unverified: data.unverified || false,
          notRegistered: data.notRegistered || res.status === 404,
        };
      }

      setUser(data.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('elite_user', JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
      }
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'حدث خطأ في الاتصال بالخادم' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('elite_user');
        localStorage.removeItem('token');
      }
      router.push('/auth/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
        updateUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
