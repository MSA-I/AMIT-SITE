import { useLayoutEffect, useRef } from 'react';
import { HPanel } from '../../../motion/HorizontalStage';
import { useStage, stageEdge } from '../../../motion/stageContext';
import { gsap, prefersReduced } from '../../../motion/anim';
import SpinningBadge from '../../SpinningBadge';
import { useI18n } from '../../../i18n/context';

/**
 * Chapter 05 - the narrow kinetic "values" strip (reference .panel--vstrip,
 * 14.8vw -> ours w=15, cream). A decorative palate-cleanser column: a vertical
 * oversized word repeated twice around a tiny spinning brand badge, travelling
 * vertically (y 60vh -> -40vh) scrubbed against the horizontal pin.
 * Fallback / reduced-motion: a small static h-40 divider strip with the word
 * rendered once. Entirely decorative (aria-hidden), no focusable content.
 */
export default function PanelStrip() {
  const { t } = useI18n();
  const { horizontal, tween } = useStage();
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Only the active horizontal stage animates; skip while the pin tween has
    // not landed yet (MOTION API rule), rebuild when it arrives via deps.
    if (!horizontal || !tween || prefersReduced()) return;
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    const panel = wrap.closest<HTMLElement>('[data-hpanel]') ?? wrap;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        track,
        { y: '60vh' },
        {
          y: '-40vh',
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: tween,
            start: () => stageEdge(tween, panel, 100),
            end: () => stageEdge(tween, panel, 0),
            scrub: 0.5,
          },
        },
      );
    }, wrap);
    return () => ctx.revert();
  }, [horizontal, tween]);

  return (
    <HPanel
      w={15}
      theme="cream"
      id="p-strip"
      className={horizontal ? 'overflow-hidden border-s border-line' : ''}
      fallbackClassName="flex h-40 items-center justify-center border-y border-line"
    >
      {horizontal ? (
        <div ref={wrapRef} aria-hidden="true" className="absolute inset-0">
          <div
            ref={trackRef}
            className="absolute inset-x-0 top-0 flex flex-col items-center gap-10 will-change-transform"
          >
            <span className="t-section font-display whitespace-nowrap rotate-180 [writing-mode:vertical-rl]">
              {t.homeStage.stripWord}
            </span>
            <SpinningBadge size={56} className="shrink-0" />
            <span className="t-section font-display whitespace-nowrap rotate-180 [writing-mode:vertical-rl]">
              {t.homeStage.stripWord}
            </span>
          </div>
        </div>
      ) : (
        <span aria-hidden="true" className="t-section font-display">
          {t.homeStage.stripWord}
        </span>
      )}
    </HPanel>
  );
}
