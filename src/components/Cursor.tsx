import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { prefersReduced } from '../motion/anim';
import { useI18n } from '../i18n/context';

/**
 * Reference-style cursor: a single white difference-blend dot that lerps after
 * the pointer (see reference main.js initCursor). Hovering anything inside a
 * [data-cursor="explore"] zone grows it into a labelled "explore" disc via the
 * .is-explore class. Additive only - the native cursor stays for a11y; off on
 * touch / reduced-motion. Visuals live in .cursor-dot (src/index.css, z 80).
 */
const LERP = 0.18;

export default function Cursor() {
  const { t } = useI18n();
  const dotRef = useRef<HTMLDivElement>(null);

  // Gate once, lazily (SSR-safe): fine pointer + hover capable + motion OK.
  const [enabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !prefersReduced(),
  );

  useEffect(() => {
    const dot = dotRef.current;
    if (!enabled || !dot) return;

    // Follow: targets from mousemove, position eased toward them each tick.
    // Hidden until the first real pointer position - otherwise a lone
    // difference dot floats dead-centre on every fresh load.
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;
    let seen = false;
    dot.style.opacity = '0';

    const setX = gsap.quickSetter(dot, 'x', 'px');
    const setY = gsap.quickSetter(dot, 'y', 'px');
    setX(x);
    setY(y);

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!seen) {
        // snap to the pointer (no lerp-from-centre) and reveal
        seen = true;
        x = tx;
        y = ty;
        setX(x);
        setY(y);
        dot.style.opacity = '1';
      }
    };
    const tick = () => {
      x += (tx - x) * LERP;
      y += (ty - y) * LERP;
      setX(x);
      setY(y);
    };

    // Grow: document-level delegation on [data-cursor="explore"] zones.
    const zoneOf = (target: EventTarget | null) =>
      target instanceof Element ? target.closest('[data-cursor="explore"]') : null;

    const onOver = (e: PointerEvent) => {
      if (zoneOf(e.target)) dot.classList.add('is-explore');
    };
    const onOut = (e: PointerEvent) => {
      const zone = zoneOf(e.target);
      if (!zone) return;
      // Only shrink when the pointer actually left the zone (not moving
      // between its children).
      const rel = e.relatedTarget;
      if (!(rel instanceof Node) || !zone.contains(rel)) dot.classList.remove('is-explore');
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      gsap.ticker.remove(tick);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={dotRef} className="cursor-dot" aria-hidden>
      <span>{t.cursor.explore}</span>
    </div>
  );
}
