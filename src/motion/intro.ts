/**
 * Intro gate: lets scroll choreography (e.g. the hero text reveals) wait for
 * the preloader curtain before it starts.
 *
 * The preloader runs on EVERY full page load (reference behavior - the user
 * wants the letters moment every time). The sessionStorage KEY is only an
 * explicit SKIP override for automation (Playwright scripts set it; ?instant
 * does the same) - nothing stamps it automatically anymore.
 *
 * - introDone() resolves immediately when the intro will not show (skip flag
 *   set, reduced motion, or SSR); otherwise it resolves on the
 *   'amit:introdone' window event, with an 8s safety timeout so a broken /
 *   never-mounted intro can never deadlock motion.
 * - markIntroDone() is called by the intro component when its exit finishes:
 *   it fires the event (and marks the module flag for late subscribers).
 */
const KEY = 'ab-intro-shown';
const EVENT = 'amit:introdone';
const SAFETY_MS = 8000;

let pending: Promise<void> | null = null;
// Module-level flag: when storage is blocked (private browsing) a subscriber
// arriving AFTER the event already fired must still resolve immediately.
let fired = false;

const sessionShown = () => {
  try {
    return !!window.sessionStorage.getItem(KEY);
  } catch {
    return false; // storage blocked -> treat as not shown; the event/timeout resolves
  }
};

/** Resolves once the intro curtain has finished (or was never going to show). */
export function introDone(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve(); // SSR-safe
  if (pending) return pending;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fired || reduce || sessionShown()) {
    pending = Promise.resolve();
    return pending;
  }
  pending = new Promise<void>((resolve) => {
    let timer = 0;
    const done = () => {
      window.clearTimeout(timer);
      window.removeEventListener(EVENT, done);
      resolve();
    };
    timer = window.setTimeout(done, SAFETY_MS);
    window.addEventListener(EVENT, done, { once: true });
  });
  return pending;
}

/** Intro component calls this when its exit animation completes. */
export function markIntroDone(): void {
  if (typeof window === 'undefined') return; // SSR-safe
  fired = true;
  // Deliberately NOT stamping the session key: the preloader replays on every
  // full load; the key remains an automation-only skip switch.
  window.dispatchEvent(new Event(EVENT));
}
