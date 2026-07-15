import React, { useRef, useLayoutEffect, useState } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import { localePath } from '../lib/paths';
import { gsap, prefersReduced } from '../motion/anim';
import { useStage, stageEdge } from '../motion/stageContext';

/** Signature easing curve (mirrors the `--ease-out-expo` CSS token). For Framer/GSAP arrays. */
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export const Container: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...p }) => (
  <div className={`mx-auto w-full max-w-[1600px] px-5 sm:px-6 md:px-10 ${className}`} {...p} />
);

export const Section: React.FC<React.HTMLAttributes<HTMLElement> & { id?: string }> = ({
  className = '',
  ...p
}) => <section className={`py-20 sm:py-24 md:py-36 ${className}`} {...p} />;

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
          <span key={i} className="mx-6 inline-flex items-center gap-6 font-display text-xl sm:text-2xl md:text-4xl">
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
export const btnSolidInv = `${base} rounded-full bg-cream px-7 py-3.5 text-ink hover:bg-sage hover:text-cream`;
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

/**
 * CornerMark - recurring decorative rotated brand stamp (the reference's "is BORING(R)" mark).
 * Static 180deg; under motion it drifts a few degrees on scroll. aria-hidden, inherits color.
 * Stage-aware (MOTION API contract): inside an active horizontal stage the
 * drift scrubs against the pin tween via numeric stageEdge positions; the
 * effect skips while the tween has not landed yet. Outside a stage (vertical
 * pages) the plain vertical trigger builds exactly as before.
 */
export const CornerMark: React.FC<{ word: string; className?: string }> = ({ word, className = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const { inStage, horizontal, tween } = useStage();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    if (inStage && horizontal && !tween) return; // wait for the pin tween
    const tw = inStage && horizontal ? tween : null;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { rotation: 172 },
        {
          rotation: 188,
          ease: 'none',
          scrollTrigger: tw
            ? {
                trigger: el,
                containerAnimation: tw,
                start: () => stageEdge(tw, el, 100),
                end: () => stageEdge(tw, el, 0),
                scrub: true,
              }
            : { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [inStage, horizontal, tween]);
  return (
    <span
      ref={ref}
      aria-hidden
      className={`pointer-events-none select-none font-display ${className}`}
      style={{ transform: 'rotate(180deg)' }}
    >
      {word}
      <span className="align-top text-sage" style={{ fontSize: '0.45em' }}>®</span>
    </span>
  );
};

/**
 * FillButton - pill button/link whose ink fill sweeps in from the edge the
 * pointer entered (and exits toward the edge it leaves). Pure GSAP transform on
 * an absolute fill layer; under reduced motion the fill is omitted and a plain
 * hover color is used. Renders a LangLink when `to` is set, else a <button>.
 */
export const FillButton: React.FC<{
  children: React.ReactNode;
  to?: string;
  onClick?: () => void;
  className?: string;
  fillClass?: string;
  hoverTextClass?: string;
  ariaLabel?: string;
}> = ({
  children,
  to,
  onClick,
  className = '',
  fillClass = 'bg-ink',
  hoverTextClass = 'text-cream',
  ariaLabel,
}) => {
  const fillRef = useRef<HTMLSpanElement>(null);
  const [filled, setFilled] = useState(false);

  const edge = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const d = [x, r.width - x, y, r.height - y];
    const m = Math.min(...d);
    if (m === d[0]) return { x: -101, y: 0 };
    if (m === d[1]) return { x: 101, y: 0 };
    if (m === d[2]) return { x: 0, y: -101 };
    return { x: 0, y: 101 };
  };
  const enter = (e: React.PointerEvent<HTMLElement>) => {
    setFilled(true);
    const f = fillRef.current;
    if (!f) return;
    // reduced motion: snap the fill in so the (re-coloured) label stays readable
    if (prefersReduced()) {
      gsap.set(f, { xPercent: 0, yPercent: 0 });
      return;
    }
    const { x, y } = edge(e);
    gsap.set(f, { xPercent: x, yPercent: y });
    gsap.to(f, { xPercent: 0, yPercent: 0, duration: 0.5, ease: 'power3.out' });
  };
  const leave = (e: React.PointerEvent<HTMLElement>) => {
    setFilled(false);
    const f = fillRef.current;
    if (!f) return;
    if (prefersReduced()) {
      gsap.set(f, { xPercent: 0, yPercent: 101 });
      return;
    }
    const { x, y } = edge(e);
    gsap.to(f, { xPercent: x, yPercent: y, duration: 0.5, ease: 'power3.out' });
  };

  const cls = `group relative inline-flex items-center justify-center overflow-hidden rounded-full ${className}`;
  const inner = (
    <>
      <span
        ref={fillRef}
        aria-hidden
        className={`absolute inset-0 ${fillClass}`}
        style={{ transform: 'translate(0, 101%)' }}
      />
      <span className={`relative z-10 transition-colors duration-300 ${filled ? hoverTextClass : ''}`}>
        {children}
      </span>
    </>
  );

  if (to) {
    return (
      <LangLink to={to} className={cls} onPointerEnter={enter} onPointerLeave={leave} onClick={onClick} aria-label={ariaLabel}>
        {inner}
      </LangLink>
    );
  }
  return (
    <button type="button" className={cls} onPointerEnter={enter} onPointerLeave={leave} onClick={onClick} aria-label={ariaLabel}>
      {inner}
    </button>
  );
};
