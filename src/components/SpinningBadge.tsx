import { useI18n } from '../i18n/context';

/**
 * SpinningBadge - A circular spinning text badge with "AMIT BAR - INTERIOR DESIGN" text.
 * Uses CSS animation for constant rotation, pauses on hover and respects prefers-reduced-motion.
 * Size and className can be customized via props.
 */
export default function SpinningBadge({
  size = 120,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  const { lang } = useI18n();

  // Hebrew and English text versions
  const text = lang === 'he'
    ? 'AMIT BAR - INTERIOR DESIGN - AMIT BAR - INTERIOR DESIGN - '
    : 'AMIT BAR - INTERIOR DESIGN - AMIT BAR - INTERIOR DESIGN - ';

  return (
    <div
      className={`spinning-badge group ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        className="spinning-badge-svg"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <path
            id="spinning-badge-path"
            d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            fill="none"
          />
        </defs>
        <text
          className="spinning-badge-text"
          fill="currentColor"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '8.5px',
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          <textPath href="#spinning-badge-path" startOffset="0%">
            {text}
          </textPath>
        </text>
        {/* Center dot accent */}
        <circle cx="50" cy="50" r="3" className="fill-sage" />
      </svg>
      <style>{`
        .spinning-badge {
          display: inline-block;
          color: var(--color-ink);
        }
        [data-theme="ink"] .spinning-badge {
          color: var(--color-cream);
        }
        .spinning-badge-svg {
          animation: spinning-badge-rotate 20s linear infinite;
        }
        .spinning-badge:hover .spinning-badge-svg {
          animation-play-state: paused;
        }
        @keyframes spinning-badge-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .spinning-badge-svg {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
