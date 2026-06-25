import { useI18n } from '../../i18n/context';
import { Reveal, RevealText, useParallax } from '../../motion/anim';
import { Eyebrow } from '../ui';

type ThemeKey = 'cream' | 'ink' | 'paper';

const THEME: Record<ThemeKey, { bg: string; fg: string; muted: string; hair: string }> = {
  cream: { bg: 'bg-cream', fg: 'text-ink', muted: 'text-ink-soft', hair: 'bg-line' },
  ink: { bg: 'bg-ink', fg: 'text-cream', muted: 'text-cream/70', hair: 'bg-cream/15' },
  paper: { bg: 'bg-paper', fg: 'text-ink', muted: 'text-ink-soft', hair: 'bg-line' },
};

const PANELS: { theme: ThemeKey; photo: string; photoFirst: boolean }[] = [
  { theme: 'cream', photo: '/projects/modern-penthouse/04.webp', photoFirst: false },
  { theme: 'ink', photo: '/projects/private-villa/06.webp', photoFirst: true },
  { theme: 'paper', photo: '/projects/luxury-apartment/08.webp', photoFirst: false },
];

function Panel({
  index,
  theme,
  photo,
  photoFirst,
  value,
  eyebrow,
}: {
  index: number;
  theme: ThemeKey;
  photo: string;
  photoFirst: boolean;
  value: string;
  eyebrow: string;
}) {
  const img = useParallax<HTMLImageElement>(64);
  const tc = THEME[theme];
  const idx = String(index + 1).padStart(2, '0');

  return (
    <section
      data-theme={theme}
      className={`relative flex min-h-[100dvh] w-full flex-col overflow-hidden md:flex-row ${tc.bg} ${tc.fg}`}
    >
      {/* Cinematic photo, bleeding off the opposite edge from the text */}
      <figure
        className={`relative flex h-[48vh] w-full items-center overflow-hidden md:h-auto md:w-[56%] ${
          photoFirst ? 'md:order-1' : 'md:order-2'
        }`}
      >
        <img
          ref={img}
          src={photo}
          alt={value}
          loading="lazy"
          decoding="async"
          className="h-[128%] min-h-full w-full shrink-0 object-cover"
        />
      </figure>

      {/* Text side */}
      <div
        className={`relative flex w-full flex-col justify-center overflow-hidden px-6 py-16 md:w-[44%] md:px-12 lg:px-20 ${
          photoFirst ? 'md:order-2' : 'md:order-1'
        }`}
      >
        <Reveal className="relative z-10">
          <div className="flex items-center gap-4">
            <span className="u-label tabular-nums text-2xl md:text-3xl">{idx}</span>
            <span className={`h-px w-10 ${tc.hair}`} aria-hidden />
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
        </Reveal>

        <RevealText
          as="h2"
          text={value}
          className="relative z-10 mt-8 max-w-[15ch] font-display text-5xl leading-[0.95] md:mt-10 md:text-7xl"
        />
      </div>
    </section>
  );
}

export default function Values() {
  const { t } = useI18n();
  const values = t.about.values;

  return (
    <div id="values">
      {PANELS.map((p, i) => (
        <Panel
          key={p.theme}
          index={i}
          theme={p.theme}
          photo={p.photo}
          photoFirst={p.photoFirst}
          value={values[i]}
          eyebrow={t.about.valuesHeading}
        />
      ))}
    </div>
  );
}
