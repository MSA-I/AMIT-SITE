import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

/**
 * LED trail cursor. A chain of glowing sage dots follows the pointer with a
 * soft lag: the head tracks the mouse, each dot trails the one ahead, so it
 * strings into a comet-like LED tail when moving and collapses to one glow when
 * still. Additive only (native cursor stays for a11y); off on touch /
 * reduced-motion.
 */
const COUNT = 16;
const LERP = 0.3;

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (fine && !reduce) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dots = dotsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!dots.length) return;

    const setters = dots.map((d) => {
      gsap.set(d, { xPercent: -50, yPercent: -50 });
      return { x: gsap.quickSetter(d, 'x', 'px'), y: gsap.quickSetter(d, 'y', 'px') };
    });
    const pts = dots.map(() => ({ x: -100, y: -100 }));
    let mx = -100;
    let my = -100;

    const move = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const tick = () => {
      let px = mx;
      let py = my;
      for (let i = 0; i < pts.length; i++) {
        pts[i].x += (px - pts[i].x) * LERP;
        pts[i].y += (py - pts[i].y) * LERP;
        setters[i].x(pts[i].x);
        setters[i].y(pts[i].y);
        px = pts[i].x;
        py = pts[i].y;
      }
    };

    window.addEventListener('mousemove', move, { passive: true });
    gsap.ticker.add(tick);
    return () => {
      window.removeEventListener('mousemove', move);
      gsap.ticker.remove(tick);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="cursor-trail" aria-hidden>
      {Array.from({ length: COUNT }).map((_, i) => {
        const t = i / (COUNT - 1);
        const size = 11 - t * 8; // 11px head -> 3px tail
        return (
          <div
            key={i}
            ref={(el) => {
              dotsRef.current[i] = el;
            }}
            className="cursor-led"
            style={{ width: size, height: size, opacity: 1 - t * 0.82, zIndex: COUNT - i }}
          />
        );
      })}
    </div>
  );
}
