import { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { useI18n } from '../../../i18n/context';
import { HPanel } from '../../../motion/HorizontalStage';
import { useStage } from '../../../motion/stageContext';
import { Reveal, RevealText, ScrollTrigger } from '../../../motion/anim';
import { introDone } from '../../../motion/intro';
import { Container, Eyebrow, EdgeLabel } from '../../ui';
import SpinningBadge from '../../SpinningBadge';

/**
 * Chapter 01 - the opening stage (reference .panel--hero, adapted to Amit's
 * brand). 85vw cream panel so the images panel peeks in at the end edge.
 *
 * Horizontal mode: three absolutely-positioned title clusters composed inside
 * ONE h1 (staggered diagonal, reference .ht--1/.ht--2/.ht--3 geometry mapped
 * to vw/vh), lead paragraph lower-start, bottom chrome row (role + badge +
 * scroll hint) and a vertical name label at the end edge. The last ~10vw stays
 * free of content so the next panel breathes in.
 *
 * Fallback mode: classic centered hero stack, everything visible.
 */
export default function PanelHero() {
  const { t } = useI18n();
  const { horizontal, scrollToPanel } = useStage();

  // The hero texts are on screen at load, so their once:true reveals would
  // play (and finish) UNDER the preloader curtain. Mount them only after the
  // intro gate resolves - the letters rise exactly as the curtain lifts.
  // introDone() resolves immediately when no preloader runs (skip flag,
  // ?instant, reduced motion), so automation and fallbacks are unaffected.
  const [introReady, setIntroReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    introDone().then(() => {
      if (mounted) setIntroReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Late-created containerAnimation triggers are only evaluated on scroll or
  // on a refresh - and both already happened before these texts mounted, so
  // without this nudge the once:true reveals would sit frozen at their start
  // offset (verified live). One refresh after the post-intro mount fires them.
  useEffect(() => {
    if (!introReady) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [introReady]);

  const scrollHint = (
    <button
      type="button"
      onClick={() => scrollToPanel('p-images')}
      className="u-label inline-flex items-center gap-2 text-ink/70 transition-colors hover:text-sage"
    >
      {t.hero.scrollHint}
      {horizontal ? (
        <ArrowRight aria-hidden className="h-3.5 w-3.5 rtl:-scale-x-100" />
      ) : (
        <ArrowDown aria-hidden className="h-3.5 w-3.5" />
      )}
    </button>
  );

  return (
    <HPanel
      w={85}
      theme="cream"
      id="p-hero"
      className="overflow-hidden"
      fallbackClassName="min-h-[100dvh]"
    >
      {horizontal ? (
        <>
          {/* single h1, three visual clusters (a11y: one heading, spans/blocks);
              mounted after the intro gate so the reveals play as the curtain lifts */}
          {introReady && (
            <>
              <h1 className="m-0">
                <RevealText
                  text={t.hero.h1}
                  as="div"
                  className="hero-sans absolute start-[6vw] top-[15vh]"
                />
                <RevealText
                  text={t.hero.h2}
                  as="div"
                  className="hero-sans absolute start-[30vw] top-[30vh] max-w-[36vw]"
                />
                <RevealText
                  text={t.hero.emph}
                  as="div"
                  stagger={0.08}
                  className="t-hero font-display hero-em absolute start-[12vw] top-[47vh]"
                />
              </h1>

              {/* lead paragraph, lower-start area (reference .hero__lead) */}
              <Reveal delay={0.3} className="absolute start-[42vw] top-[63vh]">
                <p className="max-w-[34ch] leading-relaxed text-ink-soft">{t.hero.intro}</p>
              </Reveal>
            </>
          )}

          {/* bottom chrome row; stops 12vw short of the end edge (breathing room) */}
          <div className="absolute bottom-8 end-[12vw] start-[3.5vw] flex items-end justify-between gap-6">
            <Eyebrow className="text-ink-soft">{t.hero.role}</Eyebrow>
            {scrollHint}
            <SpinningBadge size={110} className="opacity-80" />
          </div>
        </>
      ) : (
        <Container className="relative flex min-h-[100dvh] flex-col justify-center gap-12 py-24">
          {introReady && (
            <>
              <h1 className="m-0">
                <RevealText text={t.hero.h1} as="div" className="hero-sans" />
                <RevealText text={t.hero.h2} as="div" className="hero-sans ms-[8%]" />
                <RevealText
                  text={t.hero.emph}
                  as="div"
                  stagger={0.08}
                  className="t-hero font-display hero-em ms-[4%]"
                />
              </h1>

              <Reveal delay={0.3}>
                <p className="max-w-[34ch] leading-relaxed text-ink-soft">{t.hero.intro}</p>
              </Reveal>
            </>
          )}

          <div className="flex flex-wrap items-end justify-between gap-6">
            <Eyebrow className="text-ink-soft">{t.hero.role}</Eyebrow>
            {scrollHint}
            <SpinningBadge size={110} className="opacity-80" />
          </div>
        </Container>
      )}

      {/* vertical name micro-label at the panel's end edge (both modes) */}
      <EdgeLabel className="absolute end-5 top-1/2 hidden -translate-y-1/2 text-ink-soft sm:block">
        {t.hero.name}
      </EdgeLabel>
    </HPanel>
  );
}
