import { useI18n } from '../../i18n/context';
import { Container, Eyebrow } from '../ui';
import { RevealLines } from '../../motion/anim';
import FlipMedia from '../../motion/FlipMedia';
import { projects, title } from '../../data/projects';

/**
 * Dark editorial band showing the flip-reveal variety (different clip-wipe
 * directions) over real project photography. Mirrors the reference's stacked
 * image-flip sections, in Amit's monochrome palette.
 */
export default function FlipShowcase() {
  const { t, lang } = useI18n();
  const picks = projects.slice(0, 2);
  if (picks.length < 2) return null;

  return (
    <section data-theme="cream" className="relative overflow-hidden bg-cream text-ink">
      <Container className="py-24 sm:py-28 md:py-36">
        <div className="max-w-[22ch]">
          <Eyebrow>{t.portfolio.eyebrow}</Eyebrow>
          <RevealLines as="h2" text={t.about.style} className="t-section mt-6 text-ink" />
        </div>

        <div className="mt-14 grid grid-cols-12 gap-6 md:mt-20">
          <figure className="col-span-12 md:col-span-7">
            <FlipMedia
              src={picks[0].cover}
              alt={title(picks[0], lang)}
              variant="leftRight"
              className="aspect-[4/3] w-full"
            />
            <figcaption className="u-label mt-3 text-ink-soft">{title(picks[0], lang)}</figcaption>
          </figure>
          <figure className="col-span-12 md:col-span-5 md:mt-24">
            <FlipMedia
              src={picks[1].cover}
              alt={title(picks[1], lang)}
              variant="upDown"
              className="aspect-[3/4] w-full"
            />
            <figcaption className="u-label mt-3 text-ink-soft">{title(picks[1], lang)}</figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
}
