'use client'
import React, { createContext, useContext, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  avatar: string
  specialty: string
  skills: string[]
  college: string
  points: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string, extra?: Partial<User>) => void
  logout: () => void
}

const MOCK_USER: User = {
  id: '1',
  name: 'Ahmed',
  email: 'ahmed@fa-hists.edu.eg',
  avatar: '/assets/avatars/avatar-user.svg',
  specialty: 'Cloud Architect',
  skills: ['Cloud Architecture', 'AWS', 'Linux Administration'],
  college: 'BIS',
  points: 300,
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (email: string, _password: string, extra?: Partial<User>) => {
    // Mock login — accepts any credentials
    setUser({ ...MOCK_USER, email, ...(extra || {}) })
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
