import React from 'react'
import { cn } from '@/lib/utils/cn'
import { Badge } from './Badge'

interface SectionHeaderProps {
  label?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center' | 'right'
  className?: string
}

export function SectionHeader({ label, title, subtitle, align = 'center', className }: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
  return (
    <div className={cn(alignClass, className)}>
      {label && <Badge variant="orange" className="mb-3">{label}</Badge>}
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary">{title}</h2>
      {subtitle && <p className="mt-3 text-text-body max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  )
}
