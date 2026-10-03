import React from 'react';

interface OrbiXLogoProps {
  className?: string;
  showIconOnly?: boolean;
}

export const OrbiXLogo: React.FC<OrbiXLogoProps> = ({
  className = 'h-5 w-auto text-white',
  showIconOnly = false,
}) => {
  if (showIconOnly) {
    return (
      <svg
        id="orbix-icon-mark"
        viewBox="0 0 56 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="OrbiX Symbol"
      >
        <defs>
          <linearGradient id="orbix-icon-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="orbix-icon-ring" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.2" />
            <stop offset="60%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id="orbix-icon-core" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Orbital Trajectory Arc (Back) */}
        <path
          d="M8 20 C6 30, 20 40, 36 38 C48 36, 52 26, 48 18"
          stroke="url(#orbix-icon-ring)"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Central Planetary/Orbital Core */}
        <circle cx="27" cy="24" r="10" fill="url(#orbix-icon-core)" />
        <circle cx="27" cy="24" r="10" stroke="#10B981" strokeWidth="1.2" fill="none" opacity="0.5" />
        <path
          d="M27 14 A 10 10 0 0 1 37 24 A 10 7.5 0 0 1 27 31.5 A 10 10 0 0 0 27 14 Z"
          fill="#064E3B"
          opacity="0.3"
        />

        {/* Orbital Trajectory Arc (Front) */}
        <path
          d="M5 27 C13 12, 35 8, 49 15 C53 17, 55 20, 53 23 C47 32, 29 35, 13 30"
          stroke="url(#orbix-icon-glow)"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Satellite Node / Orbital Beacon */}
        <circle cx="49" cy="15" r="2.75" fill="#34D399" />
        <circle cx="49" cy="15" r="4.5" stroke="#34D399" strokeWidth="0.75" fill="none" opacity="0.6" />
      </svg>
    );
  }

  return (
    <svg
      id="orbix-official-logo"
      viewBox="0 0 250 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="OrbiX Logo"
    >
      <defs>
        <linearGradient id="orbix-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id="orbix-ring" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
        <linearGradient id="orbix-core" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#E0F2FE" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {/* --- ORBITAL ICON GLYPH --- */}
      <g transform="translate(2, 0)">
        {/* Orbital Trajectory Arc (Back) */}
        <path
          d="M8 20 C6 30, 20 40, 36 38 C48 36, 52 26, 48 18"
          stroke="url(#orbix-ring)"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Central Planetary Core */}
        <circle cx="27" cy="24" r="10" fill="url(#orbix-core)" />
        <circle cx="27" cy="24" r="10" stroke="#10B981" strokeWidth="1.2" fill="none" opacity="0.5" />
        <path
          d="M27 14 A 10 10 0 0 1 37 24 A 10 7.5 0 0 1 27 31.5 A 10 10 0 0 0 27 14 Z"
          fill="#064E3B"
          opacity="0.3"
        />

        {/* Orbital Trajectory Arc (Front) */}
        <path
          d="M5 27 C13 12, 35 8, 49 15 C53 17, 55 20, 53 23 C47 32, 29 35, 13 30"
          stroke="url(#orbix-glow)"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Satellite Node / Orbital Beacon */}
        <circle cx="49" cy="15" r="2.75" fill="#34D399" />
        <circle cx="49" cy="15" r="4.5" stroke="#34D399" strokeWidth="0.75" fill="none" opacity="0.6" />
      </g>

      {/* --- TYPOGRAPHIC WORDMARK: ORBIX --- */}
      {/* Letter O */}
      <g transform="translate(68, 8)">
        <path
          d="M17 0 C7.6 0, 0 7.2, 0 16 C0 24.8, 7.6 32, 17 32 C26.4 32, 34 24.8, 34 16 C34 7.2, 26.4 0, 17 0 Z M17 6.8 C22.5 6.8, 26.5 10.9, 26.5 16 C26.5 21.1, 22.5 25.2, 17 25.2 C11.5 25.2, 7.5 21.1, 7.5 16 C7.5 10.9, 11.5 6.8, 17 6.8 Z"
          fill="currentColor"
        />
      </g>

      {/* Letter R */}
      <g transform="translate(108, 8)">
        <path
          d="M0 0 H18 C24 0, 28 3.5, 28 9 C28 13.5, 25 16.5, 20.5 17.5 L29 32 H20.5 L12.8 18.5 H7.2 V32 H0 V0 Z M7.2 6.2 V12.8 H17.2 C19.8 12.8, 21.2 11.4, 21.2 9.5 C21.2 7.6, 19.8 6.2, 17.2 6.2 H7.2 Z"
          fill="currentColor"
        />
      </g>

      {/* Letter B */}
      <g transform="translate(144, 8)">
        <path
          d="M0 0 H16.5 C22.5 0, 26 2.8, 26 7 C26 10, 24 12, 20.8 13 C24.8 14.2, 27.2 16.8, 27.2 21 C27.2 26.2, 23 32, 16 32 H0 V0 Z M7.2 6 V12 H15 C17.5 12, 19 10.8, 19 9 C19 7.2, 17.5 6, 15 6 H7.2 Z M7.2 18 V26 H15.5 C18.2 26, 20 24.5, 20 22 C20 19.5, 18.2 18, 15.5 18 H7.2 Z"
          fill="currentColor"
        />
      </g>

      {/* Letter I */}
      <g transform="translate(178, 8)">
        <path d="M0 0 H7.2 V32 H0 V0 Z" fill="currentColor" />
      </g>

      {/* Letter X with Aerospace Orbital Trajectory Slash */}
      <g transform="translate(193, 8)">
        {/* Main descending diagonal */}
        <path
          d="M2.5 0 H10.5 L28 32 H20 L2.5 0 Z"
          fill="currentColor"
        />
        {/* Secondary ascending diagonal segments */}
        <path
          d="M25.5 0 H17.5 L12.5 9.2 L17 17.5 L25.5 0 Z"
          fill="currentColor"
        />
        <path
          d="M10.8 20.8 L3.5 32 H11.8 L15.5 25.2 L10.8 20.8 Z"
          fill="currentColor"
        />
        {/* Dynamic emerald trajectory arc sweeping across the X */}
        <path
          d="M-4 28 C6 24, 22 14, 38 4"
          stroke="url(#orbix-glow)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Supersonic vector needle */}
        <polygon points="36,1 42,4 38,9" fill="#10B981" />
      </g>
    </svg>
  );
};

// Backwards compatibility alias
export { OrbiXLogo as SpaceXLogo };
