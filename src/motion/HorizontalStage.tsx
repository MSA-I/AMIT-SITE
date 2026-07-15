import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { gsap, ScrollTrigger, prefersReduced } from './anim';
import { scrollToEl, scrollToY } from './smooth';
import { StageContext, isRtl, offsetInTrack } from './stageContext';

gsap.registerPlugin(ScrollTrigger);

/**
 * Single source of truth: the pinned horizontal journey runs only on >=lg
 * viewports that allow motion. Tablets/mobile/reduced-motion/SSR get the
 * vertical fallback stack (same panel components, block layout).
 */
export const HORIZONTAL_QUERY =
  '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

export type PanelTheme = 'cream' | 'ink' | 'paper';

const THEME_CLASS: Record<PanelTheme, string> = {
  cream: 'bg-cream text-ink',
  paper: 'bg-paper text-ink',
  ink: 'bg-ink text-cream',
};

/**
 * One chapter of the journey. `w` = width in vw (horizontal mode only; the
 * fallback stack renders full-width). The panel restores the document
 * direction because the track forces direction:ltr for correct transform
 * coordinates.
 */
export function HPanel({
  w,
  theme,
  id,
  className = '',
  fallbackClassName = '',
  children,
}: {
  w: number;
  theme: PanelTheme;
  id?: string;
  className?: string;
  /** extra classes applied only in the vertical fallback stack */
  fallbackClassName?: string;
  children: React.ReactNode;
}) {
  const { horizontal } = React.useContext(StageContext);
  return (
    <section
      id={id}
      data-theme={theme}
      data-hpanel
      dir={horizontal ? (isRtl() ? 'rtl' : 'ltr') : undefined}
      style={horizontal ? { width: `${w}vw` } : undefined}
      className={`relative ${THEME_CLASS[theme]} ${
        horizontal ? 'h-full shrink-0' : `w-full ${fallbackClassName}`
      } ${className}`}
    >
      {children}
    </section>
  );
}

/**
 * The v3 horizontal engine: a pinned track of <HPanel>s driven by vertical
 * scroll (1px vertical = 1px horizontal), generalized from the proven
 * HorizontalProjects pattern (Lenis-safe pin, function endpoints,
 * invalidateOnRefresh, matchMedia gating, tween-as-state for context sharing).
 *
 * RTL: the track keeps LTR transform coordinates (correct scrollWidth) but
 * lays panels out with flex-row-reverse and travels x: -distance -> 0, so the
 * journey moves rightward and panels enter from the left. DOM/tab order stays
 * panel 1..N in both languages.
 */
