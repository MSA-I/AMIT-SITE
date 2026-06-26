import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const LERP = 0.12;
const SIZE = 100; // ~100px diameter

/**
 * Additive blob that follows cursor with mix-blend-mode: difference.
 * Off on touch devices / reduced-motion. Morphs using GSAP.
 */
export default function CursorBlob() {
  const [enabled, setEnabled] = useState(false);
  const blobRef = useRef<HTMLDivElement>(null);

  // Check if we should enable the blob (fine pointer + no reduced motion)
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (fine && !reduce) setEnabled(true);
  }, []);

  // Cursor follow + morph animation
  useEffect(() => {
    const blob = blobRef.current;
    if (!blob || !enabled) return;

    // Position tracking
    let targetX = -200;
    let targetY = -200;
    let curX = -200;
    let curY = -200;

    const setX = gsap.quickSetter(blob, 'x', 'px');
    const setY = gsap.quickSetter(blob, 'y', 'px');

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const tick = () => {
      curX += (targetX - curX) * LERP;
      curY += (targetY - curY) * LERP;
      setX(curX);
      setY(curY);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    gsap.ticker.add(tick);

    // Morph animation (4-second cycle)
    const morphTl = gsap.timeline({ repeat: -1, yoyo: true });
    morphTl.to(blob, {
      borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
      duration: 2,
      ease: 'sine.inOut',
    });
    morphTl.to(blob, {
      borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
      duration: 2,
      ease: 'sine.inOut',
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      gsap.ticker.remove(tick);
      morphTl.kill();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={blobRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 start-0 z-[9998]"
      style={{
        width: SIZE,
        height: SIZE,
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#FFFFFF',
        borderRadius: '50%',
        mixBlendMode: 'difference',
        willChange: 'transform, border-radius',
      }}
    />
  );
}
