import { useI18n } from '../i18n/context';
import Seo from '../components/Seo';
import ContactSection from '../components/sections/ContactSection';

export default function Contact() {
  const { t, lang } = useI18n();

  return (
    <>
      <Seo
        title={lang === 'he' ? 'צור קשר - עמית בר' : 'Contact - Amit Bar'}
        description={t.contact.sub}
      />
      <div className="pt-24 md:pt-28">
        <ContactSection />
      </div>
    </>
  );
}
