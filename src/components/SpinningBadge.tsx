/**
 * SpinningBadge - a rotating circular text badge ("AMIT BAR · INTERIOR DESIGN")
 * like the ring on Amit's real site. Each glyph is placed around the circle by
 * angle (no <textPath>, which proved unreliable here), then the whole ring spins
 * via CSS. Pauses on hover, respects prefers-reduced-motion. Colour follows
 * currentColor (ink on light, cream on dark via data-theme).
 */
const TEXT = 'AMIT BAR · INTERIOR DESIGN · ';
const R = 40; // text radius within the 0..100 viewBox

export default function SpinningBadge({
  size = 120,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  const chars = [...TEXT];

  return (
    <div
      className={`spinning-badge group ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="spinning-badge-svg" style={{ width: '100%', height: '100%' }}>
        <g
          fill="currentColor"
          style={{ fontFamily: 'var(--ui)', fontSize: '7.6px', fontWeight: 500, letterSpacing: '0.02em' }}
        >
          {chars.map((ch, i) => {
            const angle = (i / chars.length) * 360;
            return (
              <text
                key={i}
                x="50"
                y={50 - R}
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${angle} 50 50)`}
              >
                {ch}
              </text>
            );
          })}
        </g>
        {/* center sage accent dot */}
        <circle cx="50" cy="50" r="2.4" className="fill-sage" />
      </svg>
      <style>{`
        .spinning-badge { display: inline-block; color: var(--color-ink); }
        [data-theme="ink"] .spinning-badge { color: var(--color-cream); }
        .spinning-badge-svg { animation: spinning-badge-rotate 22s linear infinite; transform-origin: center; }
        .spinning-badge:hover .spinning-badge-svg { animation-play-state: paused; }
        @keyframes spinning-badge-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .spinning-badge-svg { animation: none; }
        }
      `}</style>
    </div>
  );
}
