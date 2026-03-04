'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  gender: 'male' | 'female';
  size?: number;
  className?: string;
}

export function UserAvatar({ gender, size = 40, className }: UserAvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full overflow-hidden shrink-0 flex items-center justify-center',
        gender === 'male' ? 'bg-blue-100' : 'bg-pink-50',
        className
      )}
      style={{ width: size, height: size }}
    >
      {gender === 'male' ? (
        <MaleAvatar size={size} />
      ) : (
        <FemaleAvatar size={size} />
      )}
    </div>
  );
}

function MaleAvatar({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body / Shirt */}
      <path
        d="M10 72 C10 56, 24 48, 40 48 C56 48, 70 56, 70 72 L70 80 L10 80 Z"
        fill="#1A237E"
      />
      {/* Shirt collar */}
      <path
        d="M32 48 L40 56 L48 48"
        stroke="#0D1545"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Neck */}
      <rect x="34" y="40" width="12" height="10" rx="4" fill="#D4A574" />

      {/* Head */}
      <ellipse cx="40" cy="30" rx="16" ry="18" fill="#D4A574" />

      {/* Hair */}
      <path
        d="M24 28 C24 16, 30 10, 40 10 C50 10, 56 16, 56 28 C56 22, 52 14, 40 14 C28 14, 24 22, 24 28 Z"
        fill="#3E2723"
      />
      {/* Hair sides */}
      <path
        d="M24 28 C22 24, 23 18, 26 14"
        stroke="#3E2723"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M56 28 C58 24, 57 18, 54 14"
        stroke="#3E2723"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Eyes */}
      <ellipse cx="34" cy="30" rx="2.5" ry="3" fill="#2C1810" />
      <ellipse cx="46" cy="30" rx="2.5" ry="3" fill="#2C1810" />
      {/* Eye highlights */}
      <circle cx="35" cy="29" r="1" fill="white" opacity="0.8" />
      <circle cx="47" cy="29" r="1" fill="white" opacity="0.8" />

      {/* Eyebrows */}
      <path d="M30 25 Q34 23 38 25" stroke="#3E2723" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M42 25 Q46 23 50 25" stroke="#3E2723" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Nose */}
      <path d="M40 32 Q38 36, 40 37 Q42 36, 40 32" fill="#C49A6C" />

      {/* Mouth - friendly smile */}
      <path d="M35 40 Q40 44 45 40" stroke="#A0674B" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Ears */}
      <ellipse cx="24" cy="30" rx="3" ry="4" fill="#D4A574" />
      <ellipse cx="56" cy="30" rx="3" ry="4" fill="#D4A574" />
    </svg>
  );
}

function FemaleAvatar({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body / Blouse */}
      <path
        d="M10 72 C10 56, 24 48, 40 48 C56 48, 70 56, 70 72 L70 80 L10 80 Z"
        fill="#1A237E"
      />
      {/* Blouse neckline */}
      <path
        d="M32 48 Q36 54, 40 54 Q44 54, 48 48"
        stroke="#0D1545"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Neck */}
      <rect x="35" y="40" width="10" height="10" rx="4" fill="#E0B08A" />

      {/* Head */}
      <ellipse cx="40" cy="30" rx="15" ry="17" fill="#E0B08A" />

      {/* Long Hair - back layer */}
      <path
        d="M22 28 C20 40, 20 56, 24 64 C26 60, 24 40, 25 30"
        fill="#4A2C1A"
      />
      <path
        d="M58 28 C60 40, 60 56, 56 64 C54 60, 56 40, 55 30"
        fill="#4A2C1A"
      />

      {/* Hair top */}
      <path
        d="M25 28 C25 14, 31 8, 40 8 C49 8, 55 14, 55 28 C55 20, 50 12, 40 12 C30 12, 25 20, 25 28 Z"
        fill="#4A2C1A"
      />

      {/* Hair front fringe */}
      <path
        d="M27 24 C28 18, 32 14, 36 16 C34 20, 30 22, 27 24 Z"
        fill="#5D3A22"
      />
      <path
        d="M53 24 C52 18, 48 14, 44 16 C46 20, 50 22, 53 24 Z"
        fill="#5D3A22"
      />

      {/* Hair sides flowing */}
      <path
        d="M24 30 C22 36, 21 46, 22 54 C23 50, 23 38, 24 30 Z"
        fill="#5D3A22"
      />
      <path
        d="M56 30 C58 36, 59 46, 58 54 C57 50, 57 38, 56 30 Z"
        fill="#5D3A22"
      />

      {/* Eyes */}
      <ellipse cx="34" cy="30" rx="2.5" ry="3" fill="#2C1810" />
      <ellipse cx="46" cy="30" rx="2.5" ry="3" fill="#2C1810" />
      {/* Eye highlights */}
      <circle cx="35" cy="29" r="1" fill="white" opacity="0.8" />
      <circle cx="47" cy="29" r="1" fill="white" opacity="0.8" />

      {/* Eyelashes */}
      <path d="M30 27 Q32 25 34 27" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M46 27 Q48 25 50 27" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" fill="none" />

      {/* Eyebrows - softer */}
      <path d="M30.5 25 Q34 23.5 37 25.5" stroke="#4A2C1A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M43 25.5 Q46 23.5 49.5 25" stroke="#4A2C1A" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Nose */}
      <path d="M40 32 Q38.5 35.5, 40 36.5 Q41.5 35.5, 40 32" fill="#CFA07A" />

      {/* Mouth - soft smile with lips */}
      <path d="M35 39.5 Q40 43.5 45 39.5" stroke="#C97070" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M36 39 Q40 41 44 39" fill="#D98888" opacity="0.4" />

      {/* Blush */}
      <circle cx="29" cy="36" r="3" fill="#F8A4A4" opacity="0.25" />
      <circle cx="51" cy="36" r="3" fill="#F8A4A4" opacity="0.25" />

      {/* Ears (partially hidden by hair) */}
      <ellipse cx="25" cy="30" rx="2.5" ry="3.5" fill="#E0B08A" />
      <ellipse cx="55" cy="30" rx="2.5" ry="3.5" fill="#E0B08A" />

      {/* Small earrings */}
      <circle cx="25" cy="34" r="1.5" fill="#FFD700" opacity="0.7" />
      <circle cx="55" cy="34" r="1.5" fill="#FFD700" opacity="0.7" />
    </svg>
  );
}
