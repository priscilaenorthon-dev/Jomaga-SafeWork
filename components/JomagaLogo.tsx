'use client';

import React from 'react';

interface JomagaLogoProps {
  size?: number;
  className?: string;
}

/**
 * Custom Jomaga SafeWork logo — Hard hat (safety) + Shield (protection) + Checkmark (compliance)
 * Brand colors: Navy #1A237E, Orange #FF9800
 */
export function JomagaLogo({ size = 32, className }: JomagaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield body */}
      <path
        d="M32 4L8 16V32C8 46.4 18.4 59.2 32 62C45.6 59.2 56 46.4 56 32V16L32 4Z"
        fill="white"
        stroke="white"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Shield inner fill with gradient effect */}
      <path
        d="M32 6L10 17V32C10 45.2 19.6 57.2 32 60C44.4 57.2 54 45.2 54 32V17L32 6Z"
        fill="#1A237E"
      />
      {/* Shield highlight */}
      <path
        d="M32 6L10 17V32C10 35 10.6 37.8 11.6 40.4L32 8L52.4 40.4C53.4 37.8 54 35 54 32V17L32 6Z"
        fill="#283593"
        opacity="0.5"
      />

      {/* Hard hat - main dome */}
      <path
        d="M20 30C20 22.3 25.4 18 32 18C38.6 18 44 22.3 44 30H20Z"
        fill="#FF9800"
      />
      {/* Hard hat - brim */}
      <path
        d="M17 30.5C17 29.5 17.8 28.5 19 28.5H45C46.2 28.5 47 29.5 47 30.5V31.5C47 32.5 46.2 33 45 33H19C17.8 33 17 32.5 17 31.5V30.5Z"
        fill="#F57C00"
      />
      {/* Hard hat - ridge line */}
      <path
        d="M32 18V28.5"
        stroke="#E65100"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Hard hat - front detail */}
      <ellipse cx="32" cy="24" rx="4" ry="2" fill="#FFB74D" opacity="0.5" />

      {/* Checkmark below hard hat */}
      <path
        d="M24 42L29 47L40 36"
        stroke="#4CAF50"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Checkmark glow */}
      <path
        d="M24 42L29 47L40 36"
        stroke="#81C784"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  );
}
