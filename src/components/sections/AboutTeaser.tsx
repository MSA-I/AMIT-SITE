import { useI18n } from '../../i18n/context';
import { Container, Section, LangLink, SlideLabel, Eyebrow, CornerMark } from '../ui';
import { Reveal, RevealText, RevealLines, useParallax } from '../../motion/anim';

/**
 * AboutTeaser - first hard light->dark cut after the Hero (the reference's
 * philosophy beat). Dark color block (data-theme="ink", bg-ink text-cream):
 * a 12-col grid with the heading + longer philosophy paragraph (RevealLines,
 * auto-static in RTL/reduced) on one side and a stacked, offset 2-photo grid
 * (real /projects photos, parallax depth) on the other.
 */
export default function AboutTeaser() {
  const { t } = useI18n();
  const img1 = useParallax<HTMLImageElement>(50);
  const img2 = useParallax<HTMLImageElement>(90);

  return (
    <Section
      data-theme="ink"
      className="relative overflow-hidden bg-ink text-cream"
    >
      <Container>
        <div className="grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-12 md:items-end">
          {/* philosophy column */}
          <div className="md:col-span-5">
            <Eyebrow>{t.about.eyebrow}</Eyebrow>

            <RevealText
              as="h2"
              text={t.about.heading}
              className="mt-8 font-display text-[clamp(2.5rem,7vw,7rem)] font-light leading-[0.95] text-cream"
            />

            <RevealLines
              as="p"
              text={t.about.journey}
              className="mt-10 max-w-xl text-lg leading-relaxed text-cream/80 md:mt-12 md:text-xl"
            />

            <Reveal y={24} delay={0.1}>
              <LangLink
                to="/about"
                className="group u-label mt-12 inline-flex items-center gap-2 text-cream transition-colors hover:text-sage md:mt-14"
              >
                <SlideLabel>{t.nav.about}</SlideLabel>
                <span aria-hidden="true" className="rtl:rotate-180">&rarr;</span>
              </LangLink>
            </Reveal>
          </div>

          {/* stacked, offset 2-photo grid */}
          <div className="relative md:col-span-6 md:col-start-7">
            <Reveal as="figure" y={40} className="relative md:me-[18%]">
              <div className="relative aspect-[4/5] overflow-hidden bg-cream/5">
                <img
                  ref={img1}
                  src="/projects/private-villa/06.webp"
                  alt={t.about.imageAlts[0]}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-[115%] w-full -translate-y-[6%] object-cover"
                />
              </div>
            </Reveal>

            <Reveal as="figure" y={40} delay={0.1} className="relative -mt-20 md:-mt-28 md:ms-[20%]">
              <div className="relative aspect-[3/4] overflow-hidden bg-cream/5">
                <img
                  ref={img2}
                  src="/projects/modern-home/03.webp"
                  alt={t.about.imageAlts[1]}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-[120%] w-full -translate-y-[8%] object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </Container>

      {/* recurring kinetic corner mark on this first dark beat */}
      <CornerMark
        word={t.brand.mark}
        className="absolute bottom-6 end-6 text-2xl text-cream/60 md:text-4xl"
      />
    </Section>
  );
}
