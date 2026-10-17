// src/lib/context/OnboardingContext.tsx
'use client';
import React, { createContext, useContext, useState } from 'react';

export interface OnboardingProject {
  title: string;
  description: string;
  filename?: string;
  fileUrl?: string;
  skill?: string;
  emoji?: string;
}

export interface OnboardingState {
  name: string;
  fullName: string;
  email: string;
  password: string;
  college: string;
  specialty: string;
  skills: string[];
  customSkill: string;
  languages: Array<{ name: string; level: number }>;
  bio: string;
  projects: OnboardingProject[];
  cvFilename: string | null;
  cvUrl: string | null;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    github?: string;
  };
}

interface OnboardingContextType {
  state: OnboardingState;
  updateState: (updates: Partial<OnboardingState>) => void;
  reset: () => void;
}

const defaultState: OnboardingState = {
  name: '',
  fullName: '',
  email: '',
  password: '',
  college: 'Computer Science',
  specialty: 'Computer Science & Software Systems',
  skills: [],
  customSkill: '',
  languages: [
    { name: 'English', level: 85 },
    { name: 'Arabic', level: 100 },
  ],
  bio: '',
  projects: [],
  cvFilename: null,
  cvUrl: null,
  socialLinks: {},
};

const OnboardingContext = createContext<OnboardingContextType>({
  state: defaultState,
  updateState: () => {},
  reset: () => {},
});

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>(defaultState);

  const updateState = (updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const reset = () => setState(defaultState);

  return (
    <OnboardingContext.Provider value={{ state, updateState, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
