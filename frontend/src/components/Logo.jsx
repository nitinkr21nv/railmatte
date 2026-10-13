import React from 'react';

/**
 * RailMatte Official Brand Logo
 * Motif: Railway tracks intersecting with dual reciprocal exchange arrows.
 * Exact wordmark: "RailMatte"
 * Exact tagline: "Swap seats. Travel better."
 */
export function LogoMark({ className = 'w-8 h-8', light = false }) {
  const trackColor = light ? '#94A3B8' : '#0B1329';
  const tealAccent = '#0D9488';
  const arrowSecondary = light ? '#38BDF8' : '#0284C7';

  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background circle badge */}
      <rect width="40" height="40" rx="10" fill={light ? '#1E293B' : '#F1F5F9'} />

      {/* Parallel railway rails */}
      <path
        d="M10 26L30 26"
        stroke={trackColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M10 14L30 14"
        stroke={trackColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Railway ties */}
      <path d="M15 11L15 29" stroke={trackColor} strokeWidth="1.75" strokeLinecap="round" />
      <path d="M25 11L25 29" stroke={trackColor} strokeWidth="1.75" strokeLinecap="round" />

      {/* Interlocking exchange arrows */}
      {/* Top arrow moving right */}
      <path
        d="M12 18H28M28 18L24 15M28 18L24 21"
        stroke={tealAccent}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom arrow moving left */}
      <path
        d="M28 22H12M12 22L16 19M12 22L16 25"
        stroke={arrowSecondary}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({ showTagline = true, light = false, compact = false }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <LogoMark className={compact ? 'w-8 h-8' : 'w-10 h-10'} light={light} />
      <div className="flex flex-col text-left">
        <span
          className={`font-bold tracking-tight ${compact ? 'text-lg' : 'text-xl'} ${
            light ? 'text-white' : 'text-slate-900'
          }`}
        >
          Rail<span className="text-teal-600">Matte</span>
        </span>
        {showTagline && (
          <span
            className={`text-[10px] tracking-wide font-medium ${
              light ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Swap seats. Travel better.
          </span>
        )}
      </div>
    </div>
  );
}
