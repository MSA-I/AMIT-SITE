import { ArrowUpRight } from 'lucide-react';
import { projects, title } from '../../data/projects';
import { useI18n } from '../../i18n/context';
import { Reveal, RevealText, useParallax } from '../../motion/anim';
import { Container, Section, Eyebrow, LangLink, SlideLabel, CornerMark, btnLine } from '../ui';

/**
 * ProjectsManifesto - the light editorial beat after the dark pinned carousel
 * (reference ref-12): two stacked/offset real photos + an oversized serif
 * manifesto + a "View all" text link out to the full portfolio. All motion runs
 * through the shared helpers (Reveal/RevealText/useParallax), which already
 * guard prefers-reduced-motion (static + fully visible).
 */
export default function ProjectsManifesto() {
  const { t, lang } = useI18n();
  const img1 = useParallax<HTMLImageElement>(50);
  const img2 = useParallax<HTMLImageElement>(80);
  const [a, b] = projects;

  return (
    <Section data-theme="cream" className="relative overflow-hidden bg-cream text-ink">
      <Container className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
        {/* stacked offset photos */}
        <div className="relative md:order-1 md:col-span-6">
          <Reveal>
            <figure className="relative z-0 w-[78%] overflow-hidden">
              <img
                ref={img1}
                src={a.cover}
                alt={title(a, lang)}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover"
              />
            </figure>
          </Reveal>
          <Reveal>
            <figure className="relative z-10 -mt-[26%] ms-auto w-[64%] overflow-hidden border-8 border-cream">
              <img
                ref={img2}
                src={b.cover}
                alt={title(b, lang)}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover"
              />
            </figure>
          </Reveal>
        </div>

        {/* manifesto + view all */}
        <div className="md:order-2 md:col-span-6">
          <Eyebrow>{t.portfolio.eyebrow}</Eyebrow>
          <RevealText as="h2" text={t.portfolio.manifesto} className="t-section mt-6 text-ink text-[clamp(3rem,9vw,9rem)] leading-[0.95]" />
          <div className="mt-10">
            <LangLink to="/portfolio" data-cursor className={btnLine}>
              <SlideLabel>{t.portfolio.viewAll}</SlideLabel>
              <ArrowUpRight className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
            </LangLink>
          </div>
        </div>
      </Container>

      {/* recurring kinetic corner mark */}
      <CornerMark
        word={t.brand.mark}
        className="absolute bottom-6 end-6 text-lg text-ink/70 md:text-xl"
      />
    </Section>
  );
}
