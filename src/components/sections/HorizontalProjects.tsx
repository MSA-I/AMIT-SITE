import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { projects, title, brief } from '../../data/projects';
import { useI18n } from '../../i18n/context';
import FlipMedia from '../../motion/FlipMedia';
import { gsap, ScrollTrigger, prefersReduced } from '../../motion/anim';
import { Eyebrow, CornerMark, LangLink } from '../ui';
import SelectedWork from './SelectedWork';

// anim.tsx already registers ScrollTrigger; the import keeps the dependency
// explicit (and the named export available) for this scrubbed, pinned timeline.
gsap.registerPlugin(ScrollTrigger);

// Single source of truth: horizontal mode only on >=md viewports that allow
// motion. Everything else (mobile, reduced-motion, SSR) falls back to the
// vertical SelectedWork list.
const HORIZONTAL_QUERY =
  '(min-width: 768px) and (prefers-reduced-motion: no-preference)';

/**
 * NS3 - HorizontalProjects: the signature interaction.
 * A pinned, horizontally-scrolling showcase of the home projects. RTL-safe:
 * the track always uses LTR transform coordinates (style.direction = 'ltr'),
 * while visual order is flipped with flex-row-reverse so Hebrew reads
 * right-to-left. DOM/tab order stays card 1..N for accessibility.
 *
 * Mobile / reduced-motion / SSR render the vertical fallback by returning
 * <SelectedWork /> (no duplicated markup). Only the horizontal branch builds
 * GSAP, scoped in gsap.matchMedia + gsap.context so it auto-reverts.
 */
export default function HorizontalProjects() {
  const { lang, t } = useI18n();

  // Default false so SSR / first paint render the static fallback and never
  // touch GSAP. matchMedia flips it on a motion-friendly desktop viewport.
  const [isHorizontal, setIsHorizontal] = useState(false);
  // The pin tween is shared with each card's FlipMedia via containerAnimation,
  // so the clip-reveal maps to horizontal progress instead of page scroll.
  const [containerTween, setContainerTween] = useState<gsap.core.Tween | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // 1) Decide the layout mode. Using gsap.matchMedia keeps the query in one
  //    place and auto-cleans the listener. The flag chooses which tree renders.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(HORIZONTAL_QUERY, () => {
      setIsHorizontal(true);
      return () => setIsHorizontal(false);
    });
    return () => mm.revert();
  }, []);

  // 2) Build the pinned horizontal timeline ONLY once the horizontal tree is
  //    live (refs populated) and the query still matches. Wrapped in
  //    gsap.matchMedia (resize-safe) + gsap.context (StrictMode-safe revert).
  //    Re-runs on lang change because direction flips the tween + content.
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!isHorizontal || !wrapper || !track) return;

    const mm = gsap.matchMedia();
    mm.add(HORIZONTAL_QUERY, () => {
      const ctx = gsap.context(() => {
        // Distance the track must travel to reveal its far edge. Read lazily so
        // invalidateOnRefresh recomputes it after resize / font load.
        const distance = () => track.scrollWidth - wrapper.clientWidth;

        // x endpoints are FUNCTIONS so invalidateOnRefresh re-resolves them with
        // the correct distance. (Constants would freeze a bad value from the
        // RTL first-paint race, collapsing the pin to a single imageless slide.)
        const tween = gsap.fromTo(
          track,
          { x: 0 },
          {
            x: () => -distance(),
            ease: 'none',
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
        setContainerTween(tween);
        // Recompute once layout/fonts settle (the track width can land after the
        // trigger is built, esp. in RTL), so the pin distance is never stuck at 0.
        if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }, wrapper);

      return () => {
        setContainerTween(null);
        ctx.revert();
      };
    });

    return () => mm.revert();
  }, [isHorizontal]);

  // Mobile / reduced-motion / SSR: reuse the vertical list, no GSAP.
  if (!isHorizontal || prefersReduced()) return <SelectedWork />;

  return (
    <section id="work" data-theme="ink" className="bg-ink text-cream">
      {/* Pinned wrapper holds the inner track; one project fills the viewport. */}
      <div ref={wrapperRef} className="relative h-screen overflow-hidden">
        {/* small top-start section label (replaces the giant heading) */}
        <Eyebrow className="absolute start-[6vw] top-8 z-10 text-cream">
          {t.portfolio.eyebrow}
        </Eyebrow>

        <div
          ref={trackRef}
          // Force LTR transform coordinates in BOTH locales. A flex-row-reverse
          // track inside an RTL document overflows to the LEFT, so scrollWidth
          // reports only the visible width (distance 0 -> dead pin). Laying the
          // track out LTR keeps scrollWidth correct; DOM/tab order stays 1..N
          // and per-slide Hebrew text still renders RTL.
          style={{ direction: 'ltr' }}
          className="flex h-full flex-row items-stretch will-change-transform"
        >
          {projects.map((p, i) => (
            <LangLink
              key={p.slug}
              to={`/portfolio/${p.slug}`}
              data-cursor
              data-cursor-label={t.portfolio.viewProject}
              className="group flex h-full w-screen shrink-0 flex-col justify-center px-[6vw]"
            >
              <div className="mx-auto w-full max-w-[1100px]">
                <FlipMedia
                  src={p.cover}
                  alt={title(p, lang)}
                  containerAnimation={containerTween ?? undefined}
                  className="h-[52vh] w-full bg-cream/5 md:h-[60vh]"
                  imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                />

                {/* truthful meta row: index (start) + category brief (end) */}
                <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-cream/15 pt-4 u-label text-cream/70">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span>{brief(p, lang)}</span>
                </div>

                <h3 className="t-section mt-8 text-center text-cream transition-colors group-hover:text-sage">
                  {title(p, lang)}
                </h3>

                <div className="mt-6 flex justify-center">
                  <span className="inline-flex items-center gap-2 u-label text-cream transition-colors group-hover:text-sage">
                    {t.portfolio.viewProject}
                    <ArrowUpRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                  </span>
                </div>
              </div>
            </LangLink>
          ))}
        </div>

        {/* recurring kinetic corner mark */}
        <CornerMark
          word={t.brand.mark}
          className="absolute bottom-8 end-4 z-10 text-lg text-cream/60 md:text-xl"
        />
      </div>
    </section>
  );
}
