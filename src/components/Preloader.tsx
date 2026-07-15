import { useLayoutEffect, useRef, useState } from 'react';
import { gsap, prefersReduced } from '../motion/anim';
import { markIntroDone } from '../motion/intro';
import { stopScroll } from '../motion/smooth';
import { useI18n } from '../i18n/context';
import { SlideChars } from './LogoStagger';

const KEY = 'ab-intro-shown';
const PRELOADING_CLASS = 'is-preloading';

/**
 * Preloader - the one-time (per session) opening curtain, ported verbatim
 * from the reference clone's runPreloader() + buildEntrance() choreography
 * (timeScale 1.15 throughout):
 *
 * 1. Wordmark chars sit at x:120% inside .pl-char masks; after 500ms they
 *    slide to 0% (0.5s, stagger 0.1, power3.out). A 2600ms safety timeout
 *    marks the chars gate done even when rAF is throttled.
 * 2. A 16ms interval drives REAL progress (eager <img>s of the mounted
 *    route) floored by a time ramp (~2s to 100): the value is written
 *    straight to the DOM (--progress custom prop + .pl-num textContent),
 *    never through React state.
 * 3. When fake >= 100 AND chars are done: bar fades 0.5s, number fades
 *    0.33s, then after ~1300ms the entrance timeline expands the .pl-logo
 *    box width -> 100% (1s power2.in @0.25) and height -> 100% (1s
 *    power2.out @2.0) while "AMIT" travels top -> 0 (1.75s power2.out
 *    @2.0). Because .preloader shares --frame-pad / --frame-logo-size with
 *    the fixed frame, the box corners ARE the .frame-logo / .frame-mark
 *    resting spots; the curtain hides (autoAlpha 0 @3.05) over the
 *    identical FixedFrame beneath.
 *
 * Runs on EVERY full page load (the reference behavior). The sessionStorage
 * key is an automation-only SKIP override (Playwright sets it; ?instant too)
 * - markIntroDone no longer stamps it. Renders null (and resolves the intro
 * gate) when skipped or under prefers-reduced-motion. While running:
 * html.is-preloading (scroll lock + MenuPill hide) and Lenis stopScroll(true);
 * both released on finish.
 */
const shouldRun = () => {
  if (typeof window === 'undefined') return false; // SSR-safe
  if (prefersReduced()) return false;
  if (new URLSearchParams(window.location.search).has('instant')) return false;
  try {
    // automation-only skip switch (scripts set it); never stamped by the app
    if (window.sessionStorage.getItem(KEY)) return false;
  } catch {
    /* storage blocked (private browsing): just run */
  }
  return true;
};

