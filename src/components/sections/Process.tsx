import { useI18n } from '../../i18n/context';
import { Container, Eyebrow } from '../ui';
import { Reveal, RevealText } from '../../motion/anim';

/**
 * Process - LIGHT editorial section (paper theme).
 * A bold numbered sequence: each step is a row with a huge font-display
 * number, a serif title and a prose description, separated by hairlines.
 * The heading column pins (CSS sticky, no JS) while the steps scroll past.
 */
export default function Process() {
  const { t } = useI18n();
  const steps = t.process.steps;

  return (
    <section
      id="process"
      data-theme="paper"
      className="bg-paper py-28 text-ink md:py-40"
    >
      <Container>
        <div className="grid grid-cols-1 gap-y-16 md:grid-cols-12 md:gap-x-12">
          {/* Sticky heading column */}
          <header className="md:col-span-4">
            <div className="md:sticky md:top-32">
              <Eyebrow>{t.process.eyebrow}</Eyebrow>

              <RevealText
                as="h2"
                text={t.process.heading}
                className="mt-6 font-display text-5xl leading-[0.92] tracking-tight text-ink md:text-6xl lg:text-7xl"
              />

              <div className="u-label mt-8 flex items-center gap-2.5 text-ink-soft">
                <span className="accent-dot" aria-hidden />
                <span className="tabular-nums">
                  {steps[0].n} - {steps[steps.length - 1].n}
                </span>
              </div>
            </div>
          </header>

          {/* Numbered steps */}
          <ol className="md:col-span-8 md:col-start-5">
            {steps.map((step, i) => (
              <Reveal
                as="li"
                key={step.n}
                delay={i * 0.05}
                className="border-t border-line py-10 last:border-b md:py-14"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-baseline md:gap-12">
                  <span className="font-display text-7xl leading-[0.9] tabular-nums text-ink md:text-9xl">
                    {step.n}
                  </span>

                  <div className="flex-1">
                    <h3 className="font-display text-2xl tracking-tight text-ink md:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-4 max-w-prose leading-relaxed text-ink-soft">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
