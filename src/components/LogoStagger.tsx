import { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReduced } from '../motion/anim';

/**
 * SlideChars - controllable per-character slide-in (the reference preloader's
 * pl-char technique). Every glyph sits in a clipped mask (`charClassName`,
 * default `.pl-char` from index.css: inline-block + overflow-x clip; the
 * inner span gets inline-block + will-change via `.pl-char > span`) and the
 * inner [data-glyph] span slides in from `from` on the x axis.
 *
 * With `paused` it renders the masked markup ONLY - the owner animates the
 * [data-glyph] spans itself (the Preloader drives them inside its own
 * gsap.context/timeline for exact reference choreography). Without `paused`
 * it self-runs on mount and fires `onComplete`; under reduced-motion the
 * text renders static and `onComplete` fires immediately so gates never hang.
 *
 * Spaces render as unmasked &nbsp; spans so word gaps are preserved.
 */
export function SlideChars({
  text,
  className = '',
  charClassName = 'pl-char',
  stagger = 0.1,
  duration = 0.5,
  from = '120%',
  paused = false,
  onComplete,
}: {
  text: string;
  className?: string;
  charClassName?: string;
  stagger?: number;
  duration?: number;
  from?: string;
  paused?: boolean;
  onComplete?: () => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // keep the effect deps stable when the owner passes an inline callback
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    if (paused) return; // owner-driven: markup only
    const el = ref.current;
    if (!el) return;
    const glyphs = el.querySelectorAll<HTMLElement>('[data-glyph]');
    if (prefersReduced() || glyphs.length === 0) {
      onCompleteRef.current?.();
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        glyphs,
        { x: from },
        {
          x: '0%',
          duration,
          stagger,
          ease: 'power3.out',
          onComplete: () => onCompleteRef.current?.(),
        }
      );
    }, el);
    return () => ctx.revert();
  }, [text, paused, from, duration, stagger]);

  const chars = Array.from(text);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {chars.map((ch, i) =>
        ch === ' ' ? (
          <span key={i} aria-hidden className="inline-block">
            &nbsp;
          </span>
        ) : (
          <span key={i} aria-hidden className={charClassName}>
            <span data-glyph>{ch}</span>
          </span>
        )
      )}
    </span>
  );
}

/**
 * Logo wordmark with a per-letter assemble entrance (back-compat export,
 * currently unused). Each glyph sits in an overflow-hidden mask; the inner
 * span slides in from the leading edge (right edge in RTL) on mount. Spaces
 * between words are preserved. Hebrew is non-connecting, so per-letter spans
 * are safe for both scripts.
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
