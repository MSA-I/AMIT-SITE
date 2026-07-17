import { useI18n } from '../../i18n/context';
import { Container, EdgeLabel } from '../ui';
import { Reveal, RevealText, useParallax } from '../../motion/anim';

const ABOUT_IMG = '/about/amit.webp';

export default function About() {
  const { t } = useI18n();
  const imgRef = useParallax<HTMLImageElement>(60);

  return (
    <section
      id="about"
      data-theme="ink"
      className="relative min-h-screen overflow-hidden bg-ink py-28 text-cream md:py-40"
    >
      <EdgeLabel className="pointer-events-none absolute end-4 top-28 text-cream/80 md:end-8 md:top-40">
        {t.about.eyebrow}
      </EdgeLabel>

      <Container>
        <RevealText
          as="h2"
          text={t.about.heading}
          className="max-w-5xl font-display text-6xl leading-[0.92] text-cream md:text-8xl"
        />

        <Reveal y={36} delay={0.05}>
          <p className="mt-12 max-w-4xl font-display text-2xl leading-snug text-cream md:mt-16 md:text-4xl">
            {t.about.style}
          </p>
        </Reveal>

        <Reveal y={28} delay={0.1}>
          <p className="mt-10 max-w-3xl text-lg leading-relaxed text-cream/85 md:mt-12 md:text-xl">
            {t.about.journey}
          </p>
        </Reveal>

        <div className="mt-20 grid grid-cols-1 gap-12 md:mt-32 md:grid-cols-12 md:gap-16">
          {/* Parallax portrait */}
          <Reveal as="figure" className="md:col-span-6 lg:col-span-7">
            <div className="relative aspect-[4/5] overflow-hidden bg-cream/5">
              <img
                ref={imgRef}
                src={ABOUT_IMG}
                alt={t.about.heading}
                width={900}
                height={1125}
                loading="lazy"
                className="absolute inset-0 h-[115%] w-full -translate-y-[6%] object-cover"
              />
            </div>
          </Reveal>

          {/* Values */}
          <div className="md:col-span-6 lg:col-span-5">
            <p className="u-label text-cream/70">{t.about.valuesHeading}</p>
            <ul className="mt-8 border-t border-cream/15">
              {t.about.values.map((value, i) => (
                <Reveal
                  key={i}
                  as="li"
                  delay={i * 0.08}
                  className="flex items-baseline gap-6 border-b border-cream/15 py-6 md:py-7"
                >
                  <span className="font-display text-base tabular-nums text-cream/50">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-2xl leading-snug text-cream">{value}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
