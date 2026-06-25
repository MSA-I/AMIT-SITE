import { useRef, useLayoutEffect } from 'react';
import { useI18n } from '../../i18n/context';
import { Container, Eyebrow, EdgeLabel, btnSolid, btnLine, LangLink } from '../ui';
import { gsap, prefersReduced, useParallax } from '../../motion/anim';
import { scrollToEl } from '../../motion/smooth';

const HERO_IMG = '/projects/modern-penthouse/01.webp';

export default function Hero() {
  const { t, lang } = useI18n();
  const headRef = useRef<HTMLHeadingElement>(null);
  const imgRef = useParallax<HTMLImageElement>(60);

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
      {/* full-bleed image */}
      <div className="absolute inset-y-0 end-0 h-full w-full overflow-hidden md:w-[42%]">
        <img
          ref={imgRef}
          src={HERO_IMG}
          alt={`${t.hero.name} - ${t.hero.role}`}
          className="absolute inset-0 h-[118%] w-full -translate-y-[8%] object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-cream/30 md:hidden" />
      </div>

      <Container className="relative flex min-h-[100dvh] flex-col justify-center pt-28 pb-20">
        <Eyebrow className="text-ink">{t.hero.role}</Eyebrow>

        <h1
          ref={headRef}
          className="mt-7 max-w-[15ch] font-display text-[12vw] font-light leading-[0.95] tracking-[-0.01em] text-ink md:text-[8rem] lg:text-[9rem]"
        >
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-l className="inline-block will-change-transform">{t.hero.h1}</span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-l className="inline-block will-change-transform">{t.hero.h2}</span>
          </span>
          <span className="block overflow-hidden pb-[0.12em]">
            <span
              data-l
              className={`inline-block will-change-transform ${lang === 'en' ? 'italic' : 'font-normal'}`}
            >
              {t.hero.emph}
            </span>
          </span>
        </h1>

        <p className="mt-8 max-w-md text-lg leading-relaxed text-ink-soft">{t.hero.intro}</p>

        <div className="mt-9 flex flex-wrap items-center gap-8">
          <LangLink to="/contact" className={btnSolid} data-cursor>
            {t.hero.ctaPrimary}
          </LangLink>
          <a
            href="#work"
            onClick={(e) => { e.preventDefault(); scrollToEl('#work'); }}
            className={btnLine}
            data-cursor
          >
            {t.hero.ctaSecondary}
          </a>
        </div>
      </Container>

      <EdgeLabel className="pointer-events-none absolute end-5 top-1/2 -translate-y-1/2 text-ink/80">
        {t.hero.name}
      </EdgeLabel>
    </section>
  );
}
