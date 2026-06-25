import { useI18n } from '../../i18n/context';
import { Container, Section, Eyebrow } from '../ui';
import { RevealText } from '../../motion/anim';

export default function Manifesto() {
  const { t } = useI18n();
  return (
    <Section id="manifesto" className="bg-cream">
      <Container>
        <Eyebrow>{t.about.eyebrow}</Eyebrow>
        <RevealText
          as="p"
          text={t.about.journey}
          stagger={0.018}
          className="mt-10 max-w-5xl font-display text-[7.5vw] leading-[1.18] text-ink md:text-5xl md:leading-[1.22]"
        />
      </Container>
    </Section>
  );
}
