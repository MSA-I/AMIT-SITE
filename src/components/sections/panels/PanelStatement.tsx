import { useI18n } from '../../../i18n/context';
import { Container, Eyebrow, CornerMark } from '../../ui';
import { Reveal, RevealText, useDriftX } from '../../../motion/anim';
import { HPanel } from '../../../motion/HorizontalStage';
import { useStage } from '../../../motion/stageContext';

/**
 * Chapter 03 - the big editorial statement (reference .panel--ntitle, 83.6vw).
 * Ours: 80vw cream panel. Headline owns the start ~60%, the paragraph sits
 * offset at the end-bottom (editorial asymmetry), a small eyebrow floats in
 * the start gutter at mid-height and the rotated brand mark drifts in the
 * top-end corner.
 */
export default function PanelStatement() {
  const { t } = useI18n();
  const { horizontal } = useStage();
  const driftRef = useDriftX<HTMLDivElement>(50);

  const s = t.homeStage;
  const body = (
    <p className="text-[clamp(1rem,0.55vw+0.9rem,1.25rem)] leading-relaxed text-ink-soft">
      {s.statementBody}
    </p>
  );

  return (
    <HPanel w={80} theme="cream" id="p-statement" fallbackClassName="py-32">
      {horizontal ? (
        <>
          {/* small label in the start gutter, mid-height (reference: left 2rem / top 49vh) */}
          <Reveal className="absolute start-[2.5vw] top-[48vh]">
            <Eyebrow>{s.statementEyebrow}</Eyebrow>
          </Reveal>

          {/* oversized display headline, start 60% (reference: left 9.6rem / top 17.2vh) */}
          <RevealText
            as="h2"
            text={s.statementTitle}
            className="t-section absolute start-[8vw] top-[16vh] max-w-[14ch]"
          />

          {/* paragraph offset to the end-bottom */}
          <Reveal className="absolute bottom-[12vh] end-[6vw] w-[26vw] max-w-md">
            {body}
          </Reveal>

          {/* rotated brand stamp drifting in the top-end corner */}
          <div ref={driftRef} className="absolute end-[4vw] top-[9vh]">
            <CornerMark
              word={t.brand.mark}
              className="text-xl text-ink/50 md:text-2xl"
            />
          </div>
        </>
      ) : (
        <Container>
          <Reveal>
            <Eyebrow>{s.statementEyebrow}</Eyebrow>
          </Reveal>

          <RevealText
            as="h2"
            text={s.statementTitle}
            className="t-section mt-10 max-w-[14ch]"
          />

          <div className="mt-16 flex justify-end md:mt-24">
            <Reveal className="w-full max-w-md">{body}</Reveal>
          </div>

          <div ref={driftRef} className="mt-16 flex">
            <CornerMark
              word={t.brand.mark}
              className="text-lg text-ink/50 md:text-xl"
            />
          </div>
        </Container>
      )}
    </HPanel>
  );
}
