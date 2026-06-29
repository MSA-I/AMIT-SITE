import { useI18n } from '../i18n/context';
import Seo from '../components/Seo';
import Manifesto from '../components/sections/Manifesto';
import About from '../components/sections/About';
import Values from '../components/sections/Values';
import Process from '../components/sections/Process';
import Services from '../components/sections/Services';
import Materials from '../components/sections/Materials';
import Testimonials from '../components/sections/Testimonials';
import CTASection from '../components/sections/CTASection';

export default function AboutPage() {
  const { t, lang } = useI18n();
  return (
    <>
      <Seo
        title={lang === 'he' ? `${t.about.heading} - עמית בר` : `${t.about.heading} - Amit Bar`}
        description={t.about.journey}
      />
      <Manifesto />
      <About />
      <Process />
      <Values />
      <Services />
      <Materials />
      <Testimonials />
      <CTASection />
    </>
  );
}
