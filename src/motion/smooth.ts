import { useLayoutEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReduced } from './anim';

let lenisInstance: Lenis | null = null;

/**
 * Per-history-entry scroll offset store, keyed by React Router's location.key.
 * Lets a POP (back/forward) navigation restore the exact vertical offset the
 * user was at for that entry instead of snapping to the top.
 */
const scrollStore = new Map<string, number>();

/** Current vertical scroll offset (Lenis virtual scroll, else native window). */
export function getScroll(): number {
  if (lenisInstance) return lenisInstance.scroll;
  return typeof window !== 'undefined' ? window.scrollY : 0;
}

/** Remember the current scroll offset for a history entry. */
export function saveScroll(key: string) {
  scrollStore.set(key, getScroll());
}

/** Jump (no animation) to an absolute vertical offset. */
function jumpTo(y: number) {
  // force: Lenis silently drops scrollTo while stopped (menu open / preloader);
  // the restore must always win, same rationale as resetScroll below.
  if (lenisInstance) lenisInstance.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}

/**
 * Restore the saved offset for a history entry (used on POP). Returns false if
 * nothing was stored, so the caller can fall back to the default reset. Refresh
 * ScrollTrigger FIRST so the pinned home stage measures against the new DOM
 * before we seek into its pin range, then jump on the caller's rAF cadence.
 */
export function restoreScroll(key: string): boolean {
  const y = scrollStore.get(key);
  if (y === undefined) return false;
  ScrollTrigger.refresh();
  jumpTo(y);
  return true;
}

/** Start Lenis smooth scroll wired to GSAP ScrollTrigger. Call once in Layout. */
export function useSmoothScroll() {
  const started = useRef(false);
  useLayoutEffect(() => {
    if (prefersReduced() || started.current) return;
    started.current = true;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    lenisInstance = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add('lenis');

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
      document.documentElement.classList.remove('lenis');
      started.current = false;
    };
  }, []);
}

/** Jump to top + recompute triggers after a route change. */
export function resetScroll() {
  // force: Lenis silently drops scrollTo while stopped (menu open / preloader),
  // and route changes can land in that window (e.g. clicking the frame logo
  // over the open menu) - the reset must always win.
  if (lenisInstance) lenisInstance.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
  ScrollTrigger.refresh();
}

export function stopScroll(stop: boolean) {
  if (!lenisInstance) return;
  if (stop) lenisInstance.stop();
  else lenisInstance.start();
}

/** Smooth-scroll to an absolute page Y (used by the horizontal stage). */
export function scrollToY(y: number) {
  if (lenisInstance) lenisInstance.scrollTo(y, { duration: 1.2 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}

/** Smooth-scroll to a selector or element (falls back to native). */
export function scrollToEl(target: string | HTMLElement, offset = 0) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset, duration: 1.2 });
  } else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  } else {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}
