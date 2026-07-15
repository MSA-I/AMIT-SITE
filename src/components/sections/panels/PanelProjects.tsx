import { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { HPanel } from '../../../motion/HorizontalStage';
import { useStage, stageEdge } from '../../../motion/stageContext';
import { gsap, ScrollTrigger, prefersReduced, Reveal, RevealText } from '../../../motion/anim';
import { Container, Eyebrow, LangLink, btnLine } from '../../ui';
import { useI18n } from '../../../i18n/context';
import { projects, title, brief } from '../../../data/projects';
import SelectedWork from '../SelectedWork';

/**
 * Chapter 08 - selected projects: intro column + the width-accordion of the
 * six collections + the closing manifesto (reference .panel--slider + .cierre,
 * technique only - our palette / type / copy).
 *
 * Accordion mechanics (reference animations.js "PROJECTS ACCORDION"): the
 * slides are width-animated INSIDE the fixed 342vw HPanel so track.scrollWidth
 * never changes mid-pin. A paused master timeline expands each slide
 * 15vw -> 57vw (media 87vh -> 66vh) one timeline-unit apart, and a zero-length
 * beat at i + 0.5 fires the band-bits reveal scrub-safe (play forward /
 * fast-reverse). Driven by ScrollTrigger with containerAnimation + numeric
 * stageEdge start (100 = the first slide starts expanding exactly as it
 * enters; end +=342% matches the panel width so the accordion finishes flush
 * with the manifesto seam) so it works in both travel directions (RTL mirrored).
 *
 * Vertical fallback: intro renders as a lead-in section, the accordion panel
 * renders the existing <SelectedWork /> and the manifesto becomes a normal
 * vertical section. Reduced-motion never builds the timeline (equal-width
 * slides, bands fully visible).
 */

/** The horizontal-mode accordion row (collapsed slides clip their band; each link's aria-label carries the project name). */
function AccordionTrack() {
  const { lang } = useI18n();
  const { horizontal, tween } = useStage();
  const wrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    // Skip while the pin tween has not landed yet (it arrives via context
    // state one tick after mount); the tween dep rebuilds the effect then.
    if (!wrap || !horizontal || !tween || prefersReduced()) return;
    const slides = gsap.utils.toArray<HTMLElement>(wrap.querySelectorAll('[data-slide]'));
    const first = slides[0];
    if (!first) return;

    const ctx = gsap.context(() => {
      const ptl = gsap.timeline({ paused: true });
      slides.forEach((slide, i) => {
        const media = slide.querySelector<HTMLElement>('[data-slide-media]');
        const bits = slide.querySelectorAll<HTMLElement>('[data-band-bit]');
        ptl.fromTo(slide, { width: '15vw' }, { width: '57vw', duration: 1, ease: 'power1.inOut' }, i);
        if (media) {
          ptl.fromTo(media, { height: '87vh' }, { height: '66vh', duration: 1, ease: 'power1.inOut' }, i);
        }
        if (bits.length) {
          // Nested paused reveal driven by callbacks instead of scrub so the
          // stagger keeps its own easing (reference pattern, scrub-safe).
          const btl = gsap
            .timeline({ paused: true })
            .from(bits, { yPercent: 100, opacity: 0, duration: 0.33, stagger: 0.12, ease: 'power2.out' }, 0);
          ptl.to(
            {},
            {
              duration: 0.005,
              onComplete: () => {
                btl.timeScale(1).play();
              },
              onReverseComplete: () => {
                btl.timeScale(2.5).reverse();
              },
            },
            i + 0.5,
          );
        }
      });
      ScrollTrigger.create({
        animation: ptl,
        trigger: first,
        containerAnimation: tween,
        start: () => stageEdge(tween, first, 100),
        end: '+=' + 57 * slides.length + '%',
        scrub: 0,
      });
    }, wrap);
    return () => ctx.revert();
  }, [tween, lang, horizontal]);

  return (
    <div ref={wrapRef} className="flex h-full items-center">
      {projects.map((p, i) => (
        <LangLink
          key={p.slug}
          to={`/portfolio/${p.slug}`}
          aria-label={title(p, lang)}
          data-cursor="explore"
          data-slide
          className={`group flex h-full w-[15vw] shrink-0 flex-col overflow-hidden ${
            i % 2 === 1 ? 'bg-cream' : 'bg-paper'
          }`}
        >
          <div data-slide-media className="h-[87vh] shrink-0 overflow-hidden">
            {/* third shot per project: covers already carry the hero/dark/imagery chapters */}
            <img
              src={p.images[2]?.full ?? p.cover}
              alt={title(p, lang)}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
            />
          </div>
          {/* band bits are masked (overflow-hidden) for the yPercent rise */}
          <div className="flex flex-1 items-center gap-6 whitespace-nowrap px-6">
            <div className="shrink-0 overflow-hidden">
              <span data-band-bit className="block u-label text-ink-soft">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="overflow-hidden">
              <h3 data-band-bit className="font-display text-2xl leading-none text-ink">
                {title(p, lang)}
              </h3>
            </div>
            <div className="ms-auto overflow-hidden">
              <span data-band-bit className="block u-label text-ink-soft">
                {brief(p, lang)}
              </span>
            </div>
          </div>
        </LangLink>
      ))}
    </div>
  );
}