export default function HorizontalStage({
  id,
  className = '',
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  // Default false so SSR / first paint render the static fallback and never
  // touch GSAP. matchMedia flips it on a motion-friendly desktop viewport.
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [tween, setTween] = useState<gsap.core.Tween | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // 1) Decide the layout mode (pre-paint, so no layout flash).
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(HORIZONTAL_QUERY, () => {
      setIsHorizontal(true);
      return () => setIsHorizontal(false);
    });
    return () => mm.revert();
  }, []);

  // 2) Build the pin once the horizontal tree is live (refs populated).
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!isHorizontal || !wrapper || !track) return;
    const rtl = isRtl();

    const mm = gsap.matchMedia();
    mm.add(HORIZONTAL_QUERY, () => {
      const ctx = gsap.context(() => {
        // Travel distance; read lazily so invalidateOnRefresh recomputes it
        // after resize / font load (RTL first-paint race guard).
        const distance = () => track.scrollWidth - wrapper.clientWidth;

        const tw = gsap.fromTo(
          track,
          { x: () => (rtl ? -distance() : 0) },
          {
            x: () => (rtl ? 0 : -distance()),
            ease: 'none',
            // Whole-pixel travel: sub-pixel translation makes clip-path seams
            // and image edges shimmer while scrubbing (user-reported flicker
            // on the dark chapter's flip edge). 1px steps are invisible at
            // scroll speed and keep text/edges raster-stable.
            snap: { x: 1 },
            scrollTrigger: {
              trigger: wrapper,
              start: 'top top',
              end: () => '+=' + distance(),
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          }
        );
        tweenRef.current = tw;
        setTween(tw);
        // Recompute once layout/fonts settle so the distance is never stuck at 0.
        if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }, wrapper);

      // Persistent header / route transitions re-measure the pin.
      const onPageReady = () => ScrollTrigger.refresh();
      window.addEventListener('amit:pageready', onPageReady);

      // Keyboard focus into an off-screen panel makes the browser scroll the
      // overflow-hidden wrapper, desyncing native scrollLeft from the
      // transform. Undo it and route the intent through the pin instead.
      const onScroll = () => {
        wrapper.scrollLeft = 0;
        wrapper.scrollTop = 0;
      };
      const onFocusIn = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        // Clicks also move focus; reroute only KEYBOARD-driven focus
        // (:focus-visible), otherwise every click inside a panel would yank
        // the scroll to re-align that panel (review finding, spike-verified).
        let keyboard = true;
        try {
          keyboard = target.matches(':focus-visible');
        } catch {
          /* selector unsupported: keep keyboard=true (safe default) */
        }
        if (!keyboard) return;
        // Route to the focused ELEMENT, not its panel: panel-edge alignment
        // leaves focusables deep inside wide panels (e.g. the 342vw accordion)
        // off-screen (WCAG 2.4.7 failure, review-verified).
        if (target.closest('[data-hpanel]')) scrollFocusIntoView(target);
      };
      wrapper.addEventListener('scroll', onScroll);
      wrapper.addEventListener('focusin', onFocusIn);

      return () => {
        window.removeEventListener('amit:pageready', onPageReady);
        wrapper.removeEventListener('scroll', onScroll);
        wrapper.removeEventListener('focusin', onFocusIn);
        tweenRef.current = null;
        setTween(null);
        ctx.revert();
      };
    });

    return () => mm.revert();
  }, [isHorizontal]);

  /** Page scroll-Y that brings a panel's leading edge to the viewport edge. */
  const scrollPanelIntoView = useCallback((el: HTMLElement) => {
    const track = trackRef.current;
    const wrapper = wrapperRef.current;
    const st = tweenRef.current?.scrollTrigger;
    if (!track || !wrapper || !st) {
      scrollToEl(el);
      return;
    }
    const d = track.scrollWidth - wrapper.clientWidth;
    // Align the panel's LEADING edge with the viewport's reading edge
    // (RTL leading = right edge; mirrors the stageEdge math).
    const delta = isRtl()
      ? d - el.offsetLeft - el.offsetWidth + wrapper.clientWidth
      : el.offsetLeft;
    scrollToY(st.start + Math.max(0, Math.min(d, delta)));
  }, []);

  /** Page scroll-Y that centers a focused ELEMENT in the travel window. */
  const scrollFocusIntoView = useCallback((target: HTMLElement) => {
    const track = trackRef.current;
    const wrapper = wrapperRef.current;
    const st = tweenRef.current?.scrollTrigger;
    if (!track || !wrapper || !st) {
      scrollToEl(target);
      return;
    }
    // Already fully visible: keyboard focus needs no scroll correction.
    const r = target.getBoundingClientRect();
    if (
      r.left >= 0 &&
      r.right <= window.innerWidth &&
      r.top >= 0 &&
      r.bottom <= window.innerHeight
    ) {
      return;
    }
    const d = track.scrollWidth - wrapper.clientWidth;
    const L = offsetInTrack(target, track);
    // Center the element itself (mirrors the stageEdge travel math).
    const delta = isRtl()
      ? d - L - target.offsetWidth + (wrapper.clientWidth + target.offsetWidth) / 2
      : L - (wrapper.clientWidth - target.offsetWidth) / 2;
    scrollToY(st.start + Math.max(0, Math.min(d, delta)));
  }, []);

  const scrollToPanel = useCallback(
    (panelId: string) => {
      const el = document.getElementById(panelId);
      if (!el) return;
      if (!tweenRef.current) {
        scrollToEl(el); // vertical fallback: plain smooth scroll
        return;
      }
      scrollPanelIntoView(el);
    },
    [scrollPanelIntoView]
  );

  const stage = useMemo(
    () => ({ inStage: true, horizontal: isHorizontal, tween, scrollToPanel }),
    [isHorizontal, tween, scrollToPanel]
  );

  const horizontal = isHorizontal && !prefersReduced();

  return (
    <StageContext.Provider value={stage}>
      {horizontal ? (
        <section id={id} className={className}>
          {/* Pinned wrapper holds the inner track; panels declare vw widths.
              direction:ltr HERE too: in an RTL wrapper the over-constrained
              track box (w-max wider than the wrapper) aligns to the RIGHT edge,
              i.e. a static x of -distance, which the tween's x:-distance would
              DOUBLE (whole journey renders off-screen). LTR pins the track's
              static position at 0 in both locales; panels restore their dir. */}
          <div
            ref={wrapperRef}
            style={{ direction: 'ltr' }}
            className="relative h-screen overflow-hidden"
          >
            <div
              ref={trackRef}
              // Force LTR transform coordinates in BOTH locales, and w-max so
              // the track box itself spans the full content width. Without
              // w-max, flex-row-reverse overflows LEFTWARD and scrollWidth
              // collapses to the visible width -> dead pin (spike-verified).
              // Visual order flips with flex-row-reverse; DOM/tab order stays
              // panel 1..N.
              style={{ direction: 'ltr' }}
              className={`flex h-full w-max items-stretch will-change-transform ${
                isRtl() ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {children}
            </div>
          </div>
        </section>
      ) : (
        <section id={id} className={`flex flex-col ${className}`}>
          {children}
        </section>
      )}
    </StageContext.Provider>
  );
}
