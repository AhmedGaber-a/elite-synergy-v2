'use client'
import React, { createContext, useContext, useState } from 'react'

interface Project {
  title: string
  description: string
  filename: string
}

interface OnboardingState {
  email: string
  skills: string[]
  customSkill: string
  projects: Project[]
  cvFilename: string | null
}

interface OnboardingContextType {
  state: OnboardingState
  updateState: (updates: Partial<OnboardingState>) => void
  reset: () => void
}

const defaultState: OnboardingState = {
  email: '',
  skills: [],
  customSkill: '',
  projects: [],
  cvFilename: null,
}

const OnboardingContext = createContext<OnboardingContextType>({
  state: defaultState,
  updateState: () => {},
  reset: () => {},
})

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>(defaultState)

  const updateState = (updates: Partial<OnboardingState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const reset = () => setState(defaultState)

  return (
    <OnboardingContext.Provider value={{ state, updateState, reset }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export const useOnboarding = () => useContext(OnboardingContext)