export default function PanelProjects() {
  const { t } = useI18n();
  const { horizontal } = useStage();

  const viewAllLink = (
    <LangLink to="/portfolio" className={btnLine}>
      {t.portfolio.viewAll}
      <ArrowUpRight className="h-4 w-4" aria-hidden />
    </LangLink>
  );

  return (
    <>
      {/* 08a - intro column (reference .proj__intro: 26vw, label ~30vh, text lower third).
          In the fallback SelectedWork below owns id="work", so the id moves with the mode. */}
      <HPanel
        w={26}
        theme="paper"
        id={horizontal ? 'work' : undefined}
        fallbackClassName="pt-20 md:pt-28 pb-4"
      >
        {horizontal ? (
          <div className="flex h-full flex-col justify-between px-[2vw] pb-[8vh] pt-[30vh]">
            <Eyebrow>{t.homeStage.projectsEyebrow}</Eyebrow>
            <Reveal className="max-w-[19rem]">
              <p className="text-ink-soft">{t.homeStage.projectsIntro}</p>
              <div className="mt-8">{viewAllLink}</div>
            </Reveal>
          </div>
        ) : (
          <Container>
            <Eyebrow>{t.homeStage.projectsEyebrow}</Eyebrow>
            <Reveal className="mt-6">
              <p className="max-w-2xl text-ink-soft">{t.homeStage.projectsIntro}</p>
              <div className="mt-8">{viewAllLink}</div>
            </Reveal>
          </Container>
        )}
      </HPanel>

      {/* 08b - the accordion (fixed 342vw wrap = 6 x 57vw; slides expand inside it) */}
      <HPanel w={342} theme="paper" id="p-accordion">
        {horizontal ? <AccordionTrack /> : <SelectedWork />}
      </HPanel>

      {/* 08c - closing manifesto (reference .cierre: title upper third, text low) */}
      <HPanel w={90} theme="paper" id="p-manifesto" fallbackClassName="py-24 md:py-32">
        {horizontal ? (
          <>
            <div className="absolute start-[6vw] top-[16vh] w-[78vw]">
              <RevealText as="h2" text={t.portfolio.manifesto} className="t-section font-display" />
            </div>
            {/* paragraph raised toward the headline (kills the mid-panel void);
                inline offset keeps the editorial asymmetry */}
            <div className="absolute bottom-[24vh] start-[10vw] max-w-[22rem]">
              <Reveal>
                <p className="text-ink-soft">{t.homeStage.manifestoBody}</p>
                <div className="mt-8">{viewAllLink}</div>
              </Reveal>
            </div>
          </>
        ) : (
          <Container>
            <RevealText
              as="h2"
              text={t.portfolio.manifesto}
              className="t-section font-display max-w-4xl"
            />
            <Reveal className="mt-10">
              <p className="max-w-xl text-ink-soft">{t.homeStage.manifestoBody}</p>
              <div className="mt-8">{viewAllLink}</div>
            </Reveal>
          </Container>
        )}
      </HPanel>
    </>
  );
}
