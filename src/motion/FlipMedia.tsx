import { useRef, useLayoutEffect } from 'react';
import { gsap, ScrollTrigger, prefersReduced } from './anim';

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

export interface FlipMediaProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** reveal direction (default upDown). leftRight/rightLeft auto-mirror in RTL. */
  variant?: FlipVariant;
  /** disable RTL auto-mirroring of horizontal variants */
  rtlAware?: boolean;
  containerAnimation?: gsap.core.Tween | gsap.core.Timeline;
}

/**
 * Reference image-reveal: scrubs a clip-path inset wipe on the figure while
 * gently scaling the image down to 1. Degrades to a fully visible static image
 * under reduced motion. Pass `containerAnimation` when used inside a horizontal
 * (pinned) scroll track so the trigger maps to that timeline (no extra pin).
 */
export default function FlipMedia({
  src,
  alt,
  className = '',
  imgClassName = '',
  variant = 'upDown',
  rtlAware = true,
  containerAnimation,
}: FlipMediaProps) {
  const figureRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const figure = figureRef.current;
    const img = imgRef.current;
    if (!figure || !img || prefersReduced()) return;

    // Mirror horizontal sweeps so the reveal always reads from the leading edge.
    let v = variant;
    if (rtlAware && document.documentElement.dir === 'rtl') {
      if (v === 'leftRight') v = 'rightLeft';
      else if (v === 'rightLeft') v = 'leftRight';
    }

    const ctx = gsap.context(() => {
      const trigger = {
        trigger: figure,
        start: 'top 85%',
        end: 'top 35%',
        scrub: true,
        containerAnimation,
      } as const;

      gsap.fromTo(
        figure,
        { clipPath: FROM[v] },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { ...trigger } }
      );

      gsap.fromTo(
        img,
        { scale: 1.08 },
        { scale: 1, ease: 'none', scrollTrigger: { ...trigger } }
      );
    }, figure);

    return () => ctx.revert();
  }, [containerAnimation, variant, rtlAware]);

  return (
    <figure ref={figureRef} className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </figure>
  );
}
