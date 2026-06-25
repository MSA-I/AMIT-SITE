import { useI18n } from '../../i18n/context';
import { Container, Section, Heading, Reveal } from '../ui';

const ambientByKey: Record<string, string> = {
  concrete: '/projects/luxury-apartment/05.webp',
  wood: '/projects/private-villa/04.webp',
  vegetation: '/projects/modern-home/03.webp',
  brass: '/projects/modern-penthouse/07.webp',
};

export default function Materials() {
  const { t } = useI18n();
  const m = t.materials;

  return (
    <Section id="materials">
      <Container>
        <Heading eyebrow={m.eyebrow} title={m.heading} sub={m.note} />

        <div className="mt-12 grid grid-cols-1 border-s border-t border-line md:mt-16 md:grid-cols-2">
          {m.items.map((item, i) => {
            const ambient = ambientByKey[item.key];
            return (
              <Reveal key={item.key} delay={i * 0.06}>
                <div className="group relative flex min-h-[200px] flex-col justify-between overflow-hidden border-e border-b border-line bg-surface p-8 md:min-h-[260px] md:p-10">
                  {ambient ? (
                    <>
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${ambient})` }}
                      />
                      <div aria-hidden className="absolute inset-0 bg-bg/80" />
                    </>
                  ) : null}

                  <span className="relative font-display text-sm tracking-[0.35em] text-copper">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <h3 className="relative mt-auto font-display text-2xl text-ink md:text-4xl">
                    {item.name}
                  </h3>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
