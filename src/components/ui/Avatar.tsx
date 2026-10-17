import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

export type AvatarType = 'niqab' | 'hijab' | 'male' | 'female' | 'auto'

interface AvatarProps {
  src?: string
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  avatarType?: AvatarType
  className?: string
}

const sizes = {
  xs: { outer: 'w-6 h-6', text: 'text-[9px]' },
  sm: { outer: 'w-8 h-8', text: 'text-xs' },
  md: { outer: 'w-10 h-10', text: 'text-sm' },
  lg: { outer: 'w-14 h-14', text: 'text-lg' },
  xl: { outer: 'w-20 h-20', text: 'text-2xl' },
}

export function detectAvatarType(name: string): 'niqab' | 'hijab' | 'male' {
  const normalized = name.toLowerCase().trim()
  if (normalized.includes('mariem') || normalized.includes('مريم')) {
    return 'niqab'
  }
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
  // All other female students wear hijab (basmalha, dooa, raneem, malak, rahma, nada, rania, shahd, etc.)
  return 'hijab'
}

// Faceless Niqab Avatar (Mariem ahmed)
export function NiqabSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="50" fill="#242B35" />
      {/* Abaya shoulders */}
      <path d="M15 100 C15 70, 30 65, 50 65 C70 65, 85 70, 85 100 Z" fill="#181E27" />
      {/* Head/Khimar base */}
      <ellipse cx="50" cy="42" rx="28" ry="32" fill="#1A202C" />
      {/* Faceless Eye slit band (warm skin tone) */}
      <path d="M33 38 Q50 36 67 38 Q67 45 50 45 Q33 45 33 38 Z" fill="#E8B896" />
      {/* Upper forehead band */}
      <path d="M30 35 Q50 32 70 35 L70 38 Q50 36 30 38 Z" fill="#111620" />
      {/* Niqab drape over mouth & nose */}
      <path d="M28 43 Q50 46 72 43 C72 65, 68 85, 50 85 C32 85, 28 65, 28 43 Z" fill="#141923" />
    </svg>
  )
}

// Faceless Hijab Avatar (basmalha, Dooa, Raneem, Malak, Rahma, Nada, Rania, Shahd)
export function HijabSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="50" fill="#FEE7D6" />
      {/* Modest Abaya/Dress */}
      <path d="M18 100 C18 72, 32 68, 50 68 C68 68, 82 72, 82 100 Z" fill="#E07A5F" />
      {/* Hijab wrap */}
      <path d="M24 45 C24 22, 35 15, 50 15 C65 15, 76 22, 76 45 C76 72, 68 82, 50 82 C32 82, 24 72, 24 45 Z" fill="#3D5A80" />
      {/* Inner cap under-scarf */}
      <path d="M34 38 Q50 30 66 38 Z" fill="#EE6C4D" />
      {/* Faceless skin area */}
      <ellipse cx="50" cy="46" rx="15" ry="17" fill="#F2CC8F" />
      {/* Scarf fold across neck */}
      <path d="M32 60 Q50 72 68 60 Q50 78 32 60 Z" fill="#293241" />
    </svg>
  )
}

// Faceless Male Avatar (Mohamed hamada, Dr. Romany)
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
  const resolvedType = avatarType === 'auto' ? detectAvatarType(name) : avatarType

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
      {resolvedType === 'niqab' ? (
        <NiqabSvg className="w-full h-full" />
      ) : resolvedType === 'hijab' || resolvedType === 'female' ? (
        <HijabSvg className="w-full h-full" />
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
