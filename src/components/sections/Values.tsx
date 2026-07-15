import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/context';
import { Container, Eyebrow } from '../ui';
import { gsap } from '../../motion/anim';
import { projects, title } from '../../data/projects';

/**
 * Interactive values list (reference's "terms" move): three value rows; hovering
 * a row reveals a cursor-following image that swaps per value. Desktop + fine
 * pointer + motion only; touch / reduced-motion get a static stacked list with
 * inline images so nothing is hidden.
 */
export default function Values() {
  const { t, lang } = useI18n();
  const vals = t.home.values;
  const media = projects.slice(0, vals.length);

  const followRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(fine && !reduce && media.length > 0);
  }, [media.length]);

  // follower position (lerped) + base centering offset
  useEffect(() => {
    if (!enabled) return;
    const el = followRef.current;
    if (!el) return;
    gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0.9, autoAlpha: 0 });
    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });
    const move = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, [enabled]);

  // reveal / hide the follower as a value is hovered
  useLayoutEffect(() => {
    const el = followRef.current;
    if (!el || !enabled) return;
    gsap.to(el, {
      autoAlpha: active !== null ? 1 : 0,
      scale: active !== null ? 1 : 0.9,
      duration: 0.4,
      ease: 'power3.out',
    });
  }, [active, enabled]);

  return (
    <section
      id="values"
      data-theme="ink"
      className="relative isolate overflow-hidden bg-ink text-cream"
    >
      <Container className="py-24 sm:py-28 md:py-36">
        <Eyebrow className="text-cream">{t.home.valuesEyebrow}</Eyebrow>
        <h2 className="t-section mt-6 max-w-[18ch] text-cream">{t.home.valuesHeading}</h2>

        <ul className="mt-12 border-t border-cream/15 md:mt-16">
          {vals.map((v, i) => (
            <li key={v.n} className="border-b border-cream/15">
              <div
                className="group flex flex-col gap-3 py-8 md:flex-row md:items-baseline md:gap-8 md:py-12"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive((cur) => (cur === i ? null : cur))}
              >
                <span className="u-label text-cream/70">{v.n}</span>
                <h3 className="t-section flex-1 leading-[1] transition-opacity duration-300 md:group-hover:opacity-100">
                  {v.title}
                </h3>
                <p className="max-w-xs text-cream/70 md:text-end">{v.desc}</p>
              </div>

              {/* static image - shown only when the follower is unavailable */}
              {!enabled && media[i] && (
                <img
                  src={media[i].cover}
                  alt={title(media[i], lang)}
                  loading="lazy"
                  className="mb-8 h-56 w-full object-cover sm:h-72"
                />
              )}
            </li>
          ))}
        </ul>
      </Container>

      {/* cursor-following image-swap */}
      {enabled && (
        <div
          ref={followRef}
          aria-hidden
          // physical left-0 (not logical start-0): GSAP x is driven by raw clientX,
          // so the anchor must be the physical left edge in both LTR and RTL.
          className="pointer-events-none fixed left-0 top-0 z-40 h-[16rem] w-[12rem] overflow-hidden"
        >
          {media.map((p, i) => (
            <img
              key={p.slug}
              src={p.cover}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
              style={{ opacity: active === i ? 1 : 0 }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
