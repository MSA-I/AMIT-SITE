import { HPanel } from '../../../motion/HorizontalStage';
import { useStage } from '../../../motion/stageContext';
import { RevealHighlight, RevealText } from '../../../motion/anim';
import FlipMedia from '../../../motion/FlipMedia';
import { Container } from '../../ui';
import { useI18n } from '../../../i18n/context';
import { projects, title } from '../../../data/projects';

/**
 * Chapter 04 - THE dark chapter (reference .panel--black, 162vw -> ours 150vw).
 * A slow cinematic ink spread in four beats: tall two-layer flip, the big
 * serif lead statement over a smaller scrubbed word-highlight paragraph, a
 * smaller offset flip, and a giant ghost chapter numeral closing the panel -
 * so no continuous stretch of empty ink exceeds ~20vw.
 * Vertical fallback: dark section with the lead + paragraph between the two
 * figures.
 */
export default function PanelDark() {
  const { t, lang } = useI18n();
  const { horizontal } = useStage();

  const first = projects[2]; // private-villa
  const second = projects[3]; // modern-home

  // The lead is the big serif moment; in the pinned 100vh panel its size is
  // capped against viewport HEIGHT too so the 2-3 line measure can never
  // overflow the stage (t-section look preserved on tall screens).
  const leadClass = horizontal
    ? 't-section font-display text-cream [font-size:min(clamp(2rem,5vw_+_0.75rem,6rem),8.5vh)]'
    : 't-section font-display max-w-[14ch] text-cream';
  const bodyClass = 'max-w-[40ch] text-lg leading-relaxed text-cream/80';

  return (
    <HPanel w={150} theme="ink" id="p-dark" fallbackClassName="py-24 md:py-32">
      <h2 className="sr-only">{t.homeStage.panelAria.dark}</h2>

      {horizontal ? (
        <>
          <span className="u-label absolute start-[4vw] top-[7vh] text-cream/60">04</span>

          {/* Beat 1: tall two-layer flip (reference blk__flip--a).
              FlipMedia keeps its own `relative` (top-layer anchor), so the
              absolute placement lives on a wrapper div - passing `absolute`
              into FlipMedia's className loses to its base class. */}
          <div className="absolute start-[9vw] top-[11vh] h-[78vh] w-[38vw]">
            <FlipMedia
              src={first.cover}
              alt={title(first, lang)}
              src2={first.images[1]?.full}
              alt2={title(first, lang)}
              variant="rightLeft"
              className="h-full w-full"
            />
          </div>

          {/* Beat 2: big serif lead + smaller offset word-highlight paragraph */}
          <div className="absolute start-[54vw] top-[20vh] w-[38vw]">
            <RevealText as="h3" text={t.homeStage.darkStatementLead} className={leadClass} />
          </div>
          <div className="absolute start-[60vw] top-[58vh] w-[30vw]">
            <RevealHighlight text={t.homeStage.darkStatement} className={bodyClass} />
          </div>

          {/* Beat 3: smaller offset flip (reference blk__flip--b), pulled
              inboard so the ink never runs empty for more than ~20vw */}
          <div className="absolute start-[97vw] top-[38vh] h-[48vh] w-[26vw]">
            <FlipMedia
              src={second.cover}
              alt={title(second, lang)}
              src2={second.images[1]?.full}
              alt2={title(second, lang)}
              variant="leftRight"
              className="h-full w-full"
            />
          </div>

          {/* Beat 4: giant ghost numeral closes the chapter */}
          <span
            aria-hidden
            className="t-value font-display absolute start-[130vw] top-1/2 -translate-y-1/2 text-cream/15"
          >
            04
          </span>
        </>
      ) : (
        <Container>
          <span className="u-label text-cream/60">04</span>

          <FlipMedia
            src={first.cover}
            alt={title(first, lang)}
            src2={first.images[1]?.full}
            alt2={title(first, lang)}
            variant="rightLeft"
            className="mt-10 h-[55vh] w-[90%] max-w-3xl"
          />

          <RevealText
            as="h3"
            text={t.homeStage.darkStatementLead}
            className={`${leadClass} mt-16 md:mt-24`}
          />
          <RevealHighlight
            text={t.homeStage.darkStatement}
            className={`${bodyClass} mb-16 mt-8 md:mb-24`}
          />

          <FlipMedia
            src={second.cover}
            alt={title(second, lang)}
            src2={second.images[1]?.full}
            alt2={title(second, lang)}
            variant="leftRight"
            className="ms-auto h-[40vh] w-[70%] max-w-xl"
          />
        </Container>
      )}
    </HPanel>
  );
}
