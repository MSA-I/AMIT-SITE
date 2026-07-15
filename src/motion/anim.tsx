import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { useStage, stageEdge, isRtl } from './stageContext';

gsap.registerPlugin(ScrollTrigger, SplitText, MorphSVGPlugin);
export { gsap, ScrollTrigger, MorphSVGPlugin };

export const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const EASE = 'power3.out';

/**
 * pct of a vertical 'top N%' start string (fallback 85) so the same prop maps
 * to the horizontal-stage numeric edge: 'top 85%' -> stageEdge(tw, el, 85).
 */
const pctOf = (start: string) => {
  const m = /(\d+(?:\.\d+)?)%\s*$/.exec(start);
  return m ? parseFloat(m[1]) : 85;
};

/**
 * Stage-awareness contract shared by every reveal helper below:
 * - Outside a <HorizontalStage> (or in its vertical fallback) behavior is the
 *   plain vertical trigger, exactly as before.
 * - Inside an ACTIVE horizontal stage the pin tween arrives via context state
 *   one tick after mount; while it is still null the effect SKIPS building
 *   (a vertical-semantics trigger built first would burn `once:true` reveals)
 *   and rebuilds when the tween lands (it is in every deps array).
 * - With the tween live, triggers attach containerAnimation + NUMERIC edges
 *   via stageEdge() (string 'left/right N%' positions break under mirrored
 *   RTL travel; see stageContext.ts).
 */

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
  const { inStage, horizontal, tween } = useStage();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    if (inStage && horizontal && !tween) return; // wait for the pin tween
    const tw = inStage && horizontal ? tween : null;
    const ctx = gsap.context(() => {
      gsap.from(el, {
        y,
        autoAlpha: 0,
        duration: 0.9,
        delay,
        ease: EASE,
        scrollTrigger: tw
          ? {
              trigger: el,
              containerAnimation: tw,
              start: () => stageEdge(tw, el, 85),
              once: true,
            }
          : { trigger: el, start: 'top 85%', once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [y, delay, inStage, horizontal, tween]);
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
  const { inStage, horizontal, tween } = useStage();
  const words = text.split(/\s+/).filter(Boolean);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    if (inStage && horizontal && !tween) return; // wait for the pin tween
    const tw = inStage && horizontal ? tween : null;
    const inner = el.querySelectorAll<HTMLElement>('[data-hl]');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner,
        { opacity: 0.28 },
        {
          opacity: 1,
          ease: 'power3.out',
          stagger: 0.04,
          scrollTrigger: tw
            ? {
                trigger: el,
                containerAnimation: tw,
                start: () => stageEdge(tw, el, 90),
                end: () => stageEdge(tw, el, 45),
                scrub: 0.5,
              }
            : { trigger: el, start: 'top 90%', end: '45% 40%', scrub: 0.5 },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [text, inStage, horizontal, tween]);

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
  const { inStage, horizontal, tween } = useStage();
  const words = text.split(/\s+/).filter(Boolean);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    if (inStage && horizontal && !tween) return; // wait for the pin tween
    const tw = inStage && horizontal ? tween : null;
    const inner = el.querySelectorAll<HTMLElement>('[data-w]');
    const ctx = gsap.context(() => {
      gsap.set(el, { autoAlpha: 1 });
      gsap.from(inner, {
        yPercent: 115,
        duration: 1,
        ease: EASE,
        stagger,
        scrollTrigger: tw
          ? {
              trigger: el,
              containerAnimation: tw,
              start: () => stageEdge(tw, el, pctOf(start)),
              once: true,
            }
          : { trigger: el, start, once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [text, stagger, start, inStage, horizontal, tween]);

  return (
    <Tag ref={ref as never} className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom me-[0.22em]">
          <span data-w className="inline-block will-change-transform">
            {w}
          </span>
          {i < words.length - 1 ? ' ' : ''}
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
  const { inStage, horizontal, tween } = useStage();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    if (inStage && horizontal && !tween) return; // wait for the pin tween
    const tw = inStage && horizontal ? tween : null;
    const rtl =
      typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
    // Fresh trigger vars per tween (numeric stage edges or the vertical string).
    const makeTrigger = (): ScrollTrigger.Vars =>
      tw
        ? {
            trigger: el,
            containerAnimation: tw,
            start: () => stageEdge(tw, el, pctOf(start)),
            once: true,
          }
        : { trigger: el, start, once: true };

    let split: ReturnType<typeof SplitText.create> | null = null;
    const ctx = gsap.context(() => {
      // RTL (or no SplitText): rise the whole block as one. The parent clips
      // (overflow set here so the LTR path is never affected) while inner rises.
      if (rtl || typeof SplitText === 'undefined') {
        const inner = el.querySelector<HTMLElement>('[data-rl-inner]');
        if (inner) {
          el.style.overflow = 'hidden';
          gsap.from(inner, {
            yPercent: 110,
            duration: 1,
            ease: EASE,
            scrollTrigger: makeTrigger(),
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
              scrollTrigger: makeTrigger(),
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
  }, [text, start, inStage, horizontal, tween]);

  return (
    <Tag ref={ref as never} className={className}>
      <span data-rl-inner className="block will-change-transform">
        {text}
      </span>
    </Tag>
  );
}

/**
 * Once-on-enter image reveal (reference data-clip): the figure unclips from
 * the bottom edge (inset 100% -> 0, 1.2s power3.out) while the image rises
 * into place (yPercent 35 -> 0, 1.5s). Stage-aware like the other reveals.
 * Reduced-motion / fallback renders the image static and fully visible.
 */
export function ClipReveal({
  src,
  alt,
  className = '',
  imgClassName = '',
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** first-screen media: load eagerly at high priority instead of lazily */
  eager?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { inStage, horizontal, tween } = useStage();
  useLayoutEffect(() => {
    const el = ref.current;
    const img = imgRef.current;
    if (!el || !img || prefersReduced()) return;
    if (inStage && horizontal && !tween) return; // wait for the pin tween
    const tw = inStage && horizontal ? tween : null;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: tw
          ? {
              trigger: el,
              containerAnimation: tw,
              start: () => stageEdge(tw, el, 85),
              once: true,
            }
          : { trigger: el, start: 'top 85%', once: true },
      });
      tl.fromTo(
        el,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power3.out', immediateRender: true },
        0,
      ).fromTo(
        img,
        { yPercent: 35 },
        { yPercent: 0, duration: 1.5, ease: 'power3.out', immediateRender: true },
        0,
      );
    }, el);
    return () => ctx.revert();
  }, [inStage, horizontal, tween]);
  return (
    <figure ref={ref} className={`overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </figure>
  );
}

/**
 * Parallax an element vertically as the page scrolls. amount = px of travel.
 * Stage-aware: inside an active horizontal stage the vertical drift maps to
 * the pin via numeric containerAnimation edges (a plain vertical trigger
 * would collapse its whole scrub range into the first screen of scroll).
 */
export function useParallax<T extends HTMLElement>(amount = 80) {
  const ref = useRef<T>(null);
  const { inStage, horizontal, tween } = useStage();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    if (inStage && horizontal && !tween) return; // wait for the pin tween
    const tw = inStage && horizontal ? tween : null;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -amount / 10 },
        {
          yPercent: amount / 10,
          ease: 'none',
          scrollTrigger: tw
            ? {
                trigger: el,
                containerAnimation: tw,
                start: () => stageEdge(tw, el, 100),
                end: () => stageEdge(tw, el, 0),
                scrub: true,
              }
            : { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [amount, inStage, horizontal, tween]);
  return ref;
}

/**
 * Horizontal drift (the stage analog of useParallax): xPercent -amount/10 ->
 * +amount/10 scrubbed across the element's pass through the viewport. Inside
 * an active horizontal stage it maps to the pin via numeric containerAnimation
 * edges (enter at the 100% line -> leading edge at the 0% line); outside it
 * uses the vertical top-bottom/bottom-top pattern. RTL negates the direction
 * so the drift always reads with the travel.
 */
export function useDriftX<T extends HTMLElement>(amount = 80) {
  const ref = useRef<T>(null);
  const { inStage, horizontal, tween } = useStage();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    if (inStage && horizontal && !tween) return; // wait for the pin tween
    const tw = inStage && horizontal ? tween : null;
    const dir = isRtl() ? -1 : 1;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { xPercent: (dir * -amount) / 10 },
        {
          xPercent: (dir * amount) / 10,
          ease: 'none',
          scrollTrigger: tw
            ? {
                trigger: el,
                containerAnimation: tw,
                start: () => stageEdge(tw, el, 100),
                end: () => stageEdge(tw, el, 0),
                scrub: true,
              }
            : { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [amount, inStage, horizontal, tween]);
  return ref;
}
