import { useEffect, useState, type RefObject } from 'react';
import { gsap } from 'gsap';

const INTERACTIVE = 'a, button, [data-cursor], input, textarea, select';
const LERP = 0.15;

export type FollowCursor = {
  /** true while the pointer is over an interactive / media element */
  hover: boolean;
  /** optional small label read from the hovered element's data-cursor-label */
  label: string | null;
};

/**
 * Drives a cursor element's transform with a soft lag (lerp) via gsap.quickSetter
 * on the gsap.ticker, and tracks hover state + an optional data-cursor-label.
 * Direction-agnostic. Cleans up its ticker callback + listeners on unmount.
 */
export function useFollowCursor(ref: RefObject<HTMLElement | null>): FollowCursor {
  const [hover, setHover] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const setX = gsap.quickSetter(el, 'x', 'px');
    const setY = gsap.quickSetter(el, 'y', 'px');

    // start off-screen until the first pointer move
    let targetX = -100;
    let targetY = -100;
    let curX = -100;
    let curY = -100;

    const move = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      const t = e.target as Element | null;
      const hit = t?.closest(INTERACTIVE) as HTMLElement | null;
      setHover(!!hit);
      setLabel(hit?.dataset.cursorLabel ?? null);
    };

    const tick = () => {
      curX += (targetX - curX) * LERP;
      curY += (targetY - curY) * LERP;
      setX(curX);
      setY(curY);
    };

    window.addEventListener('mousemove', move, { passive: true });
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener('mousemove', move);
      gsap.ticker.remove(tick);
    };
  }, [ref]);

  return { hover, label };
}
