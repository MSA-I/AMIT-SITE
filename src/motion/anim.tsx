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

/**
 * Scroll word-highlight: the words fade from faint to full ink as the block
 * scrolls through the viewport (the reference's scrubbed paragraph effect).
 * Word-level split keeps it bidi-safe for Hebrew + English. Reduced-motion /
 * no-JS leaves the text at full opacity (the resting CSS state).
 */
export function RevealHighlight({
  text,
  as: Tag = 'p',
  className = '',
}: {
  text: string;
  as?: 'p' | 'h2' | 'div';
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(/\s+/).filter(Boolean);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const inner = el.querySelectorAll<HTMLElement>('[data-hl]');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner,
        { opacity: 0.28 },
        {
          opacity: 1,
          ease: 'power3.out',
          stagger: 0.04,
          scrollTrigger: { trigger: el, start: 'top 90%', end: '45% 40%', scrub: 0.5 },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [text]);

  // manual word split (no SplitText) keeps the element free of an aria-label and bidi-safe
  return (
    <Tag ref={ref as never} className={className}>
      {words.map((w, i) => (
        <span data-hl key={i}>
          {i < words.length - 1 ? w + ' ' : w}
        </span>
      ))}
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
 * Line masked-rise reveal.
 * LTR + motion: GSAP SplitText line-by-line stagger.
 * RTL + motion: a single bidi-safe whole-block mask rise (SplitText line
 *   splitting is skipped for Hebrew to avoid breaking bidi), so Hebrew still
 *   gets the signature reveal.
 * Reduced-motion / SplitText-unavailable: plain static text.
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
    if (!el || prefersReduced()) return;
    const isRtl =
      typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

    let split: ReturnType<typeof SplitText.create> | null = null;
    const ctx = gsap.context(() => {
      // RTL (or no SplitText): rise the whole block as one. The parent clips
      // (overflow set here so the LTR path is never affected) while inner rises.
      if (isRtl || typeof SplitText === 'undefined') {
        const inner = el.querySelector<HTMLElement>('[data-rl-inner]');
        if (inner) {
          el.style.overflow = 'hidden';
          gsap.from(inner, {
            yPercent: 110,
            duration: 1,
            ease: EASE,
            scrollTrigger: { trigger: el, start, once: true },
          });
        }
        return;
      }
      // LTR: split into lines and stagger.
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
      <span data-rl-inner className="block will-change-transform">
        {text}
      </span>
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
