import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useAnimationControls } from 'framer-motion';

/** Ink curtain wipe on route change. Skipped under reduced-motion. */
export default function PageTransition() {
  const { pathname } = useLocation();
  const controls = useAnimationControls();
  const prev = useRef(pathname);
  const [reduce, setReduce] = useState(true);

  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (reduce) return;
    if (prev.current === pathname) return;
    prev.current = pathname;
    let alive = true;
    (async () => {
      await controls.start({ y: '0%', transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] } });
      if (!alive) return;
      await controls.start({ y: '-100%', transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] } });
      if (!alive) return;
      controls.set({ y: '100%' });
    })();
    return () => {
      alive = false;
    };
  }, [pathname, reduce, controls]);

  if (reduce) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[95] flex items-center justify-center bg-ink"
      initial={{ y: '100%' }}
      animate={controls}
      aria-hidden
    >
      <span className="font-display text-2xl tracking-[0.2em] text-cream">AB</span>
    </motion.div>
  );
}
