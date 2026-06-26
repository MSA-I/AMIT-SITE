import { useRef, useLayoutEffect } from 'react';
import { useI18n } from '../../i18n/context';
import { Container, EdgeLabel, CornerMark } from '../ui';
import { Reveal, gsap, prefersReduced, useParallax } from '../../motion/anim';
import { scrollToEl } from '../../motion/smooth';

export default function Hero() {
  const { t } = useI18n();
  const headRef = useRef<HTMLHeadingElement>(null);
  const emphRef = useParallax<HTMLSpanElement>(40);

  useLayoutEffect(() => {
    const el = headRef.current;
    if (!el || prefersReduced()) return;
    const lines = el.querySelectorAll<HTMLElement>('[data-l]');
    const ctx = gsap.context(() => {
      gsap.set(el, { autoAlpha: 1 });
      gsap.from(lines, {
        yPercent: 115,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.35,
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-cream" data-theme="cream">
      <Container className="relative grid min-h-[100dvh] grid-cols-12 content-center gap-x-4 pt-28 pb-24">
        {/* staggered oversized type field: uppercase-sans lines + one italic-serif emphasis word */}
        <h1 ref={headRef} className="col-span-12 grid grid-cols-12 gap-x-4 text-ink">
          <span className="col-span-11 block overflow-hidden pb-[0.06em] md:col-start-2 md:col-span-6">
            <span data-l className="hero-sans inline-block will-change-transform">{t.hero.h1}</span>
          </span>
          <span className="col-span-12 mt-1 block overflow-hidden pb-[0.06em] md:col-start-6 md:col-span-7 md:mt-2">
            <span data-l className="hero-sans inline-block will-change-transform">{t.hero.h2}</span>
          </span>
          <span ref={emphRef} className="col-span-12 mt-1 block overflow-hidden pb-[0.14em] md:col-start-2 md:col-span-9 md:mt-2">
            <span data-l className="t-hero hero-em inline-block font-display will-change-transform">{t.hero.emph}</span>
          </span>
        </h1>

        {/* small fading manifesto paragraph, offset toward the end column */}
        <div className="col-span-12 mt-10 md:col-start-7 md:col-span-4 md:mt-14">
          <Reveal>
            <p className="max-w-[42ch] text-[clamp(1rem,0.55vw+0.9rem,1.2rem)] leading-relaxed text-ink-soft">
              {t.hero.intro}
            </p>
          </Reveal>
        </div>

        {/* lone floating accent dot */}
        <span aria-hidden className="accent-dot absolute bottom-[24%] start-[16%]" />

        {/* recurring kinetic corner mark */}
        <CornerMark word={t.brand.mark} className="absolute bottom-10 end-8 text-2xl text-ink/70 md:text-4xl" />

        {/* vertical role micro-label */}
        <EdgeLabel className="pointer-events-none absolute end-5 top-1/2 -translate-y-1/2 text-ink/60">
          {t.hero.role}
        </EdgeLabel>

        {/* understated scroll affordance (replaces the loud pills) */}
        <button
          onClick={() => scrollToEl('#work')}
          className="u-label absolute bottom-7 start-6 text-ink/70 transition-colors hover:text-sage"
          data-cursor
        >
          {t.hero.scrollHint}
        </button>
      </Container>
    </section>
  );
}
