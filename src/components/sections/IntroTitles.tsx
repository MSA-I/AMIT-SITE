import { useRef, useLayoutEffect } from 'react';
import { useI18n } from '../../i18n/context';
import { Container, Eyebrow } from '../ui';
import { Reveal, gsap, prefersReduced, useParallax } from '../../motion/anim';

/**
 * Intro statement directly after the logo hero: the studio's oversized tagline
 * (uppercase-sans lines + one display emphasis word) plus the manifesto line.
 * Carries the page's single visible <h1>.
 */
export default function IntroTitles() {
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
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="intro" data-theme="paper" className="relative overflow-hidden bg-paper text-ink">
      <Container className="grid grid-cols-12 gap-x-4 py-28 sm:py-32 md:py-44">
        <div className="col-span-12 md:col-start-2 md:col-span-10">
          <Eyebrow>{t.hero.role}</Eyebrow>
        </div>

        <h1 ref={headRef} className="col-span-12 mt-6 grid grid-cols-12 gap-x-4 text-ink">
          <span className="col-span-12 block overflow-hidden pb-[0.06em] md:col-start-2 md:col-span-7">
            <span data-l className="hero-sans inline-block will-change-transform">{t.hero.h1}</span>
          </span>
          <span className="col-span-12 mt-1 block overflow-hidden pb-[0.06em] md:col-start-4 md:col-span-8 md:mt-2">
            <span data-l className="hero-sans inline-block will-change-transform">{t.hero.h2}</span>
          </span>
          <span ref={emphRef} className="col-span-12 mt-1 block overflow-hidden pb-[0.14em] md:col-start-2 md:col-span-9 md:mt-2">
            <span data-l className="t-hero hero-em inline-block font-display will-change-transform">{t.hero.emph}</span>
          </span>
        </h1>

        <div className="col-span-12 mt-12 md:col-start-7 md:col-span-5 md:mt-16">
          <Reveal>
            <p className="max-w-[46ch] text-[clamp(1rem,0.6vw+0.95rem,1.35rem)] leading-relaxed text-ink-soft">
              {t.hero.intro}
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
