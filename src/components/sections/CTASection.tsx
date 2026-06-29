import { ArrowUpRight } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { Container, Section, Eyebrow, FillButton } from '../ui';
import SpinningBadge from '../SpinningBadge';
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

        {/* visible-on-dark action: direction-aware fill sweeps in from the pointer edge */}
        <Reveal delay={0.05} className="mt-12 flex justify-center">
          <FillButton
            to="/contact"
            className="border border-cream/50 px-8 py-4 text-sm font-medium tracking-wide text-cream"
            fillClass="bg-cream"
            hoverTextClass="text-ink"
          >
            <span className="inline-flex items-center gap-2">
              {t.cta.button}
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
            </span>
          </FillButton>
        </Reveal>
      </Container>

      {/* rotating brand badge */}
      <SpinningBadge size={104} className="absolute bottom-6 end-6 opacity-70" />
    </Section>
  );
}
