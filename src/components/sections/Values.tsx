import { useI18n } from '../../i18n/context';
import { Reveal, RevealText, useParallax } from '../../motion/anim';
import { Eyebrow, EdgeLabel } from '../ui';

export default function Values() {
  const { t } = useI18n();
  const dividers = t.about.dividers;
  const alts = t.about.imageAlts;
  const img1 = useParallax<HTMLImageElement>(50);
  const img2 = useParallax<HTMLImageElement>(90);

  return (
    <section
      id="values"
      data-theme="cream"
      className="relative isolate flex min-h-[100dvh] w-full flex-col justify-center overflow-hidden bg-cream px-6 py-28 text-ink md:px-12 lg:px-20"
    >
      {/* Oversized serif divider words bleeding off the END edge, behind the photos */}
      <RevealText
        as="h2"
        text={dividers[0]}
        className="divider-word t-divider absolute end-0 top-[16vh] z-0 -me-[11vw] text-ink"
      />
      <RevealText
        as="h3"
        text={dividers[1]}
        className="divider-word t-divider absolute end-0 top-[50vh] z-0 -me-[15vw] text-ink"
      />

      {/* Two overlapping interior photos with differing parallax depth */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col md:flex-row md:items-start">
        <figure className="relative w-full overflow-hidden md:w-[58%]">
          <img
            ref={img1}
            src="/projects/private-villa/04.webp"
            alt={alts[0]}
            loading="lazy"
            decoding="async"
            className="h-[58vh] w-full object-cover md:h-[64vh]"
          />
        </figure>
        <figure className="relative mt-8 w-full overflow-hidden md:order-2 md:-mt-24 md:ms-[-4vw] md:w-[52%]">
          <img
            ref={img2}
            src="/projects/luxury-apartment/08.webp"
            alt={alts[2]}
            loading="lazy"
            decoding="async"
            className="h-[52vh] w-full object-cover md:h-[58vh]"
          />
        </figure>
      </div>

      {/* Caption block */}
      <div className="relative z-10 mx-auto mt-12 w-full max-w-[1100px]">
        <div className="max-w-sm">
          <Eyebrow>{t.about.valuesHeading}</Eyebrow>
          <Reveal>
            <p className="mt-4 leading-relaxed text-ink-soft">{t.about.style}</p>
          </Reveal>
        </div>
      </div>

      {/* Vertical micro-label */}
      <EdgeLabel className="absolute bottom-10 end-4 z-10 text-ink-soft">
        {t.about.valuesHeading}
      </EdgeLabel>
    </section>
  );
}
