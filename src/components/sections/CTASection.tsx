import { ArrowUpRight } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { Container, Section, Eyebrow, LangLink, SlideLabel, CornerMark, btnSolidInv } from '../ui';
import { Reveal, RevealText } from '../../motion/anim';

export default function CTASection() {
  const { t } = useI18n();

  return (
    <Section data-theme="ink" className="relative overflow-hidden bg-ink text-cream">
      <Container>
        {/* centered parenthetical micro-label, carrying the lone sage accent dot */}
        <Reveal className="flex justify-center">
          <Eyebrow className="text-cream/70">({t.nav.contact})</Eyebrow>
        </Reveal>

        {/* the loudest type on the site: oversized serif word bleeding edge-to-edge */}
        <RevealText
          text={t.cta.word}
          as="h2"
          className="t-divider divider-word mt-6 text-center text-[clamp(3rem,18vw+1rem,28rem)] leading-[0.82]"
        />

        {/* visible-on-dark action */}
        <Reveal delay={0.05} className="mt-12 text-center">
          <LangLink
            to="/contact"
            data-cursor
            className={`${btnSolidInv} group overflow-hidden`}
          >
            <SlideLabel>{t.cta.button}</SlideLabel>
            <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
          </LangLink>
        </Reveal>
      </Container>

      {/* recurring kinetic corner mark */}
      <CornerMark word={t.brand.mark} className="absolute bottom-6 end-6 text-2xl text-cream/60 md:text-4xl" />
    </Section>
  );
}
