import { useI18n } from '../../i18n/context';
import { Container, Section, Heading, Reveal } from '../ui';

const ABOUT_IMG = '/projects/private-villa/03.webp';

export default function About() {
  const { t } = useI18n();

  return (
    <Section id="about" className="bg-bg">
      <Container className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Image column (portrait-feel) */}
        <Reveal className="lg:col-span-5 lg:order-last">
          <div className="relative">
            <div
              className="absolute inset-0 translate-x-4 translate-y-4 border border-copper/40 rtl:-translate-x-4"
              aria-hidden
            />
            <img
              src={ABOUT_IMG}
              alt={t.about.heading}
              width={1200}
              height={1500}
              loading="lazy"
              className="relative aspect-[4/5] w-full object-cover"
            />
          </div>
        </Reveal>

        {/* Text column */}
        <Reveal delay={0.1} className="lg:col-span-7">
          <Heading eyebrow={t.about.eyebrow} title={t.about.heading} />

          <div className="mt-8 flex max-w-prose flex-col gap-5 text-base leading-relaxed text-muted md:text-lg">
            <p>{t.about.journey}</p>
            <p>{t.about.style}</p>
          </div>

          {/* Values */}
          <p className="mt-12 text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
            {t.about.valuesHeading}
          </p>
          <ul className="mt-5 border-t border-line">
            {t.about.values.map((value, i) => (
              <li
                key={i}
                className="flex items-baseline gap-5 border-b border-line py-5"
              >
                <span className="font-display text-sm font-medium tabular-nums text-copper">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-lg font-medium text-ink">{value}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
