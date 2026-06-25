import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { projects, title, brief } from '../../data/projects';
import { useI18n } from '../../i18n/context';
import FlipMedia from '../../motion/FlipMedia';
import { gsap, ScrollTrigger, prefersReduced, RevealText } from '../../motion/anim';
import { Eyebrow, Container, LangLink } from '../ui';
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
  const isRtl = lang === 'he';

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

        const tween = gsap.fromTo(
          track,
          { x: isRtl ? -distance() : 0 },
          {
            x: isRtl ? 0 : -distance(),
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
      }, wrapper);

      return () => {
        setContainerTween(null);
        ctx.revert();
      };
    });

    return () => mm.revert();
  }, [isHorizontal, isRtl]);

  // Mobile / reduced-motion / SSR: reuse the vertical list, no GSAP.
  if (!isHorizontal || prefersReduced()) return <SelectedWork />;

  return (
    <section id="work" data-theme="cream" className="bg-cream text-ink">
      <Container className="pt-24 md:pt-36 pb-12 md:pb-16">
        <Eyebrow>{t.portfolio.eyebrow}</Eyebrow>
        <RevealText
          as="h2"
          text={t.portfolio.heading}
          className="mt-6 font-display font-light text-6xl leading-[0.95] text-ink md:text-8xl"
        />
      </Container>

      {/* Pinned wrapper holds the inner track. */}
      <div ref={wrapperRef} className="relative h-screen overflow-hidden">
        <div
          ref={trackRef}
          // Force LTR transform coordinates; flex-row-reverse handles RTL
          // visual order only (DOM/tab order stays 1..N).
          style={{ direction: 'ltr' }}
          className={`flex h-full items-center gap-[6vw] px-[6vw] will-change-transform ${
            isRtl ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {projects.map((p, i) => (
            <LangLink
              key={p.slug}
              to={`/portfolio/${p.slug}`}
              data-cursor
              data-cursor-label={t.portfolio.viewProject}
              className="group block w-[80vw] shrink-0 md:w-[42vw]"
            >
              <FlipMedia
                src={p.cover}
                alt={title(p, lang)}
                containerAnimation={containerTween ?? undefined}
                className="aspect-[4/5] w-full bg-line/40"
                imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
              />

              <div className="mt-5 flex items-baseline justify-between gap-4">
                <span className="u-label text-ink-soft">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="inline-flex items-center gap-2 u-label text-ink transition-colors group-hover:text-sage">
                  {t.portfolio.viewProject}
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>

              <h3 className="mt-3 font-display font-light text-4xl leading-[0.95] text-ink transition-colors group-hover:text-sage md:text-6xl">
                {title(p, lang)}
              </h3>
              <p className="mt-3 text-ink-soft">{brief(p, lang)}</p>
            </LangLink>
          ))}
        </div>
      </div>
    </section>
  );
}
