import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import Seo from '../components/Seo';
import Lightbox from '../components/Lightbox';
import { Container, Section, Eyebrow, btnSolid, btnLine, LangLink } from '../components/ui';
import { Reveal, RevealText, useParallax } from '../motion/anim';
import FlipMedia from '../motion/FlipMedia';
import { projects, getProject, title, brief } from '../data/projects';
import { localePath } from '../lib/paths';

export default function Project() {
  const { t, lang } = useI18n();
  const { slug } = useParams();
  const project = getProject(slug);
  const [lb, setLb] = useState<number | null>(null);
  const cover = useParallax<HTMLImageElement>(90);

  if (!project) return <Navigate to={localePath(lang, '')} replace />;

  const heading = title(project, lang);
  const summary = brief(project, lang);

  // Related: same category first, then fill from the rest. Up to 3.
  const others = projects.filter((p) => p.slug !== project.slug);
  const sameCat = others.filter((p) => p.category === project.category);
  const otherCat = others.filter((p) => p.category !== project.category);
  const related = [...sameCat, ...otherCat].slice(0, 3);

  return (
    <article className="bg-cream text-ink">
      <Seo title={heading} description={summary} />

      {/* Full-bleed cinematic cover */}
      <section
        data-theme="ink"
        className="relative flex min-h-[560px] w-full flex-col justify-end overflow-hidden bg-ink text-cream h-[88vh] pt-28"
      >
        <div className="absolute inset-0 overflow-hidden">
          <img
            ref={cover}
            src={project.cover}
            alt={heading}
            loading="eager"
            className="h-[118%] w-full -translate-y-[9%] object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/10"
          />
        </div>

        <Container className="relative z-10 pb-14 md:pb-20">
          <Eyebrow>{t.portfolio.filters[project.category]}</Eyebrow>
          <RevealText
            as="h1"
            text={heading}
            className="mt-6 font-display leading-[0.92] text-6xl md:text-8xl"
          />
          <Reveal as="div" delay={0.1} className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-cream/70">
            <span className="text-base md:text-lg">{summary}</span>
            <span className="accent-dot" />
            <span className="u-label">{t.portfolio.photoCount(project.images.length)}</span>
          </Reveal>
        </Container>
      </section>

      {/* Gallery */}
      <Section data-theme="paper" className="bg-paper text-ink">
        <Container>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {project.images.map((img, i) => (
              <div key={img.thumb}>
                <button
                  type="button"
                  data-cursor
                  onClick={() => setLb(i)}
                  aria-label={`${heading} - ${i + 1} / ${project.images.length}`}
                  className="group relative block w-full overflow-hidden bg-line/40"
                >
                  <FlipMedia
                    src={img.thumb}
                    alt={`${heading} - ${i + 1}`}
                    className="aspect-[4/5] w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                </button>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Related + CTA */}
      <Section data-theme="cream" className="bg-cream text-ink">
        <Container>
          {related.length > 0 && (
            <>
              <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
                <RevealText
                  as="h2"
                  text={t.portfolio.related}
                  className="font-display leading-[0.95] text-4xl md:text-6xl"
                />
                <LangLink to="/portfolio" className={btnLine} data-cursor>
                  {t.portfolio.viewAll}
                </LangLink>
              </div>

              <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p, i) => (
                  <Reveal as="div" key={p.slug} delay={i * 0.06}>
                    <LangLink
                      to={`/portfolio/${p.slug}`}
                      data-cursor
                      className="group block"
                    >
                      <div className="relative overflow-hidden bg-line/40">
                        <FlipMedia
                          src={p.cover}
                          alt={title(p, lang)}
                          className="aspect-[4/5] w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="mt-4 flex items-baseline justify-between gap-3">
                        <h3 className="font-display text-xl transition-colors group-hover:text-sage md:text-2xl">
                          {title(p, lang)}
                        </h3>
                        <span className="u-label text-ink-soft">{t.portfolio.viewProject}</span>
                      </div>
                      <p className="mt-1 text-sm text-ink-soft">{brief(p, lang)}</p>
                    </LangLink>
                  </Reveal>
                ))}
              </div>
            </>
          )}

          <Reveal as="div" className="mt-16 flex justify-center md:mt-24">
            <LangLink to="/contact" className={btnSolid} data-cursor>
              {t.nav.contact}
            </LangLink>
          </Reveal>
        </Container>
      </Section>

      {lb !== null && (
        <Lightbox
          images={project.images}
          index={lb}
          alt={heading}
          onClose={() => setLb(null)}
          onIndex={setLb}
        />
      )}
    </article>
  );
}
