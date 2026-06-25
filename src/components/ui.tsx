import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import { localePath } from '../lib/paths';

export const Container: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...p }) => (
  <div className={`mx-auto w-full max-w-[1600px] px-6 md:px-10 ${className}`} {...p} />
);

export const Section: React.FC<React.HTMLAttributes<HTMLElement> & { id?: string }> = ({
  className = '',
  ...p
}) => <section className={`py-24 md:py-36 ${className}`} {...p} />;

/** small uppercase label with the single sage accent dot */
export const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span className={`inline-flex items-center gap-2.5 u-label ${className}`}>
    <span className="accent-dot" />
    {children}
  </span>
);

/** giant vertical rotated word for section edges */
export const EdgeLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span aria-hidden className={`edge-label u-label ${className}`}>
    {children}
  </span>
);

/** seamless marquee strip (CSS-driven; pauses under reduced-motion) */
export const Marquee: React.FC<{ items: string[]; className?: string }> = ({ items, className = '' }) => (
  <div className={`relative flex overflow-hidden ${className}`} aria-hidden>
    {[0, 1].map((k) => (
      <div key={k} className="flex shrink-0 animate-[marquee_28s_linear_infinite] items-center">
        {items.map((it, i) => (
          <span key={i} className="mx-6 inline-flex items-center gap-6 font-display text-2xl md:text-4xl">
            {it}
            <span className="accent-dot" />
          </span>
        ))}
      </div>
    ))}
  </div>
);

export const LangLink: React.FC<Omit<LinkProps, 'to'> & { to: string }> = ({ to, ...p }) => {
  const { lang } = useI18n();
  return <Link to={localePath(lang, to)} {...p} />;
};

const base =
  'inline-flex items-center justify-center gap-2 text-sm font-medium tracking-wide transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap';

export const btnSolid = `${base} rounded-full bg-ink px-7 py-3.5 text-cream hover:bg-sage`;
export const btnLine =
  'group relative inline-flex items-center gap-2 u-label text-ink transition-colors hover:text-sage';

/**
 * SlideLabel - button text-slide effect (pure CSS, direction-agnostic).
 * Wrap the parent button/link with class "group".
 * At rest: first copy visible; on group-hover: first slides out to -100% y,
 * second slides in from +100% y.
 *
 * Usage:
 *   <button className={`${btnSolid} group overflow-hidden`}>
 *     <SlideLabel>Contact us</SlideLabel>
 *   </button>
 */
export const SlideLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span className={`relative inline-block overflow-hidden leading-none align-middle ${className}`}>
    {/* first copy - visible at rest, exits upward on group-hover */}
    <span className="block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full">
      {children}
    </span>
    {/* second copy - overlaid in the same 1-line box, enters from below on group-hover */}
    <span
      aria-hidden="true"
      className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0"
    >
      {children}
    </span>
  </span>
);
