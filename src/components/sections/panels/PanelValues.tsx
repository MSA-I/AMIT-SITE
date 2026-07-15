import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n/context';
import { Container, Eyebrow } from '../../ui';
import { gsap, Reveal, RevealText } from '../../../motion/anim';
import { useStage } from '../../../motion/stageContext';
import { HPanel } from '../../../motion/HorizontalStage';
import { projects, title } from '../../../data/projects';

/**
 * Chapter 07 - the interactive values panel (reference .panel--valores).
 * Three giant staggered value words, each in a different type treatment, with
 * a pointer-following image bubble that clip-wipes the matching project photo
 * in on hover (reference animations.js "FOLLOW-MOUSE image bubble").
 *
 * Bubble is fine-pointer + motion gated (same gate as the old Values section).
 * In horizontal mode without a fine pointer (e.g. large touch tablets) the
 * giant rows still carry the full text content; the decorative photos appear
 * inline only in the vertical fallback, which ports the old static list.
 */

/** 01 serif / 02 uppercase sans / 03 serif emphasis (italic LTR, weight RTL) */
const WORD_CLASS = ['t-value', 'hero-sans', 't-value hero-em'];

/** reference stagger: each row pushes further along the inline axis
 * (kept tight so the third row never lingers clipped at the entering edge
 * of the 95vw panel and the trailing blank stays under ~20vw) */
const ROW_INDENT = ['ms-0', 'ms-[11vw]', 'ms-[23vw]'];

export default function PanelValues() {
  const { t, lang } = useI18n();
  const { horizontal } = useStage();
  const vals = t.home.values;
  // First N projects; the hover bubble uses each project's SECOND shot
  // (thumb) so the covers used by the other chapters never rerun here.
  const media = projects.slice(0, vals.length);

  const panelRef = useRef<HTMLDivElement>(null);
  const followRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const activeRef = useRef(-1);
  const [active, setActive] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(fine && !reduce && media.length > 0);
  }, [media.length]);

  // Lerped pointer-follow inside the panel. Coordinates are panel-relative
  // (clientX - rect) like the reference: getBoundingClientRect() accounts for
  // the moving track transform, so this stays correct mid-journey. The bubble
  // is ABSOLUTE in the panel (a `fixed` box would resolve against the
  // transformed track, not the viewport) with physical left/top anchoring,
  // which is allowed for pointer followers.
  useLayoutEffect(() => {
    if (!enabled || !horizontal) return;
    const el = followRef.current;
    const panel = panelRef.current;
    if (!el || !panel) return;
    gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    const move = (e: MouseEvent) => {
      const r = panel.getBoundingClientRect();
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
    };
    panel.addEventListener('mousemove', move, { passive: true });
    return () => {
      panel.removeEventListener('mousemove', move);
      gsap.killTweensOf(el);
    };
  }, [enabled, horizontal]);

  // Hidden until the first row hover; hides again on panel mouseleave.
  useLayoutEffect(() => {
    const el = followRef.current;
    if (!el || !enabled || !horizontal) return;
    gsap.to(el, { autoAlpha: shown ? 1 : 0, duration: 0.35, ease: 'power3.out' });
  }, [shown, enabled, horizontal]);

  // Reference term-change move (animations.js:377-379): top clip wipe
  // (1.25s power3.out) + slow zoom-out (scale 2 -> 1, 2s power2.out).
  const hoverRow = (i: number) => {
    if (!enabled) return;
    setShown(true);
    if (activeRef.current === i) return;
    activeRef.current = i;
    setActive(i);
    const img = imgRefs.current[i];
    if (img) {
      gsap.fromTo(
        img,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'power3.out' }
      );
      gsap.fromTo(img, { scale: 2 }, { scale: 1, duration: 2, ease: 'power2.out' });
    }
  };

  return (
    <HPanel
      w={95}
      theme="cream"
      id="p-values"
      fallbackClassName="py-24 sm:py-28 md:py-32"
    >
      {horizontal ? (
        <div
          ref={panelRef}
          className="relative flex h-full flex-col px-[4vw] pb-[5vh] pt-[9vh]"
          onMouseLeave={() => setShown(false)}
        >
          <Eyebrow>{t.homeStage.valuesEyebrow}</Eyebrow>
          <h2 className="sr-only">{t.home.valuesHeading}</h2>

          <ul className="flex flex-1 flex-col justify-evenly">
            {vals.map((v, i) => (
              <li key={v.n} className={ROW_INDENT[i]}>
                {/* no data-cursor here: the rows are not links - the hover
                    bubble is the affordance, an "explore" cursor would promise
                    navigation that does not exist */}
                <div
                  className="flex flex-wrap items-baseline gap-x-[2.5vw] gap-y-3"
                  onMouseEnter={() => hoverRow(i)}
                >
                  <span className="u-label text-ink-soft">{v.n}</span>
                  <RevealText
                    as="h3"
                    text={v.title}
                    className={`${WORD_CLASS[i]} whitespace-nowrap`}
                  />
                  <Reveal delay={0.15} className="max-w-[17rem]">
                    <p className="text-sm leading-relaxed text-ink-soft">{v.desc}</p>
                  </Reveal>
                </div>
              </li>
            ))}
          </ul>

          {/* pointer-following image bubble (decorative; real alts live where
              the photos appear as content) */}
          {enabled && (
            <div
              ref={followRef}
              aria-hidden
              className="invisible pointer-events-none absolute left-0 top-0 z-10 h-[17rem] w-[13rem] overflow-hidden opacity-0"
            >
              {media.map((p, i) => (
                <img
                  key={p.slug}
                  ref={(n) => {
                    imgRefs.current[i] = n;
                  }}
                  src={p.images[1]?.thumb ?? p.cover}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                  style={{ opacity: active === i ? 1 : 0 }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* vertical fallback: the old static stacked list, on cream */
        <Container>
          <Eyebrow>{t.homeStage.valuesEyebrow}</Eyebrow>
          <h2 className="t-section mt-6 max-w-[18ch]">{t.home.valuesHeading}</h2>

          <ul className="mt-12 border-t border-line md:mt-16">
            {vals.map((v, i) => (
              <li key={v.n} className="border-b border-line">
                <div className="flex flex-col gap-3 py-8 md:flex-row md:items-baseline md:gap-8">
                  <span className="u-label text-ink-soft">{v.n}</span>
                  <h3 className="t-section flex-1 leading-[1]">{v.title}</h3>
                  <p className="max-w-xs text-ink-soft md:text-end">{v.desc}</p>
                </div>
                {media[i] && (
                  <img
                    src={media[i].cover}
                    alt={title(media[i], lang)}
                    loading="lazy"
                    className="mb-8 h-56 w-full object-cover sm:h-72"
                  />
                )}
              </li>
            ))}
          </ul>
        </Container>
      )}
    </HPanel>
  );
}
