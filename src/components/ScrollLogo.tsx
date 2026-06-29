import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, prefersReduced } from '../motion/anim';
import { useHeaderTheme } from '../motion/useHeaderTheme';
import { useI18n } from '../i18n/context';
import { localePath } from '../lib/paths';
import LogoStagger from './LogoStagger';

/**
 * The brand wordmark. At rest it sits small in the header (start side). On pages
 * that have a `#hero` (desktop / fine-pointer only), it begins oversized and
 * centered (char-reveal on load) and scrubs down into the header slot as the
 * hero scrolls past. Pure GSAP, kept out of the Framer-Motion menu tree. Colour
 * comes from the shared header-theme hook. The scrub re-binds on `amit:pageready`
 * so it works after client-side navigation (the persistent header outlives the
 * page transition, so #hero isn't in the DOM when the route first changes).
 */
export default function ScrollLogo() {
  const { lang } = useI18n();
  const dark = useHeaderTheme();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const ctxRef = useRef<ReturnType<typeof gsap.context> | null>(null);

  useLayoutEffect(() => {
    const el = linkRef.current;
    if (!el) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const setup = () => {
      ctxRef.current?.revert();
      ctxRef.current = null;
      // Big -> header scrub only on fine-pointer + motion-allowed + when a hero exists.
      // (On touch the logo stays small, avoiding an oversized clickable overlay.)
      if (!fine || prefersReduced() || !document.querySelector('#hero')) return;

      // Measure the resting box with no transform, then derive the big centered
      // offset/scale. Recomputed on each ScrollTrigger refresh (resize).
      const compute = () => {
        const prev = el.style.transform;
        el.style.transform = 'none';
        const r = el.getBoundingClientRect();
        el.style.transform = prev;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const s = Math.min(Math.max((window.innerWidth * 0.6) / Math.max(r.width, 1), 1), 12);
        return { x: window.innerWidth / 2 - cx, y: window.innerHeight * 0.44 - cy, s };
      };

      ctxRef.current = gsap.context(() => {
        gsap.fromTo(
          el,
          { x: () => compute().x, y: () => compute().y, scale: () => compute().s, transformOrigin: 'center center' },
          {
            x: 0,
            y: 0,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '#hero',
              start: 'top top',
              end: 'bottom top',
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    };

    setup();
    window.addEventListener('amit:pageready', setup);
    return () => {
      window.removeEventListener('amit:pageready', setup);
      ctxRef.current?.revert();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed start-0 top-0 z-[71] px-6 py-5 md:px-10">
      <Link
        ref={linkRef}
        to={localePath(lang)}
        aria-label="Amit Bar"
        dir="ltr"
        className={`pointer-events-auto inline-block font-display text-xl leading-none tracking-[0.16em] transition-colors duration-300 ${
          dark ? 'text-cream' : 'text-ink'
        }`}
      >
        <LogoStagger text="AMIT BAR" />
        <span className="align-top text-sage" style={{ fontSize: '0.5em' }}>®</span>
      </Link>
    </div>
  );
}
