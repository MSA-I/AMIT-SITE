import { useI18n } from '../i18n/context';
import Seo from '../components/Seo';
import Services from '../components/sections/Services';
import Materials from '../components/sections/Materials';
import ContactSection from '../components/sections/ContactSection';

export default function ServicesPage() {
  const { t, lang } = useI18n();

  return (
    <div className="pt-16 md:pt-20">
      <Seo
        title={lang === 'he' ? 'שירותים - עמית בר' : 'Services - Amit Bar'}
        description={t.services.heading}
      />
      <Services />
      <Materials />
      <ContactSection />
    </div>
  );
}
