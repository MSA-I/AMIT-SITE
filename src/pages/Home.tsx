import { useI18n } from '../i18n/context';
import Seo from '../components/Seo';
import Hero from '../components/sections/Hero';
import AboutTeaser from '../components/sections/AboutTeaser';
import Values from '../components/sections/Values';
import HorizontalProjects from '../components/sections/HorizontalProjects';
import ProjectsManifesto from '../components/sections/ProjectsManifesto';
import CTASection from '../components/sections/CTASection';
import ContactSection from '../components/sections/ContactSection';

export default function Home() {
  const { t, lang } = useI18n();
  return (
    <>
      <Seo
        title={lang === 'he' ? 'עמית בר - עיצוב פנים' : 'Amit Bar - Interior Design'}
        description={t.hero.intro}
      />
      <Hero />
      <AboutTeaser />
      <Values />
      <HorizontalProjects />
      <ProjectsManifesto />
      <CTASection />
      <ContactSection />
    </>
  );
}
