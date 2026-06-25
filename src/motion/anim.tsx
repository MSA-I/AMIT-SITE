import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);
export { gsap, ScrollTrigger };

export const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const EASE = 'power3.out';

/** Fade + rise a block as it enters the viewport. */
export function Reveal({
  children,
  className = '',
  y = 28,
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'span' | 'figure';
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.from(el, {
        y,
        autoAlpha: 0,
        duration: 0.9,
        delay,
        ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [y, delay]);
  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}

/** Word-by-word masked rise reveal for big editorial headlines. */
export function RevealText({
  text,
  className = '',
  as: Tag = 'h2',
  stagger = 0.05,
  start = 'top 85%',
}: {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(/\s+/).filter(Boolean);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const inner = el.querySelectorAll<HTMLElement>('[data-w]');
    const ctx = gsap.context(() => {
      gsap.set(el, { autoAlpha: 1 });
      gsap.from(inner, {
        yPercent: 115,
        duration: 1,
        ease: EASE,
        stagger,
        scrollTrigger: { trigger: el, start, once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [text, stagger, start]);

  return (
    <Tag ref={ref as never} className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom me-[0.22em]">
          <span data-w className="inline-block will-change-transform">
            {w}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}

/**
 * Line-by-line masked rise reveal using GSAP SplitText.
 * Only splits for LTR + motion-allowed; RTL or reduced-motion renders plain
 * text untouched so Hebrew bidi never breaks. Degrades gracefully if SplitText
 * is unavailable.
 */
export function RevealLines({
  text,
  className = '',
  as: Tag = 'h2',
  start = 'top 85%',
}: {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const isRtl =
      typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
    if (isRtl || prefersReduced()) return;
    if (typeof SplitText === 'undefined') return;

    let split: ReturnType<typeof SplitText.create> | null = null;
    const ctx = gsap.context(() => {
      try {
        split = SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              stagger: 0.08,
              duration: 1,
              ease: EASE,
              scrollTrigger: { trigger: el, start, once: true },
            }),
        });
      } catch {
        /* fall back to plain text on any SplitText failure */
      }
    }, el);
    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [text, start]);

  return (
    <Tag ref={ref as never} className={className}>
      {text}
    </Tag>
  );
}

/** Parallax an element vertically as the page scrolls. amount = px of travel. */
export function useParallax<T extends HTMLElement>(amount = 80) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -amount / 10 },
        {
          yPercent: amount / 10,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [amount]);
  return ref;
}
