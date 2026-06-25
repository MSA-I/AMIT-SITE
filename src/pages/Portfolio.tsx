import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useI18n } from '../i18n/context';
import { Container, Section, Heading } from '../components/ui';
import Seo from '../components/Seo';
import ProjectCard from '../components/ProjectCard';
import { projects, usedCategories, type Category } from '../data/projects';

type Filter = 'all' | Category;

export default function Portfolio() {
  const { t, lang } = useI18n();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<Filter>('all');

  const filters: Filter[] = ['all', ...usedCategories()];
  const filtered = projects.filter((p) => active === 'all' || p.category === active);

  return (
    <Section className="pt-28 md:pt-36">
      <Seo
        title={lang === 'he' ? 'תיק עבודות - עמית בר' : 'Portfolio - Amit Bar'}
        description={t.portfolio.subheading}
      />
      <Container>
        <Heading
          eyebrow={t.portfolio.eyebrow}
          title={t.portfolio.heading}
          sub={t.portfolio.subheading}
        />

        <div className="mt-10 flex flex-wrap gap-3">
          {filters.map((key) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                aria-pressed={isActive}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
                  isActive
                    ? 'border border-transparent bg-copper text-white'
                    : 'border border-line text-muted hover:text-copper'
                }`}
              >
                {t.portfolio.filters[key]}
              </button>
            );
          })}
        </div>

        <motion.div
          layout={!reduce}
          className="mt-12 grid grid-cols-1 gap-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.div
                key={p.slug}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProjectCard project={p} priority={i < 3} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </Container>
    </Section>
  );
}
