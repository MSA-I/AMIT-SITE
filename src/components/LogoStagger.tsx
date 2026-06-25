import { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReduced } from '../motion/anim';

/**
 * Logo wordmark with a per-letter assemble entrance.
 * Each glyph sits in an overflow-hidden mask; the inner span slides in from the
 * leading edge (right edge in RTL) on mount. Spaces between words are preserved.
 * Hebrew is non-connecting, so per-letter spans are safe for both scripts.
 */
export default function LogoStagger({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const inner = el.querySelectorAll<HTMLElement>('[data-glyph]');
    const rtl = document.documentElement.dir === 'rtl';
    const ctx = gsap.context(() => {
      gsap.from(inner, {
        xPercent: rtl ? -120 : 120,
        stagger: { each: 0.06, from: rtl ? 'end' : 'start' },
        ease: 'power3.out',
        duration: 0.9,
      });
    }, el);
    return () => ctx.revert();
  }, [text]);

  const chars = Array.from(text);

  return (
    <span ref={ref} className={`inline-flex ${className}`} aria-label={text}>
      {chars.map((ch, i) =>
        ch === ' ' ? (
          <span key={i} aria-hidden className="inline-block">
            &nbsp;
          </span>
        ) : (
          <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
            <span data-glyph className="inline-block will-change-transform">
              {ch}
            </span>
          </span>
        )
      )}
    </span>
  );
}
