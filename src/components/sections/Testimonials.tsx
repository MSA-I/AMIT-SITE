import { useI18n } from '../../i18n/context';
import { Container, Eyebrow, Marquee } from '../ui';
import { Reveal, RevealText } from '../../motion/anim';

export default function Testimonials() {
  const { t, lang } = useI18n();

  const items = t.testimonials.items;
  const names = items.map((item) => item.name);
  // Hebrew sets need looser leading than the Latin default.
  const quoteLeading = lang === 'he' ? 'leading-[1.5]' : 'leading-[1.3]';

  return (
    <section
      id="testimonials"
      data-theme="ink"
      className="bg-ink py-28 text-cream md:py-40"
    >
      <Container>
        <Eyebrow>{t.testimonials.eyebrow}</Eyebrow>

        <RevealText
          as="h2"
          text={t.testimonials.heading}
          className="mt-8 font-display text-6xl leading-[0.95] text-cream md:text-8xl"
        />

        <div className="mt-16 grid grid-cols-1 gap-x-16 md:mt-24 md:grid-cols-2">
          {items.map((item, i) => (
            <Reveal
              as="figure"
              key={item.name}
              delay={(i % 2) * 0.08}
              className="flex flex-col border-t border-cream/15 py-12 md:py-16"
            >
              <blockquote
                className={`font-display text-2xl text-cream md:text-4xl ${quoteLeading}`}
              >
                {item.quote}
              </blockquote>

              <figcaption className="mt-8 inline-flex items-center gap-3">
                <span className="accent-dot" />
                <span className="u-label font-sans text-cream/80">{item.name}</span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </Container>

      <div className="mt-20 border-t border-cream/15 pt-12 md:mt-28 md:pt-16">
        <Marquee items={names} className="text-cream" />
      </div>
    </section>
  );
}
