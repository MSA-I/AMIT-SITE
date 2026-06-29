import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap, prefersReduced } from '../motion/anim';
import { useI18n } from '../i18n/context';
import { localePath } from '../lib/paths';
import LogoStagger from './LogoStagger';

/**
 * The brand wordmark. At rest it sits small in the header (start side). On pages
 * that have a `#hero`, it begins oversized and centered (char-reveal on load) and
 * scrubs down into the header slot as the hero scrolls past. Pure GSAP (kept out
 * of the Framer-Motion menu tree). Colour adapts to the section beneath it.
 */
export default function ScrollLogo() {
  const { lang } = useI18n();
  const { pathname } = useLocation();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [dark, setDark] = useState(false);

  // Adapt colour to the theme of the section currently under the header.
  useEffect(() => {
    const secs = Array.from(document.querySelectorAll('[data-theme]'));
    if (!secs.length) {
      setDark(false);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setDark(e.target.getAttribute('data-theme') === 'ink');
      },
      { rootMargin: '0px 0px -92% 0px' }
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [pathname]);

  // Oversized -> header scrub. Re-evaluated per route (hero may be absent).
  useLayoutEffect(() => {
    const el = linkRef.current;
    if (!el || prefersReduced()) return;
    if (!document.querySelector('#hero')) return; // no hero on this route -> stay small

    // Measure the resting box with no transform applied, then derive the big
    // centered offset/scale. Recomputed on every ScrollTrigger refresh (resize).
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

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        {
          x: () => compute().x,
          y: () => compute().y,
          scale: () => compute().s,
          transformOrigin: 'center center',
        },
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
    return () => ctx.revert();
  }, [pathname]);

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
