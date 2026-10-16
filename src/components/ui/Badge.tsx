import React from 'react'
import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'orange' | 'navy' | 'teal' | 'blue' | 'green' | 'pink' | 'purple'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'orange', size = 'sm', className }: BadgeProps) {
  const variants = {
    orange: 'bg-brand-orange text-white',
    navy: 'bg-brand-navy text-white',
    teal: 'bg-brand-teal text-white',
    blue: 'bg-brand-blue text-white',
    green: 'bg-green-500 text-white',
    pink: 'bg-pink-500 text-white',
    purple: 'bg-purple-500 text-white',
  }
  const sizeClass = size === 'sm' ? 'text-xs px-3 py-1' : 'text-sm px-4 py-1.5'
  return (
    <span className={cn('inline-flex items-center rounded-full font-semibold', variants[variant], sizeClass, className)}>
      {children}
    </span>
  )
}
