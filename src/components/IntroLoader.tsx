import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LogoStagger from './LogoStagger';

const KEY = 'ab-intro-shown';

/** One-time intro curtain (per session). Skipped under reduced-motion. */
export default function IntroLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || sessionStorage.getItem(KEY)) return;
    setShow(true);
    document.documentElement.style.overflow = 'hidden';
    // NOTE: set the session flag only AFTER the timer fires, so React StrictMode's
    // mount/unmount/remount in dev re-establishes the dismiss timer instead of skipping it.
    const t = setTimeout(() => {
      sessionStorage.setItem(KEY, '1');
      setShow(false);
      document.documentElement.style.overflow = '';
    }, 1600);
    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink text-cream"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
            dir="ltr"
          >
            <LogoStagger text="Amit Bar" className="font-display text-5xl tracking-tight md:text-7xl" />
            <div className="u-label mt-4 text-cream/60">Interior Design</div>
          </motion.div>
          <motion.div
            className="mt-10 h-px bg-sage"
            initial={{ width: 0 }}
            animate={{ width: 160 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
