import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useFollowCursor } from '../motion/useFollowCursor';

/** Additive follower dot. Native cursor stays visible (a11y). Off on touch / reduced-motion. */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const { hover, label } = useFollowCursor(wrapRef);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (fine && !reduce) setEnabled(true);
  }, []);

  useLayoutEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;
    gsap.to(dot, {
      width: hover ? 46 : 12,
      height: hover ? 46 : 12,
      duration: 0.4,
      ease: 'power3.out',
    });
  }, [hover]);

  if (!enabled) return null;

  return (
    <div ref={wrapRef} className="cursor-dot" aria-hidden>
      <div
        ref={dotRef}
        className="flex items-center justify-center rounded-full bg-white text-ink"
        style={{ width: 12, height: 12, transform: 'translate(-50%, -50%)' }}
      >
        {hover && label ? (
          <span className="u-label whitespace-nowrap px-2 text-[0.55rem]">{label}</span>
        ) : null}
      </div>
    </div>
  );
}
