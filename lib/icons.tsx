import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function Jebena({ size = 48, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Spout */}
      <path
        d="M30 40 Q10 35 8 28 Q6 20 18 22 Q22 23 26 30"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Handle */}
      <path
        d="M70 38 Q90 38 90 52 Q90 66 70 66"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Body */}
      <ellipse cx="48" cy="70" rx="28" ry="32" stroke={color} strokeWidth="3.5" fill="none" />
      {/* Neck */}
      <path
        d="M38 38 Q40 25 48 22 Q56 25 58 38"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Lid */}
      <ellipse cx="48" cy="20" rx="10" ry="4" stroke={color} strokeWidth="3" fill="none" />
      {/* Knob */}
      <circle cx="48" cy="15" r="3" fill={color} />
      {/* Base ring */}
      <ellipse cx="48" cy="102" rx="20" ry="5" stroke={color} strokeWidth="2.5" fill="none" />
      {/* Body to base */}
      <path d="M28 98 Q30 102 48 102 Q66 102 68 98" stroke={color} strokeWidth="2.5" fill="none" />
    </svg>
  );
}

export function EthiopianCross({ size = 48, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="44" y="10" width="12" height="80" rx="2" fill={color} />
      <rect x="10" y="44" width="80" height="12" rx="2" fill={color} />
      <rect x="35" y="35" width="30" height="30" rx="2" fill={color} />
      <rect x="40" y="15" width="20" height="20" rx="1" fill={color} opacity="0.7" />
      <rect x="40" y="65" width="20" height="20" rx="1" fill={color} opacity="0.7" />
      <rect x="15" y="40" width="20" height="20" rx="1" fill={color} opacity="0.7" />
      <rect x="65" y="40" width="20" height="20" rx="1" fill={color} opacity="0.7" />
    </svg>
  );
}

export function Bean({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <ellipse cx="12" cy="12" rx="7" ry="10" stroke={color} strokeWidth="2" fill="none" transform="rotate(-20 12 12)" />
      <path
        d="M8 8 Q12 12 8 16"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        transform="rotate(-20 12 12)"
      />
    </svg>
  );
}

export function Star({ size = 20, filled = false, color = 'currentColor', className = '' }: IconProps & { filled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}

export function SteamAnimation({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M30 70 Q25 55 30 40 Q35 25 30 10"
        stroke="#D4845A"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
        style={{ animation: 'steam 3s ease-in-out infinite' }}
      />
      <path
        d="M60 70 Q55 50 60 35 Q65 20 60 5"
        stroke="#C9A961"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
        style={{ animation: 'steam 3s ease-in-out infinite 1s' }}
      />
      <path
        d="M90 70 Q85 55 90 40 Q95 25 90 10"
        stroke="#D4845A"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
        style={{ animation: 'steam 3s ease-in-out infinite 0.5s' }}
      />
    </svg>
  );
}
