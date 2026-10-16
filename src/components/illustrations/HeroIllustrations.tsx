import React from 'react';

// Shared SVG components for the 3 small illustrations

export function PeerLearningSVG({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="200" height="200" rx="24" fill="#FEE4B3" />
      {/* Niqabi Woman (Left) */}
      <path d="M70 180 C70 120, 30 110, 30 180 Z" fill="#1E2A3A" /> {/* Abaya */}
      <circle cx="65" cy="85" r="22" fill="#1E2A3A" /> {/* Head/Niqab */}
      <path d="M43 85 Q65 110 87 85 L87 110 Q65 130 43 110 Z" fill="#1E2A3A" /> {/* Niqab drape */}
      
      {/* Woman with visible hair (Right) */}
      <path d="M130 180 C130 130, 170 130, 170 180 Z" fill="#F97316" /> {/* Clothing */}
      <circle cx="135" cy="95" r="20" fill="#EDBA96" /> {/* Face (Faceless) */}
      <path d="M115 95 C115 70, 155 70, 155 105 C145 125, 115 115, 115 95 Z" fill="#4A3B32" /> {/* Hair */}
      
      {/* Interaction/Speech */}
      <path d="M95 110 L110 110" stroke="#1E2A3A" strokeWidth="4" strokeLinecap="round" />
      <path d="M90 125 L115 125" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function InnovationSVG({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="200" height="200" rx="24" fill="#FDDCAA" />
      {/* Young Man */}
      <path d="M100 200 C100 130, 40 140, 40 200 Z" fill="#2D2F7E" /> {/* Modest Shirt */}
      <circle cx="85" cy="100" r="22" fill="#EDBA96" /> {/* Face (Faceless) */}
      <path d="M63 100 C63 75, 107 75, 107 100 C107 85, 63 85, 63 100 Z" fill="#2C1E16" /> {/* Hair */}
      
      {/* Lightbulb (Innovation) */}
      <circle cx="140" cy="70" r="16" fill="#F97316" />
      <path d="M132 82 L148 82 L145 92 L135 92 Z" fill="#1E2A3A" />
      <path d="M140 50 L140 40 M160 70 L170 70 M120 70 L110 70 M154 56 L161 49 M126 56 L119 49" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function FemaleTeamSVG({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="200" height="200" rx="24" fill="#FFF8F0" />
      {/* Table */}
      <rect x="20" y="140" width="160" height="10" rx="5" fill="#1E2A3A" />
      <rect x="40" y="150" width="8" height="50" fill="#1E2A3A" />
      <rect x="152" y="150" width="8" height="50" fill="#1E2A3A" />
      
      {/* Woman 1 (Left) */}
      <path d="M50 140 C50 90, 10 100, 10 140 Z" fill="#14B8A6" /> {/* Abaya */}
      <circle cx="45" cy="75" r="18" fill="#EDBA96" /> {/* Face */}
      <path d="M25 75 Q45 45 65 75 Q65 110 45 110 Q25 110 25 75 Z" fill="#F97316" /> {/* Hijab */}
      
      {/* Woman 2 (Center) */}
      <path d="M100 140 C100 80, 60 90, 60 140 Z" fill="#2D2F7E" /> {/* Abaya */}
      <circle cx="95" cy="65" r="18" fill="#EDBA96" /> {/* Face */}
      <path d="M75 65 Q95 35 115 65 Q115 100 95 100 Q75 100 75 65 Z" fill="#FEE4B3" /> {/* Hijab */}
      
      {/* Woman 3 (Right) */}
      <path d="M150 140 C150 90, 190 100, 190 140 Z" fill="#1E2A3A" /> {/* Abaya */}
      <circle cx="155" cy="75" r="18" fill="#EDBA96" /> {/* Face */}
      <path d="M135 75 Q155 45 175 75 Q175 110 155 110 Q135 110 135 75 Z" fill="#14B8A6" /> {/* Hijab */}
      
      {/* Project/Documents on table */}
      <rect x="80" y="130" width="30" height="10" rx="2" fill="#F97316" />
      <rect x="120" y="132" width="20" height="8" rx="2" fill="#FDDCAA" />
    </svg>
  );
}
