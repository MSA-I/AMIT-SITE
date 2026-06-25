import { ArrowUpRight } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { Container, Section, Eyebrow, LangLink, SlideLabel, btnSolid } from '../ui';
import { Reveal, RevealText } from '../../motion/anim';

export default function CTASection() {
  const { t } = useI18n();

  return (
    <Section data-theme="ink" className="bg-ink text-cream">
      <Container>
        <Reveal>
          <Eyebrow>{t.cta.eyebrow}</Eyebrow>
        </Reveal>

        <RevealText
          text={t.cta.heading}
          as="h2"
          className="mt-7 font-display font-light text-5xl leading-[0.95] md:text-7xl"
        />

        <Reveal delay={0.05} className="mt-12">
          <LangLink
            to="/contact"
            data-cursor
            className={`${btnSolid} group overflow-hidden`}
          >
            <SlideLabel>{t.cta.button}</SlideLabel>
            <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
          </LangLink>
        </Reveal>
      </Container>
    </Section>
  );
}
