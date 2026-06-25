import { useI18n } from '../i18n/context';
import { Section, LangLink, btnSolid } from '../components/ui';
import Seo from '../components/Seo';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <>
      <Seo title={t.notFound.heading} description={t.notFound.text} />
      <Section className="pt-36 min-h-[60vh] grid place-items-center text-center">
        <div className="flex flex-col items-center gap-6">
          <span className="font-display text-copper text-7xl md:text-9xl leading-none tracking-tight">
            404
          </span>
          <h1 className="font-display text-ink text-2xl md:text-3xl">
            {t.notFound.heading}
          </h1>
          <p className="text-muted max-w-md">
            {t.notFound.text}
          </p>
          <LangLink to="/" className={btnSolid}>
            {t.notFound.home}
          </LangLink>
        </div>
      </Section>
    </>
  );
}
