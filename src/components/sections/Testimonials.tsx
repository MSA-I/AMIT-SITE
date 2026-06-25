import { Quote } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { Container, Section, Heading, Reveal, Rule } from '../ui';

export default function Testimonials() {
  const { t, dir } = useI18n();

  return (
    <Section id="testimonials" className="bg-bg">
      <Container>
        <Heading eyebrow={t.testimonials.eyebrow} title={t.testimonials.heading} />

        <ul className="mt-14 grid grid-cols-1 gap-6 md:mt-20 md:grid-cols-2 md:gap-8">
          {t.testimonials.items.map((item, i) => (
            <Reveal
              as="li"
              key={item.name}
              delay={i * 0.06}
              className="h-full"
            >
              <figure className="flex h-full flex-col border border-line bg-surface p-8 text-start md:p-10">
                <Quote
                  className={`h-7 w-7 shrink-0 text-copper ${dir === 'rtl' ? 'scale-x-[-1]' : ''}`}
                  aria-hidden
                />

                <blockquote className="mt-6 grow text-lg leading-loose text-ink">
                  {item.quote}
                </blockquote>

                <figcaption className="mt-8 flex items-center gap-3">
                  <Rule className="w-8" />
                  <span className="font-display text-base font-medium tracking-tight text-ink">
                    {item.name}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
