import { ImageResponse } from 'next/og';

export const size = {
  width: 64,
  height: 64,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1A237E',
          borderRadius: 14,
        }}
      >
        <svg
          width="52"
          height="52"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield outline */}
          <path
            d="M32 4L8 16V32C8 46.4 18.4 59.2 32 62C45.6 59.2 56 46.4 56 32V16L32 4Z"
            fill="#283593"
            stroke="#5C6BC0"
            strokeWidth="1.5"
          />

          {/* Hard hat dome */}
          <path
            d="M20 30C20 22.3 25.4 18 32 18C38.6 18 44 22.3 44 30H20Z"
            fill="#FF9800"
          />
          {/* Hard hat brim */}
          <path
            d="M17 30C17 29 18 28.5 19 28.5H45C46 28.5 47 29 47 30V31.5C47 32.5 46 33 45 33H19C18 33 17 32.5 17 31.5V30Z"
            fill="#F57C00"
          />
          {/* Hard hat ridge */}
          <path
            d="M32 18V28.5"
            stroke="#E65100"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Checkmark */}
          <path
            d="M24 42L29 47L40 36"
            stroke="#4CAF50"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
