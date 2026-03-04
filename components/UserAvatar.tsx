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
        gender === 'male' ? 'bg-blue-500' : 'bg-pink-400',
        className
      )}
      style={{ width: size, height: size }}
    >
      {gender === 'male' ? (
        <MaleSymbol size={size} />
      ) : (
        <FemaleSymbol size={size} />
      )}
    </div>
  );
}

/** ♂ Mars / Male symbol — arrow pointing upper-right from a circle */
function MaleSymbol({ size }: { size: number }) {
  return (
    <svg
      width={size * 0.6}
      height={size * 0.6}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle */}
      <circle
        cx="20"
        cy="28"
        r="13"
        stroke="white"
        strokeWidth="3.5"
        fill="none"
      />
      {/* Arrow shaft */}
      <line
        x1="29.5"
        y1="18.5"
        x2="40"
        y2="8"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Arrow head */}
      <polyline
        points="32,8 40,8 40,16"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** ♀ Venus / Female symbol — cross below a circle */
function FemaleSymbol({ size }: { size: number }) {
  return (
    <svg
      width={size * 0.55}
      height={size * 0.65}
      viewBox="0 0 40 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle */}
      <circle
        cx="20"
        cy="17"
        r="13"
        stroke="white"
        strokeWidth="3.5"
        fill="none"
      />
      {/* Vertical line */}
      <line
        x1="20"
        y1="30"
        x2="20"
        y2="46"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Horizontal cross */}
      <line
        x1="12"
        y1="39"
        x2="28"
        y2="39"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
