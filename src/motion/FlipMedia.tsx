import { useRef, useLayoutEffect } from 'react';
import { gsap, ScrollTrigger, prefersReduced } from './anim';

// anim.tsx registers ScrollTrigger; re-register here (idempotent) so the
// dependency is explicit and the plugin is guaranteed for this scrubbed reveal.
gsap.registerPlugin(ScrollTrigger);

export interface FlipMediaProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
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
  containerAnimation,
}: FlipMediaProps) {
  const figureRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const figure = figureRef.current;
    const img = imgRef.current;
    if (!figure || !img || prefersReduced()) return;

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
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { ...trigger } }
      );

      gsap.fromTo(
        img,
        { scale: 1.08 },
        { scale: 1, ease: 'none', scrollTrigger: { ...trigger } }
      );
    }, figure);

    return () => ctx.revert();
  }, [containerAnimation]);

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
