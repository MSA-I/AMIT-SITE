import { useI18n } from '../../i18n/context';
import { Container, Eyebrow } from '../ui';
import { Reveal, RevealText, useParallax } from '../../motion/anim';

const AMBIENT: Record<string, string> = {
  concrete: '/projects/luxury-apartment/05.webp',
  wood: '/projects/private-villa/04.webp',
  vegetation: '/projects/modern-home/03.webp',
  brass: '/projects/modern-penthouse/07.webp',
};

function MaterialRow({
  index,
  name,
  src,
  flip,
}: {
  index: string;
  name: string;
  src: string;
  flip: boolean;
}) {
  const imgRef = useParallax<HTMLImageElement>(40);

  return (
    <Reveal className="grid grid-cols-1 items-center gap-8 border-t border-cream/15 py-14 md:grid-cols-12 md:gap-14 md:py-24">
      {/* Index + material name */}
      <div className={`md:col-span-6 ${flip ? 'md:order-last' : ''}`}>
        <span className="block font-display text-lg leading-none tabular-nums text-cream/60">
          {index}
        </span>
        <h3 className="mt-4 font-display text-6xl leading-[0.9] tracking-tight md:text-8xl">
          {name}
        </h3>
      </div>

      {/* Ambient photo with scroll parallax */}
      <div className="overflow-hidden md:col-span-6">
        <img
          ref={imgRef}
          src={src}
          alt={name}
          width={1200}
          height={900}
          loading="lazy"
          className="aspect-[4/3] w-full scale-110 object-cover"
        />
      </div>
    </Reveal>
  );
}

export default function Materials() {
  const { t } = useI18n();

  return (
    <section data-theme="ink" className="bg-ink py-28 text-cream md:py-40">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>{t.materials.eyebrow}</Eyebrow>
          <RevealText
            text={t.materials.heading}
            className="mt-6 font-display text-5xl leading-[0.95] tracking-tight md:text-7xl"
          />
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-cream/70 md:text-lg">
              {t.materials.note}
            </p>
          </Reveal>
        </div>

        <div className="mt-16 md:mt-24">
          {t.materials.items.map((item, i) => (
            <MaterialRow
              key={item.key}
              index={String(i + 1).padStart(2, '0')}
              name={item.name}
              src={AMBIENT[item.key]}
              flip={i % 2 === 1}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
