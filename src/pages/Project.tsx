import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import { Container, Section, Heading, Reveal, btnCopper, LangLink } from '../components/ui';
import Seo from '../components/Seo';
import ProjectCard from '../components/ProjectCard';
import Lightbox from '../components/Lightbox';
import { projects, getProject, title, brief } from '../data/projects';
import { localePath } from '../lib/paths';

export default function Project() {
  const { t, lang } = useI18n();
  const { slug } = useParams();
  const project = getProject(slug);
  const [lb, setLb] = useState<number | null>(null);

  if (!project) return <Navigate to={localePath(lang, '/portfolio')} replace />;

  const heading = title(project, lang);

  // Related: prefer same category, then fill with the next available projects.
  const others = projects.filter((p) => p.slug !== project.slug);
  const sameCat = others.filter((p) => p.category === project.category);
  const otherCat = others.filter((p) => p.category !== project.category);
  const related = [...sameCat, ...otherCat].slice(0, 3);

  return (
    <article className="pt-28 md:pt-36">
      <Seo title={heading} description={brief(project, lang)} />

      <Container>
        {/* Title block */}
        <Reveal className="flex flex-col items-start gap-4 text-start">
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-copper">
            {t.portfolio.filters[project.category]}
          </span>
          <h1 className="font-display text-4xl font-medium tracking-tight text-ink text-balance md:text-6xl">
            {heading}
          </h1>
          <p className="text-sm text-muted md:text-base">
            {brief(project, lang)} · {t.portfolio.photoCount(project.images.length)}
          </p>
        </Reveal>

        {/* Cover */}
        <Reveal className="mt-8 md:mt-10" delay={0.05}>
          <img
            src={project.cover}
            alt={heading}
            loading="eager"
            className="aspect-[16/10] w-full bg-line/40 object-cover md:aspect-[16/9]"
          />
        </Reveal>

        {/* Gallery */}
        <Reveal className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3" delay={0.1}>
          {project.images.map((img, i) => (
            <button
              key={img.thumb}
              type="button"
              onClick={() => setLb(i)}
              aria-label={`${heading} ${i + 1}`}
              className="group relative block w-full overflow-hidden bg-line/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
            >
              <img
                src={img.thumb}
                alt={`${heading} ${i + 1}`}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              />
            </button>
          ))}
        </Reveal>
      </Container>

      {/* Related + CTA */}
      <Section>
        <Container>
          {related.length > 0 && (
            <>
              <Reveal>
                <Heading title={t.portfolio.related} />
              </Reveal>
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <Reveal key={p.slug}>
                    <ProjectCard project={p} />
                  </Reveal>
                ))}
              </div>
            </>
          )}

          <Reveal className="mt-14 flex justify-center md:mt-16">
            <LangLink to="/contact" className={btnCopper}>
              {t.nav.book}
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
