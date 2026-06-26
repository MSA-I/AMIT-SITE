import { ArrowUpRight } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { Container, Section, Eyebrow, LangLink } from '../ui';
import { AnimatedFrame } from '../ui/AnimatedFrame';
import { Reveal, RevealText, useParallax } from '../../motion/anim';
import { projects, title, brief, type Project } from '../../data/projects';

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const { lang, t } = useI18n();
  const imgRef = useParallax<HTMLImageElement>(50);
  const flip = index % 2 === 1;

  return (
    <LangLink
      to={`/portfolio/${project.slug}`}
      data-cursor
      className="group block border-t border-line py-8 md:py-12"
    >
      <Container>
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12">
          <div className={`md:col-span-7 ${flip ? 'md:order-2' : 'md:order-1'}`}>
            <AnimatedFrame bracketColor="line" bracketSize={24} hoverExpand={6}>
              <div className="relative aspect-[16/10] overflow-hidden bg-line/40">
                <img
                  ref={imgRef}
                  src={project.cover}
                  alt={title(project, lang)}
                  loading="lazy"
                  className="absolute inset-0 h-[115%] w-full -translate-y-[6%] object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                />
              </div>
            </AnimatedFrame>
          </div>
          <div className={`md:col-span-5 ${flip ? 'md:order-1' : 'md:order-2'}`}>
            <div className="u-label text-ink-soft">{String(index + 1).padStart(2, '0')}</div>
            <h3 className="mt-3 font-display text-4xl leading-[0.95] text-ink transition-colors group-hover:text-sage sm:text-5xl md:text-7xl">
              {title(project, lang)}
            </h3>
            <p className="mt-4 text-ink-soft">{brief(project, lang)}</p>
            <span className="mt-6 inline-flex items-center gap-2 u-label text-ink">
              {t.portfolio.viewProject}
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Container>
    </LangLink>
  );
}

export default function SelectedWork() {
  const { t } = useI18n();
  return (
    <Section id="work" className="bg-cream pb-8">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>{t.portfolio.eyebrow}</Eyebrow>
            <RevealText
              as="h2"
              text={t.portfolio.heading}
              className="mt-6 font-display text-6xl leading-[0.95] text-ink md:text-8xl"
            />
          </div>
          <Reveal>
            <p className="max-w-sm text-ink-soft">{t.portfolio.subheading}</p>
          </Reveal>
        </div>
      </Container>

      <div className="mt-14 flex flex-col">
        {projects.map((p, i) => (
          <ProjectRow key={p.slug} project={p} index={i} />
        ))}
      </div>
    </Section>
  );
}
