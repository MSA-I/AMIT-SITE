import { useI18n } from '../i18n/context';
import Seo from '../components/Seo';
import About from '../components/sections/About';
import Testimonials from '../components/sections/Testimonials';
import ContactSection from '../components/sections/ContactSection';

export default function AboutPage() {
  const { t, lang } = useI18n();

  return (
    <div className="pt-16 md:pt-20">
      <Seo
        title={lang === 'he' ? 'אודות - עמית בר' : 'About - Amit Bar'}
        description={t.about.style}
      />
      <About />
      <Testimonials />
      <ContactSection />
    </div>
  );
}
