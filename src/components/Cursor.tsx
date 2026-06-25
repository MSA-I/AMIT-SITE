import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/** Additive follower dot. Native cursor stays visible (a11y). Off on touch / reduced-motion. */
export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 45, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 600, damping: 45, mass: 0.4 });
  const [hover, setHover] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as Element | null;
      setHover(!!t?.closest('a, button, [data-cursor], input, textarea, select'));
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div className="cursor-dot" style={{ x: sx, y: sy }} aria-hidden>
      <motion.div
        className="rounded-full bg-white"
        animate={{ width: hover ? 46 : 12, height: hover ? 46 : 12 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        style={{ x: '-50%', y: '-50%' }}
      />
    </motion.div>
  );
}
