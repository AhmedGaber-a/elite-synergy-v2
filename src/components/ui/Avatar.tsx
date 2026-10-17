import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

export type AvatarType = 'male' | 'female' | 'auto'

interface AvatarProps {
  src?: string
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  avatarType?: AvatarType | string
  className?: string
}

const sizes = {
  xs: { outer: 'w-6 h-6', text: 'text-[9px]' },
  sm: { outer: 'w-8 h-8', text: 'text-xs' },
  md: { outer: 'w-10 h-10', text: 'text-sm' },
  lg: { outer: 'w-14 h-14', text: 'text-lg' },
  xl: { outer: 'w-20 h-20', text: 'text-2xl' },
}

export function detectAvatarType(name: string): 'male' | 'female' {
  const normalized = name.toLowerCase().trim()
  if (
    normalized.includes('mohamed') ||
    normalized.includes('mohammed') ||
    normalized.includes('ahmed') ||
    normalized.includes('omar') ||
    normalized.includes('youssef') ||
    normalized.includes('محمد') ||
    normalized.includes('أحمد') ||
    normalized.includes('عمر') ||
    normalized.includes('يوسف')
  ) {
    return 'male'
  }
  return 'female'
}

// Standard Female Avatar
export function FemaleSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="50" fill="#FCE7F3" />
      {/* Blouse */}
      <path d="M18 100 C18 70, 32 66, 50 66 C68 66, 82 70, 82 100 Z" fill="#BE185D" />
      {/* V-neck / Collar */}
      <path d="M42 66 L50 78 L58 66 Z" fill="#FDF2F8" />
      {/* Faceless head */}
      <ellipse cx="50" cy="45" rx="16" ry="19" fill="#E5B995" />
      {/* Hair */}
      <path d="M28 44 C28 22, 38 18, 50 18 C62 18, 72 22, 72 44 C72 58, 68 62, 68 62 C63 46, 61 36, 50 36 C39 36, 37 46, 32 62 C32 62, 28 58, 28 44 Z" fill="#1F2937" />
    </svg>
  )
}

// Backward-compatibility aliases pointing to standard female avatar
export const HijabSvg = FemaleSvg
export const NiqabSvg = FemaleSvg

// Standard Male Avatar
export function MaleSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="50" fill="#E2E8F0" />
      {/* Shirt */}
      <path d="M18 100 C18 70, 32 66, 50 66 C68 66, 82 70, 82 100 Z" fill="#1E3A8A" />
      {/* Collar */}
      <path d="M42 66 L50 78 L58 66 Z" fill="#F8FAFC" />
      {/* Faceless head */}
      <ellipse cx="50" cy="45" rx="17" ry="20" fill="#E5B995" />
      {/* Hair (neat, dark) */}
      <path d="M31 38 C31 22, 40 18, 50 18 C60 18, 69 22, 69 38 C65 30, 58 26, 50 26 C42 26, 35 30, 31 38 Z" fill="#1F2937" />
    </svg>
  )
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function Avatar({ src, name, size = 'md', avatarType = 'auto', className }: AvatarProps) {
  const s = sizes[size]
  const rawType = avatarType === 'auto' ? detectAvatarType(name) : avatarType
  const resolvedType = (rawType === 'female' || rawType === 'hijab' || rawType === 'niqab') ? 'female' : 'male'

  const isImageSrc = Boolean(src && (src.startsWith('data:') || src.startsWith('/') || src.startsWith('http') || src.includes('.')));
  if (isImageSrc && src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', s.outer, className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div className={cn('relative rounded-full overflow-hidden flex-shrink-0 select-none shadow-sm', s.outer, className)} title={name}>
      {resolvedType === 'female' ? (
        <FemaleSvg className="w-full h-full" />
      ) : resolvedType === 'male' ? (
        <MaleSvg className="w-full h-full" />
      ) : (
        <div className={cn('w-full h-full flex items-center justify-center font-bold text-white bg-brand-orange', s.text)}>
          {getInitials(name)}
        </div>
      )}
    </div>
  )
}
