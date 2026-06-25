import raw from './projects.json';
import type { Lang } from '../i18n/context';

export type Category = 'residential' | 'spaces' | 'exterior';

export interface ProjectImage {
  full: string;
  thumb: string;
}
export interface Project {
  slug: string;
  titleHe: string;
  titleEn: string;
  category: Category;
  cover: string;
  images: ProjectImage[];
}

// One-line, truthful brief per category (no fabricated specifics).
const BRIEF: Record<Category, { he: string; en: string }> = {
  residential: { he: 'מגורים · תכנון ועיצוב פנים', en: 'Residential · interior planning & design' },
  spaces: { he: 'חלל · עיצוב והלבשה', en: 'Space · design & styling' },
  exterior: { he: 'חוץ · עיצוב ואדריכלות נוף', en: 'Exterior · design & landscape' },
};

export const projects: Project[] = (raw as Project[]).filter((p) => p.images.length > 0);

export const title = (p: Project, lang: Lang) => (lang === 'he' ? p.titleHe : p.titleEn);
export const brief = (p: Project, lang: Lang) => BRIEF[p.category][lang];
export const getProject = (slug?: string) => projects.find((p) => p.slug === slug);

export const usedCategories = (): Category[] =>
  (['residential', 'spaces', 'exterior'] as Category[]).filter((c) =>
    projects.some((p) => p.category === c)
  );
