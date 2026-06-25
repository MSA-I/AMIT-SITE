import { useI18n } from '../i18n/context';
import Seo from '../components/Seo';
import ContactSection from '../components/sections/ContactSection';

export default function Contact() {
  const { t, lang } = useI18n();

  return (
    <div className="pt-16 md:pt-20">
      <Seo
        title={lang === 'he' ? 'צור קשר - עמית בר' : 'Contact - Amit Bar'}
        description={t.contact.sub}
      />
      <ContactSection />
    </div>
  );
}
