import { ArrowUpRight } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { LangLink } from './ui';
import { title, brief, type Project } from '../data/projects';

export default function ProjectCard({ project, priority }: { project: Project; priority?: boolean }) {
  const { lang, t } = useI18n();
  return (
    <LangLink
      to={`/portfolio/${project.slug}`}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper"
    >
      <div className="relative overflow-hidden bg-line/40">
        <img
          src={project.cover}
          alt={title(project, lang)}
          width={1200}
          height={1500}
          loading={priority ? 'eager' : 'lazy'}
          className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
        <span className="absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-bg/0 text-bg opacity-0 transition-all duration-300 group-hover:bg-copper group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-medium text-ink transition-colors group-hover:text-copper">
          {title(project, lang)}
        </h3>
        <span className="text-xs uppercase tracking-[0.18em] text-muted">{t.portfolio.viewProject}</span>
      </div>
      <p className="mt-1 text-sm text-muted">{brief(project, lang)}</p>
    </LangLink>
  );
}
