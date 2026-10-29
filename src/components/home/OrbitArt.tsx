// Standalone illustrated icons for the orbiting hero items. Each is a 120x120 SVG
// with no background, so it floats directly on the page.
import type { ReactNode } from "react";

type ArtProps = { className?: string };

function Icon({ children, className }: { children: ReactNode } & ArtProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function InfoArt({ className }: ArtProps) {
  return (
    <Icon className={className}>
      <g transform="rotate(-14 56 60)">
        <path d="M24 48 L80 24 L80 96 L24 72 Z" fill="#2F6BFF" />
        <path d="M24 48 L80 24 L80 40 L24 58 Z" fill="#5C8DFF" />
        <rect x="10" y="46" width="18" height="28" rx="6" fill="#FFD93D" />
        <path d="M32 72 L40 98 L54 98 L47 76 Z" fill="#1E4FD8" />
        <rect x="78" y="20" width="10" height="80" rx="5" fill="#0F2E8A" />
      </g>
      <path
        d="M96 36 q10 -8 20 -4"
        stroke="#FF7A2F"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M98 56 q12 0 18 6"
        stroke="#FF7A2F"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    </Icon>
  );
}

export function SystemsArt({ className }: ArtProps) {
  return (
    <Icon className={className}>
      <rect x="8" y="16" width="104" height="74" rx="8" fill="#1A1A1A" />
      <rect x="14" y="22" width="92" height="62" rx="4" fill="#F4F4F2" />
      <circle cx="22" cy="29" r="2.6" fill="#FF5F57" />
      <circle cx="30" cy="29" r="2.6" fill="#FEBC2E" />
      <circle cx="38" cy="29" r="2.6" fill="#28C840" />
      <rect x="20" y="36" width="24" height="42" rx="3" fill="#7B61FF" />
      <rect x="48" y="36" width="52" height="18" rx="3" fill="#FF7A2F" />
      <rect x="48" y="58" width="24" height="20" rx="3" fill="#2F6BFF" />
      <rect x="76" y="58" width="24" height="20" rx="3" fill="#FFD93D" />
      <rect x="50" y="90" width="20" height="14" fill="#2B2B2B" />
      <rect x="34" y="102" width="52" height="8" rx="4" fill="#1A1A1A" />
    </Icon>
  );
}

export function VleArt({ className }: ArtProps) {
  return (
    <Icon className={className}>
      <path
        d="M10 78 Q60 62 60 82 Q60 62 110 78 L110 108 Q60 92 60 112 Q60 92 10 108 Z"
        fill="#FFD93D"
      />
      <path d="M60 82 L60 112" stroke="#E5A200" strokeWidth="3" />
      <path d="M60 10 L116 34 L60 58 L4 34 Z" fill="#1A1A1A" />
      <path d="M28 44 L28 62 Q60 80 92 62 L92 44 L60 58 Z" fill="#333" />
      <path d="M108 37 L108 62" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" />
      <circle cx="108" cy="66" r="6" fill="#FF3B30" />
    </Icon>
  );
}

export function PortalArt({ className }: ArtProps) {
  return (
    <Icon className={className}>
      <rect x="10" y="8" width="84" height="100" rx="12" fill="#FF4D4D" />
      <rect x="18" y="16" width="68" height="84" rx="7" fill="#fff" />
      <circle cx="52" cy="38" r="12" fill="#FFE1D6" />
      <circle cx="52" cy="35" r="5" fill="#FF4D4D" />
      <path d="M43 47 q9 -9 18 0" fill="#FF4D4D" />
      <rect x="28" y="58" width="48" height="8" rx="4" fill="#EDEDEA" />
      <rect x="28" y="70" width="48" height="8" rx="4" fill="#EDEDEA" />
      <rect x="36" y="84" width="32" height="9" rx="4.5" fill="#1A1A1A" />
      <g transform="rotate(-35 92 88)">
        <circle cx="92" cy="88" r="12" fill="none" stroke="#FFC400" strokeWidth="7" />
        <rect x="102" y="85" width="22" height="7" rx="3.5" fill="#FFC400" />
        <rect x="116" y="90" width="5" height="9" rx="2" fill="#FFC400" />
      </g>
    </Icon>
  );
}

export function MaxhubArt({ className }: ArtProps) {
  return (
    <Icon className={className}>
      <rect x="8" y="10" width="104" height="66" rx="7" fill="#1B1640" />
      <rect x="14" y="16" width="92" height="54" rx="3" fill="#5B3FD9" />
      <circle cx="60" cy="58" r="5" fill="#fff" />
      <path
        d="M46 58 a14 14 0 0 1 28 0"
        stroke="#fff"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M36 58 a24 24 0 0 1 48 0"
        stroke="#fff"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      <rect x="55" y="76" width="10" height="16" fill="#1B1640" />
      <rect x="6" y="88" width="44" height="28" rx="4" fill="#1B1640" />
      <rect x="10" y="92" width="36" height="20" rx="1.5" fill="#8C7BFF" />
      <rect x="90" y="82" width="22" height="36" rx="5" fill="#1B1640" />
      <rect x="93" y="86" width="16" height="26" rx="1.5" fill="#FF7A2F" />
    </Icon>
  );
}

export function ProjectorArt({ className }: ArtProps) {
  return (
    <Icon className={className}>
      <defs>
        <linearGradient id="orbit-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFD93D" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFD93D" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path d="M62 72 L114 30 L114 104 Z" fill="url(#orbit-beam)" />
      <rect x="92" y="34" width="24" height="56" rx="3" fill="#2F6BFF" />
      <rect x="96" y="40" width="16" height="12" rx="2" fill="#fff" />
      <rect x="96" y="56" width="12" height="4" rx="2" fill="#FFD93D" />
      <rect x="4" y="54" width="70" height="40" rx="11" fill="#1A1A1A" />
      <circle cx="58" cy="74" r="13" fill="#3A3A3A" />
      <circle cx="58" cy="74" r="8" fill="#9FC1FF" />
      <circle cx="55" cy="71" r="2.5" fill="#fff" />
      <rect x="14" y="64" width="24" height="4" rx="2" fill="#4A4A4A" />
      <rect x="14" y="72" width="16" height="4" rx="2" fill="#4A4A4A" />
      <rect x="12" y="94" width="10" height="7" rx="2" fill="#1A1A1A" />
      <rect x="56" y="94" width="10" height="7" rx="2" fill="#1A1A1A" />
    </Icon>
  );
}

export function CloudArt({ className }: ArtProps) {
  return (
    <Icon className={className}>
      <defs>
        <linearGradient id="orbit-cloud" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2F6BFF" />
          <stop offset="1" stopColor="#58C7FA" />
        </linearGradient>
      </defs>
      <path
        d="M30 84 a24 24 0 0 1 2 -47.6 a32 32 0 0 1 60 -4 a26 26 0 0 1 2 51.6 Z"
        fill="url(#orbit-cloud)"
      />
      <rect x="36" y="48" width="16" height="24" rx="3" fill="#fff" />
      <rect x="56" y="42" width="16" height="30" rx="3" fill="#FFD93D" />
      <rect x="76" y="52" width="14" height="20" rx="3" fill="#28C840" />
      <path
        d="M60 90 L60 114 M49 104 L60 115 L71 104"
        stroke="#2F6BFF"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function HelpdeskArt({ className }: ArtProps) {
  return (
    <Icon className={className}>
      <path
        d="M18 74 a42 42 0 0 1 84 0"
        stroke="#1A1A1A"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="6" y="66" width="24" height="40" rx="11" fill="#1A1A1A" />
      <rect x="90" y="66" width="24" height="40" rx="11" fill="#1A1A1A" />
      <path
        d="M102 106 q0 12 -26 12"
        stroke="#1A1A1A"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M40 26 h50 a10 10 0 0 1 10 10 v16 a10 10 0 0 1 -10 10 h-32 l-12 10 v-10 h-6 a10 10 0 0 1 -10 -10 v-16 a10 10 0 0 1 10 -10 Z"
        fill="#FF8A00"
      />
      <circle cx="53" cy="44" r="4" fill="#fff" />
      <circle cx="65" cy="44" r="4" fill="#fff" />
      <circle cx="77" cy="44" r="4" fill="#fff" />
    </Icon>
  );
}
