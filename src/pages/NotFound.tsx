import { useI18n } from '../i18n/context';
import Seo from '../components/Seo';
import { Container, btnSolid, LangLink } from '../components/ui';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <section data-theme="cream" className="bg-cream text-ink">
      <Seo title={t.notFound.heading} description={t.notFound.text} />
      <Container className="grid min-h-[70vh] place-items-center pt-32 pb-24 text-center">
        <div className="flex flex-col items-center gap-6">
          <span className="font-display text-8xl leading-[0.9] tracking-tight md:text-9xl">
            4
            <span className="relative inline-block">
              0
              <span className="accent-dot absolute -top-1 end-0" />
            </span>
            4
          </span>

          <h1 className="font-display text-3xl leading-[0.95]">{t.notFound.heading}</h1>

          <p className="max-w-md text-ink-soft">{t.notFound.text}</p>

          <LangLink to="" className={`${btnSolid} mt-2`}>
            {t.notFound.home}
          </LangLink>
        </div>
      </Container>
    </section>
  );
}
