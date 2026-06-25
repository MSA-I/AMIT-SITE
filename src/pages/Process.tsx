import { useI18n } from '../i18n/context';
import Seo from '../components/Seo';
import Process from '../components/sections/Process';
import ContactSection from '../components/sections/ContactSection';

export default function ProcessPage() {
  const { t, lang } = useI18n();

  return (
    <div className="pt-16 md:pt-20">
      <Seo
        title={lang === 'he' ? 'תהליך העבודה - עמית בר' : 'Process - Amit Bar'}
        description={t.process.heading}
      />
      <Process />
      <ContactSection />
    </div>
  );
}
