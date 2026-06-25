import { useI18n } from '../i18n/context';
import Seo from '../components/Seo';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import PortfolioStrip from '../components/sections/PortfolioStrip';
import Process from '../components/sections/Process';
import Materials from '../components/sections/Materials';
import Services from '../components/sections/Services';
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
      <About />
      <PortfolioStrip />
      <Process />
      <Materials />
      <Services />
      <Testimonials />
      <ContactSection />
    </>
  );
}
