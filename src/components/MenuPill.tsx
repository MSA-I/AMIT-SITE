import { useEffect, useState, type RefObject } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import { ScrollTrigger, prefersReduced } from '../motion/anim';
import { useHeaderTheme } from '../motion/useHeaderTheme';

/**
 * MenuPill - the fixed round trigger at the top logical-end corner (z 60).
 * GSAP tree only (NO Framer): a plain viewport ScrollTrigger toggles the CSS
 * `.is-visible` class (reference main.js initMenu) once the page scrolls past
 * 0.8 * viewport height. Always visible when the overlay is open, on coarse
 * pointers, and under reduced motion. Colour flips against the section under
 * the viewport centre via useHeaderTheme; open forces the on-ink look.
 * The label rolls between "menu"/"close" with a pure CSS translate driven by
 * the `open` prop (grid-stacked copies inside an overflow mask).
 */
export default function MenuPill({
  open,
  onToggle,
  buttonRef,
}: {
  open: boolean;
  onToggle: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
}) {
  const { t } = useI18n();
  const dark = useHeaderTheme();
  // Home hides the pill until 0.8vh of scroll (the reference's quiet hero);
  // inner pages first-paint WITH navigation (QA: no visible nav at their top).
  const { pathname } = useLocation();
  const isHome = /^\/(he|en)\/?$/.test(pathname);

  // Coarse pointer / reduced motion: no scroll choreography - pill always shown.
  const [always] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia('(hover: none), (pointer: coarse)').matches || prefersReduced()),
  );
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (always) return;
    const st = ScrollTrigger.create({
      start: () => window.innerHeight * 0.8,
      onEnter: () => setScrolled(true),
      onLeaveBack: () => setScrolled(false),
    });
    return () => st.kill();
  }, [always]);

  const visible = always || open || scrolled || !isHome;
  // light section -> ink pill; dark (ink) section -> cream pill; open -> cream on the ink overlay
  const inverted = open || dark;

  const roll = 'transition-transform duration-[450ms] ease-[var(--ease-out-expo)] [grid-area:1/1]';

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onToggle}
      // invisible pill (opacity 0) must not be keyboard-reachable
      tabIndex={visible ? 0 : -1}
      aria-expanded={open}
      aria-controls="menu-overlay"
      aria-label={open ? t.nav.close : t.nav.menu}
      className={`menu-pill u-label fixed top-[var(--frame-pad)] end-[var(--frame-pad)] z-[60] cursor-pointer rounded-full px-5 py-2.5 ${
        visible ? 'is-visible' : ''
      } ${
        // hairline ring keeps the pill silhouette readable when it crosses
        // same-color ground (e.g. the stretched ink letterform in RTL)
        inverted ? 'bg-cream text-ink ring-1 ring-ink/15' : 'bg-ink text-cream ring-1 ring-cream/25'
      }`}
      // .menu-pill (unlayered, so it outranks utilities) transitions only
      // opacity/transform; widening the property list inline lets the theme
      // colours reuse its 0.45s expo pairs (shorthand lists cycle) instead of snapping.
      style={{ transitionProperty: 'opacity, transform, background-color, color' }}
    >
      {/* label roll: both copies stacked in one grid cell, masked by the parent */}
      <span aria-hidden className="grid overflow-hidden text-center">
        <span className={`block ${roll} ${open ? '-translate-y-full' : 'translate-y-0'}`}>
          {t.nav.menu}
        </span>
        <span className={`block ${roll} ${open ? 'translate-y-0' : 'translate-y-full'}`}>
          {t.nav.close}
        </span>
      </span>
    </button>
  );
}
