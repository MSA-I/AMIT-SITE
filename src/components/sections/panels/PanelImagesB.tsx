import FlipMedia from '../../../motion/FlipMedia';
import { HPanel } from '../../../motion/HorizontalStage';
import { useStage } from '../../../motion/stageContext';
import { projects, title } from '../../../data/projects';
import { useI18n } from '../../../i18n/context';
import { Container } from '../../ui';

/**
 * Chapter 06 - second imagery beat (reference .panel--simages, 72.2vw -> 72vw
 * over paper): two overlapping two-layer flips, the big one anchored
 * upper-start and a smaller one cutting across it at the lower-end (chapter 02
 * composition, reversed). Uses projects[4] + projects[5] so no photo repeats
 * against the chapters that use projects[0..3].
 */
export default function PanelImagesB() {
  const { horizontal } = useStage();
  const { t, lang } = useI18n();

  const a = projects[4];
  const b = projects[5];
  const altA = title(a, lang);
  const altB = title(b, lang);
  // Second shot of each project as the wiping top layer; cover settles under.
  const topA = a.images[1]?.full ?? a.cover;
  const topB = b.images[1]?.full ?? b.cover;

  const indexMark = (
    <span aria-hidden className="u-label inline-flex items-center gap-2.5">
      <span className="accent-dot" />
      06
    </span>
  );

  return (
    <HPanel
      w={72}
      theme="paper"
      id="p-images-b"
      fallbackClassName="min-h-screen py-20 sm:py-24"
    >
      <h2 className="sr-only">{t.homeStage.panelAria.imagesB}</h2>

      {horizontal ? (
        <>
          {/* Big flip, upper-start (reference sim__flip--a, variant reversed).
              Wrapper divs carry the absolute placement: FlipMedia's own
              `relative` base class would override a passed `absolute`. */}
          <div className="absolute start-[4vw] top-[6vh] h-[62vh] w-[40vw]">
            <FlipMedia
              src={a.cover}
              alt={altA}
              src2={topA}
              alt2={altA}
              variant="rightLeft"
              className="h-full w-full"
            />
          </div>
          {/* Smaller flip overlapping at the lower-end (reference sim__flip--b) */}
          <div className="absolute bottom-[9vh] end-[5vw] z-10 h-[44vh] w-[28vw]">
            <FlipMedia
              src={b.cover}
              alt={altB}
              src2={topB}
              alt2={altB}
              variant="leftRight"
              className="h-full w-full"
            />
          </div>
          {/* Tiny chapter index in the free lower-start corner */}
          <span className="absolute bottom-[9vh] start-[4vw]">{indexMark}</span>
        </>
      ) : (
        <Container>
          <div className="mb-8">{indexMark}</div>
          <FlipMedia
            src={a.cover}
            alt={altA}
            src2={topA}
            alt2={altA}
            variant="rightLeft"
            className="h-[52vh] w-[92%]"
          />
          <FlipMedia
            src={b.cover}
            alt={altB}
            src2={topB}
            alt2={altB}
            variant="leftRight"
            className="ms-auto mt-6 h-[38vh] w-[70%] sm:mt-8"
          />
        </Container>
      )}
    </HPanel>
  );
}
