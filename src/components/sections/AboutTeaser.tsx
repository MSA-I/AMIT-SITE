import { useI18n } from '../../i18n/context';
import { Container, Section, LangLink, btnLine, SlideLabel, Eyebrow } from '../ui';
import { Reveal, RevealText } from '../../motion/anim';

/**
 * AboutTeaser - slim about teaser for the home scroll (NOT the full About section).
 * Light color block (data-theme="cream"): big editorial serif heading + one short
 * ink-soft paragraph + a line link to the full about page.
 */
export default function AboutTeaser() {
  const { t } = useI18n();

  return (
    <Section
      data-theme="cream"
      className="relative overflow-hidden bg-cream text-ink"
    >
      <Container>
        <div className="max-w-4xl">
          <Eyebrow>{t.about.eyebrow}</Eyebrow>

          <RevealText
            as="h2"
            text={t.about.heading}
            className="mt-8 font-display text-5xl font-light leading-[0.95] text-ink md:text-7xl"
          />

          <Reveal y={32} delay={0.05}>
            <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-soft md:mt-12 md:text-xl">
              {t.about.style}
            </p>
          </Reveal>

          <Reveal y={24} delay={0.1}>
            <LangLink to="/about" className={`${btnLine} mt-12 md:mt-14`}>
              <SlideLabel>{t.nav.about}</SlideLabel>
              <span aria-hidden="true" className="rtl:rotate-180">&rarr;</span>
            </LangLink>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
