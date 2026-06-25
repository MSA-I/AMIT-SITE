import { useI18n } from '../../i18n/context';
import { Container, Section, Heading, Reveal, btnGhost, LangLink } from '../ui';
import { projects } from '../../data/projects';
import ProjectCard from '../ProjectCard';

export default function PortfolioStrip() {
  const { t } = useI18n();
  const featured = projects.slice(0, 6);

  return (
    <Section id="work">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Heading
            eyebrow={t.portfolio.eyebrow}
            title={t.portfolio.heading}
            sub={t.portfolio.subheading}
          />
          <LangLink to="/portfolio" className={`${btnGhost} self-start md:self-auto md:ms-auto shrink-0`}>
            {t.portfolio.viewAll}
          </LangLink>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06}>
              <ProjectCard project={p} priority={i < 3} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
