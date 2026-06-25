import { useI18n } from '../../i18n/context';
import { Container, Section, Heading, Reveal } from '../ui';

export default function Process() {
  const { t } = useI18n();
  const steps = t.process.steps;

  return (
    <Section id="process" className="bg-bg">
      <Container>
        <Reveal>
          <Heading eyebrow={t.process.eyebrow} title={t.process.heading} />
        </Reveal>

        <ol className="mt-14 grid grid-cols-1 gap-10 md:mt-20 md:grid-cols-5 md:gap-6">
          {steps.map((step, i) => (
            <Reveal as="li" key={step.n} delay={i * 0.08} className="relative">
              <span className="block font-display text-5xl font-medium leading-none tracking-tight text-copper tabular-nums md:text-6xl">
                {step.n}
              </span>

              <div className="relative mt-6 border-t border-line pt-6">
                <span
                  className="absolute -top-px start-0 block h-px w-8 bg-copper"
                  aria-hidden
                />
                <h3 className="text-lg font-medium tracking-tight text-ink">{step.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
