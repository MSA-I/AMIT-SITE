import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
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
