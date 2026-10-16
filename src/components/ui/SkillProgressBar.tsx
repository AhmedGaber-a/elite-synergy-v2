import React from 'react'

export function SkillProgressBar({ name, level, dark = false }: { name: string; level: number; dark?: boolean }) {
  return (
    <div className="mb-3">
      <div className={`flex justify-between text-xs font-medium mb-1 ${dark ? 'text-white' : 'text-text-primary'}`}>
        <span>{name}</span>
        <span>{level}%</span>
      </div>
      <div className={`h-1.5 rounded-full ${dark ? 'bg-white/20' : 'bg-gray-200'}`}>
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${dark ? 'bg-white' : 'bg-brand-orange'}`}
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  )
}
