import { Container, Eyebrow, EdgeLabel } from '../ui';
import { Reveal, RevealText } from '../../motion/anim';
import { useI18n } from '../../i18n/context';

export default function Services() {
  const { t } = useI18n();
  const { eyebrow, heading, groups } = t.services;

  return (
    <section
      id="services"
      data-theme="cream"
      className="relative overflow-hidden bg-cream py-28 text-ink md:py-40"
    >
      <EdgeLabel className="pointer-events-none absolute end-3 top-28 hidden select-none font-display text-8xl leading-none tracking-tight text-ink/[0.04] lg:block">
        SERVICES
      </EdgeLabel>

      <Container className="relative">
        <header className="max-w-4xl">
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
          <RevealText
            text={heading}
            as="h2"
            className="mt-6 font-display text-5xl leading-[0.92] tracking-tight sm:text-6xl md:text-8xl"
          />
        </header>

        <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-16 md:mt-24 md:grid-cols-3 md:gap-x-12">
          {groups.map((group, i) => (
            <Reveal key={group.title} delay={i * 0.12}>
              <div className="flex flex-col">
                <h3 className="font-display text-2xl tracking-tight md:text-3xl">
                  {group.title}
                </h3>
                <span aria-hidden className="mt-5 block h-px w-10 bg-sage" />

                <ul className="mt-7 flex flex-col divide-y divide-line border-t border-line text-start">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-3.5 py-4 text-ink-soft">
                      <span aria-hidden className="accent-dot shrink-0" />
                      <span className="text-base leading-relaxed md:text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
