import { useI18n } from '../i18n/context';
import Seo from '../components/Seo';
import Hero from '../components/sections/Hero';
import Manifesto from '../components/sections/Manifesto';
import About from '../components/sections/About';
import Values from '../components/sections/Values';
import SelectedWork from '../components/sections/SelectedWork';
import Services from '../components/sections/Services';
import Materials from '../components/sections/Materials';
import Process from '../components/sections/Process';
import Testimonials from '../components/sections/Testimonials';
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
      <Manifesto />
      <About />
      <Values />
      <SelectedWork />
      <Services />
      <Materials />
      <Process />
      <Testimonials />
      <ContactSection />
    </>
  );
}
