import { HPanel } from '../../../motion/HorizontalStage';
import { useStage } from '../../../motion/stageContext';
import { ClipReveal, Reveal } from '../../../motion/anim';
import FlipMedia from '../../../motion/FlipMedia';
import { useI18n } from '../../../i18n/context';
import { projects, title } from '../../../data/projects';

/**
 * Chapter 02 - big imagery (reference .panel--pimages, 71.8vw -> 72vw).
 * A dominant clip-reveal figure anchored to the leading edge, overlapped by a
 * two-layer scrubbed flip block in its end-bottom quadrant, plus the chapter
 * index label. Fallback: stacked figures in normal flow (reference mobile:
 * full-width single + 80%-wide flip pulled up and pushed to the end).
 */
export default function PanelImages() {
  const { t, lang } = useI18n();
  const { horizontal } = useStage();

  const big = projects[0];
  const flip = projects[1];
  const flipTop = flip.images[1]?.full ?? flip.cover;

  const label = (
    <p className="u-label flex items-center gap-2.5 text-ink-soft">
      <span>02</span>
      <span className="accent-dot" aria-hidden />
      <span>{t.homeStage.imagesLabel}</span>
    </p>
  );

  return (
    <HPanel w={72} theme="paper" id="p-images" fallbackClassName="py-24">
      <h2 className="sr-only">{t.homeStage.panelAria.images}</h2>

      {horizontal ? (
        <>
          {/* Dominant figure: leading edge, vertically centered (70vh).
              eager: this is the first media the journey reaches. */}
          <ClipReveal
            src={big.cover}
            alt={title(big, lang)}
            eager
            className="absolute start-0 top-[15vh] h-[70vh] w-[63vw]"
          />

          {/* Two-layer flip overlapping the big figure's end-bottom quadrant. */}
          <div className="absolute end-[2vw] top-[52vh] z-10 h-[40vh] w-[24vw]">
            <FlipMedia
              src={flip.cover}
              alt={title(flip, lang)}
              src2={flipTop}
              alt2={title(flip, lang)}
              eager
              variant="upDown"
              className="h-full w-full"
            />
          </div>

          {/* Chapter index + label, lifted inboard clear of the fixed frame
              mark that sweeps the bottom corners. */}
          <Reveal className="absolute bottom-[13vh] start-[4vw]">{label}</Reveal>
        </>
      ) : (
        <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-6 md:px-10">
          <Reveal className="mb-10">{label}</Reveal>

          <ClipReveal
            src={big.cover}
            alt={title(big, lang)}
            eager
            className="h-[60vh] w-full"
          />

          {/* Flip block pulled up over the big figure, pushed to the end. */}
          <div className="relative z-10 -mt-[8vh] ms-auto h-[40vh] w-4/5 md:w-3/5">
            <FlipMedia
              src={flip.cover}
              alt={title(flip, lang)}
              src2={flipTop}
              alt2={title(flip, lang)}
              variant="upDown"
              className="h-full w-full"
            />
          </div>
        </div>
      )}
    </HPanel>
  );
}
