import { useRef, useLayoutEffect } from 'react';
import { gsap, ScrollTrigger, prefersReduced } from './anim';
import { useStage, stageEdge } from './stageContext';

// anim.tsx registers ScrollTrigger; re-register here (idempotent) so the
// dependency is explicit and the plugin is guaranteed for this scrubbed reveal.
gsap.registerPlugin(ScrollTrigger);

export type FlipVariant = 'upDown' | 'downUp' | 'leftRight' | 'rightLeft';

// clip-path inset() = inset(top right bottom left); 100% on a side hides from
// that side, so animating it to 0 sweeps the reveal across from that edge.
const FROM: Record<FlipVariant, string> = {
  upDown: 'inset(100% 0% 0% 0%)',   // reveal top -> down
  downUp: 'inset(0% 0% 100% 0%)',   // reveal bottom -> up
  leftRight: 'inset(0% 100% 0% 0%)', // reveal left -> right
  rightLeft: 'inset(0% 0% 0% 100%)', // reveal right -> left
};

// Two-layer mode: the TOP layer wipes itself away toward the variant's edge
// (inset(top right bottom left); left:100% removes it left -> right).
// 101% overshoot: ending exactly at 100% leaves a sub-pixel sliver of the top
// image lingering at the figure edge through the scrub tail, which shimmers
// while scrolling (user-reported flicker); the extra 1% clears it early.
const TOP_OUT: Record<'leftRight' | 'rightLeft', string> = {
  leftRight: 'inset(0% 0% 0% 101%)', // top wiped away left -> right
  rightLeft: 'inset(0% 101% 0% 0%)', // top wiped away right -> left
};

export interface FlipMediaProps {
  src: string;
  alt: string;
  /**
   * Optional TOP layer (two-layer flip): renders above `src` and scrubs away
   * (yPercent slide for upDown/downUp, clip wipe for leftRight/rightLeft)
   * while the under image counter-moves from scale 1.2 into place. Always
   * pass `alt2` with it. Reduced-motion hides this layer and shows `src`.
   */
  src2?: string;
  alt2?: string;
  className?: string;
  imgClassName?: string;
  /** first-screen media: load both layers eagerly at high priority */
  eager?: boolean;
  /** reveal direction (default upDown). leftRight/rightLeft auto-mirror in RTL. */
  variant?: FlipVariant;
  /** disable RTL auto-mirroring of horizontal variants */
  rtlAware?: boolean;
  /**
   * Defaults to the enclosing <HorizontalStage> pin tween (context). Only the
   * stage tween gets numeric stageEdge() positions (its RTL travel is
   * mirrored); an explicitly passed foreign tween/timeline keeps the string
   * 'top 85%'/'top 35%' path unchanged.
   */
  containerAnimation?: gsap.core.Tween | gsap.core.Timeline;
}

/**
 * Reference image-reveal: scrubs a clip-path inset wipe on the figure while
 * gently scaling the image down to 1. Degrades to a fully visible static image
 * under reduced motion. Inside a horizontal (pinned) stage the trigger maps to
 * the shared pin tween automatically (no extra pin, both directions).
 *
 * NOTE: the figure carries its own `relative` (anchor for the top layer), so
 * never pass `absolute` via className - it silently loses the specificity
 * tie and the figure falls into normal flow (verified bug in PanelDark).
 * Wrap FlipMedia in a positioned div instead (see PanelImages/PanelDark).
 */
export default function FlipMedia({
  src,
  alt,
  src2,
  alt2,
  className = '',
  imgClassName = '',
  eager = false,
  variant = 'upDown',
  rtlAware = true,
  containerAnimation,
}: FlipMediaProps) {
  const figureRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const topRef = useRef<HTMLElement>(null);
  const { inStage, horizontal, tween } = useStage();

  useLayoutEffect(() => {
    const figure = figureRef.current;
    const img = imgRef.current;
    if (!figure || !img || prefersReduced()) return;
    // Inside an active horizontal stage the pin tween arrives via context one
    // tick later; skip until it lands (deps rebuild) so a vertical-semantics
    // trigger is never built first.
    if (inStage && horizontal && !tween && !containerAnimation) return;
    const stageTween = inStage && horizontal ? tween : null;
    const ca = containerAnimation ?? stageTween ?? undefined;
    // Numeric page-scroll edges only for the stage pin tween (mirrored RTL
    // travel breaks string positions); foreign tweens keep the string path.
    const numeric = ca && ca === stageTween ? stageTween : null;

    // Mirror horizontal sweeps so the reveal always reads from the leading edge.
    let v = variant;
    if (rtlAware && document.documentElement.dir === 'rtl') {
      if (v === 'leftRight') v = 'rightLeft';
      else if (v === 'rightLeft') v = 'leftRight';
    }

    const top = topRef.current;

    const ctx = gsap.context(() => {
      const trigger = (): ScrollTrigger.Vars =>
        numeric
          ? {
              trigger: figure,
              containerAnimation: numeric,
              start: () => stageEdge(numeric, figure, 85),
              end: () => stageEdge(numeric, figure, 35),
              scrub: true,
            }
          : {
              trigger: figure,
              start: 'top 85%',
              end: 'top 35%',
              scrub: true,
              containerAnimation: ca,
            };

      if (src2 && top) {
        // Two-layer flip (reference setFlips): the TOP layer scrubs out while
        // the under image counter-moves from an overscaled offset into place.
        if (v === 'upDown' || v === 'downUp') {
          const out = v === 'upDown' ? -105 : 105;
          const counter = v === 'upDown' ? -10 : 10;
          gsap.fromTo(
            top,
            { yPercent: 0 },
            { yPercent: out, ease: 'none', scrollTrigger: trigger() }
          );
          gsap.fromTo(
            img,
            { scale: 1.2, yPercent: counter },
            { scale: 1, yPercent: 0, ease: 'none', scrollTrigger: trigger() }
          );
        } else {
          gsap.fromTo(
            top,
            { clipPath: 'inset(0% 0% 0% 0%)' },
            { clipPath: TOP_OUT[v], ease: 'none', scrollTrigger: trigger() }
          );
          gsap.fromTo(
            img,
            { scale: 1.2 },
            { scale: 1, ease: 'none', scrollTrigger: trigger() }
          );
        }
        return;
      }

      // Single-src: the original clip-in reveal, unchanged.
      gsap.fromTo(
        figure,
        { clipPath: FROM[v] },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: trigger() }
      );

      gsap.fromTo(
        img,
        { scale: 1.08 },
        { scale: 1, ease: 'none', scrollTrigger: trigger() }
      );
    }, figure);

    return () => ctx.revert();
  }, [containerAnimation, variant, rtlAware, src2, inStage, horizontal, tween]);

  // Reduced-motion: the primary (src) image shows fully; the top layer that
  // only exists to animate away is never rendered.
  const showTop = !!src2 && !prefersReduced();

  return (
    <figure ref={figureRef} className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
      {showTop && (
        <figure ref={topRef} data-flip-top className="absolute inset-0 overflow-hidden">
          <img
            src={src2}
            alt={alt2 ?? ''}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : undefined}
            className="h-full w-full object-cover"
          />
        </figure>
      )}
    </figure>
  );
}
