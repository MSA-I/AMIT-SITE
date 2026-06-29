import { useI18n } from '../i18n/context';
import Seo from '../components/Seo';
import { Marquee } from '../components/ui';
import Hero from '../components/sections/Hero';
import IntroTitles from '../components/sections/IntroTitles';
import FlipShowcase from '../components/sections/FlipShowcase';
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
      <IntroTitles />
      <FlipShowcase />
      <Values />

      {/* single moving word strip (one marquee per page) */}
      <section data-theme="cream" className="border-y border-line bg-cream py-6 text-ink sm:py-8">
        <Marquee items={t.home.marquee} />
      </section>

      <HorizontalProjects />
      <ProjectsManifesto />
      <CTASection />
      <ContactSection />
    </>
  );
}