export default function Preloader() {
  const { t } = useI18n();
  // lazy initializer: decided once, before first paint, no remount flip
  const [active] = useState(shouldRun);
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const amitRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!active) {
      // never showing this session: release anything waiting on the gate
      markIntroDone();
      return;
    }
    if (done) return; // post-run render; the run's cleanup already executed

    const root = rootRef.current;
    const logo = logoRef.current;
    const amit = amitRef.current;
    if (!root || !logo || !amit) return;

    let charsDone = false;
    let finishing = false;
    let finished = false;

    document.documentElement.classList.add(PRELOADING_CLASS);
    stopScroll(true); // no-op before Lenis exists; the class covers that window
    // Lenis is created by Layout's effect which runs AFTER this child effect;
    // catch it on the next macrotask so wheel input is truly frozen.
    const lenisTimer = window.setTimeout(() => stopScroll(true), 0);

    const glyphs = root.querySelectorAll<HTMLElement>('[data-glyph]');
    const ctx = gsap.context(() => {
      gsap.set(glyphs, { x: '120%' });
    }, root);

    // --- 1. chars slide in after 500ms (reference timing) -----------------
    const charTimer = window.setTimeout(() => {
      ctx.add(() => {
        gsap
          .to(glyphs, {
            x: '0%',
            duration: 0.5,
            stagger: 0.1,
            ease: 'power3.out',
            onComplete: () => {
              charsDone = true;
            },
          })
          .timeScale(1.15);
      });
    }, 500);
    // rAF may be throttled (occluded window) - never let the chars gate hang
    const charSafety = window.setTimeout(() => {
      charsDone = true;
    }, 2600);

    // --- 2. real progress: eager images of the mounted route --------------
    // Listen on the elements themselves; cloning into new Image() would
    // force-download the whole lazy gallery.
    const imgs = Array.from(document.images).filter((im) => im.loading !== 'lazy');
    let loaded = 0;
    const tracked: Array<[HTMLImageElement, () => void]> = [];
    imgs.forEach((im) => {
      if (im.complete) {
        loaded += 1;
        return;
      }
      const onSettled = () => {
        loaded += 1;
        im.removeEventListener('load', onSettled);
        im.removeEventListener('error', onSettled);
      };
      im.addEventListener('load', onSettled);
      im.addEventListener('error', onSettled);
      tracked.push([im, onSettled]);
    });

    const finish = () => {
      if (finished) return;
      finished = true;
      document.documentElement.classList.remove(PRELOADING_CLASS);
      stopScroll(false);
      markIntroDone(); // stamps the session flag + fires 'amit:introdone'
      setDone(true); // unmounts the curtain (cleanup below re-runs, idempotent)
    };

    // --- 3. geometric handoff to the FixedFrame corners --------------------
    // The centered phase plays ~2x the frame size (the cascade must dominate
    // the screen, reference drama); the entrance shrinks font-size to the
    // LIVE .frame-logo size while the box expands, so the words travel far
    // AND settle into a pixel-exact landing on the frame corners.
    const runEntrance = () => {
      ctx.add(() => {
        const frameLogo = document.querySelector('.frame-logo');
        const targetSize = frameLogo ? getComputedStyle(frameLogo).fontSize : '';
        const tl = gsap.timeline({ onComplete: finish });
        tl.timeScale(1.15);
        if (targetSize) {
          tl.to(logo, { fontSize: targetSize, duration: 2.75, ease: 'power2.inOut' }, 0.25);
        }
        tl.to(logo, { width: '100%', duration: 1, ease: 'power2.in' }, 0.25);
        tl.to(logo, { height: '100%', duration: 1, ease: 'power2.out' }, 2);
        // top offset is independent of the animating box size; top:0 = the
        // .frame-logo resting spot (see .pl-amit in index.css)
        tl.to(amit, { top: 0, duration: 1.75, ease: 'power2.out' }, 2);
        tl.set(root, { autoAlpha: 0 }, 3.05);
      });
    };

    let finishTimer = 0;
    const beginExit = () => {
      if (finishing) return;
      finishing = true;
      window.clearInterval(iv);
      root.style.setProperty('--progress', '100%');
      if (numRef.current) numRef.current.textContent = '100%';
      ctx.add(() => {
        gsap.to(barRef.current, { opacity: 0, duration: 0.5, ease: 'none' });
        gsap.to(numRef.current, { opacity: 0, duration: 0.33, ease: 'none' });
      });
      // 900ms (not the reference's 1300): our glyph cascade is shorter, so a
      // long hold reads as dead air between the letters and the corner travel
      finishTimer = window.setTimeout(runEntrance, 900);
    };
    // Hard cap: one stalled image request must never hold the curtain (and the
    // scroll lock) forever - force the exit even if real progress is stuck.
    const hardCap = window.setTimeout(beginExit, 10000);

    const t0 = performance.now();
    const iv = window.setInterval(() => {
      const real = imgs.length ? Math.floor((100 / imgs.length) * loaded) : 100;
      // time-based floor (throttle-proof): ~2s to reach 100 once assets allow
      const fake = Math.min(real, Math.floor((performance.now() - t0) / 20), 100);
      root.style.setProperty('--progress', `${fake}%`);
      if (numRef.current) numRef.current.textContent = `${fake}%`;

      if (fake >= 100 && charsDone) {
        window.clearTimeout(hardCap);
        beginExit();
      }
    }, 16);

    // StrictMode-safe: everything above is re-created on the dev re-run
    return () => {
      window.clearTimeout(lenisTimer);
      window.clearTimeout(charTimer);
      window.clearTimeout(charSafety);
      window.clearTimeout(hardCap);
      window.clearTimeout(finishTimer);
      window.clearInterval(iv);
      tracked.forEach(([im, on]) => {
        im.removeEventListener('load', on);
        im.removeEventListener('error', on);
      });
      ctx.revert();
      document.documentElement.classList.remove(PRELOADING_CLASS);
      stopScroll(false);
    };
  }, [active, done]);

  if (!active || done) return null;

  return (
    <div ref={rootRef} className="preloader" role="status" aria-label={t.preloader.loading}>
      {/* Latin wordmark lockup: ALWAYS dir="ltr", physical geometry inside */}
      <div ref={logoRef} className="pl-logo" dir="ltr" aria-hidden>
        <span ref={amitRef} className="pl-amit">
          <SlideChars text="AMIT" paused />
        </span>
        <span className="pl-group">
          <SlideChars text="interior design" className="pl-sub" paused />
          <span className="pl-bar-word"><SlideChars text="BAR" paused />&reg;</span>
        </span>
      </div>
      <span ref={numRef} className="pl-num" aria-hidden dir="ltr">
        0%
      </span>
      <span ref={barRef} className="pl-progress" aria-hidden />
    </div>
  );
}
