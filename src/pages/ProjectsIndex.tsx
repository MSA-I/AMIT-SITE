import { ArrowUpRight } from 'lucide-react';
import { useI18n } from '../i18n/context';
import Seo from '../components/Seo';
import { Container, Section, Eyebrow, LangLink, SlideLabel, btnLine } from '../components/ui';
import FlipMedia from '../motion/FlipMedia';
import { Reveal, RevealText } from '../motion/anim';
import { projects, title, brief } from '../data/projects';

/**
 * Projects index (mirrors the reference /proyectos/): one long vertical scroll
 * where every project is a full-width row of two side-by-side images plus a
 * text block, alternating the image/text arrangement row by row. Each row links
 * through to its detail page. Near-monochrome, editorial-kinetic.
 */
export default function ProjectsIndex() {
  const { t, lang } = useI18n();

  return (
    <article className="bg-cream text-ink">
      <Seo title={t.portfolio.heading} description={t.portfolio.subheading} />

      {/* Header */}
      <Section data-theme="cream" className="bg-cream text-ink pt-36 md:pt-44">
        <Container>
          <Eyebrow>{t.portfolio.eyebrow}</Eyebrow>
          <RevealText
            as="h1"
            text={t.portfolio.heading}
            className="mt-6 font-display font-light leading-[0.92] text-6xl md:text-8xl"
          />
          <Reveal as="div" delay={0.1} className="mt-6 max-w-2xl">
            <p className="text-lg text-ink-soft md:text-xl">{t.portfolio.subheading}</p>
          </Reveal>
        </Container>
      </Section>

      {/* Rows */}
      <Section data-theme="paper" className="bg-paper text-ink !pt-0">
        <Container>
          <div className="flex flex-col gap-24 md:gap-36">
            {projects.map((project, i) => {
              const heading = title(project, lang);
              const summary = brief(project, lang);
              const num = String(i + 1).padStart(2, '0');
              // Two images per row; fall back to the cover when fewer than 2 exist.
              const imgA = project.images[0]?.full ?? project.cover;
              const imgB = project.images[1]?.full ?? project.cover;
              // Alternate the text block side per row (logical order, no direction hacks).
              const textFirst = i % 2 === 1;

              return (
                <div
                  key={project.slug}
                  className="grid items-center gap-8 md:grid-cols-12 md:gap-10"
                >
                  {/* Image pair */}
                  <div
                    className={`grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-8 ${
                      textFirst ? 'md:order-2' : 'md:order-1'
                    }`}
                  >
                    <FlipMedia
                      src={imgA}
                      alt={`${heading} - 1`}
                      className="aspect-[4/5] w-full bg-line/40"
                    />
                    <FlipMedia
                      src={imgB}
                      alt={`${heading} - 2`}
                      className="aspect-[4/5] w-full bg-line/40"
                    />
                  </div>

                  {/* Text block */}
                  <div
                    className={`md:col-span-4 ${textFirst ? 'md:order-1' : 'md:order-2'}`}
                  >
                    <Reveal as="div">
                      <span className="inline-flex items-center gap-2.5 u-label text-ink-soft">
                        <span className="accent-dot" />
                        {num}
                      </span>
                      <h2 className="mt-4 font-display font-light leading-[0.95] text-4xl md:text-6xl">
                        {heading}
                      </h2>
                      <p className="mt-4 text-base text-ink-soft md:text-lg">{summary}</p>
                      <LangLink
                        to={`/portfolio/${project.slug}`}
                        data-cursor
                        aria-label={`${t.portfolio.viewProject} - ${heading}`}
                        className={`${btnLine} mt-8 overflow-hidden`}
                      >
                        <SlideLabel>{t.portfolio.viewProject}</SlideLabel>
                        <ArrowUpRight
                          aria-hidden
                          className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5"
                        />
                      </LangLink>
                    </Reveal>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>
    </article>
  );
}
