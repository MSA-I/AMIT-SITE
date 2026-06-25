import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import { Container, LangLink } from './ui';
import {
  localePath,
  PHONE,
  PHONE_DISPLAY,
  EMAIL,
  INSTAGRAM,
  INSTAGRAM_HANDLE,
  waLink,
} from '../lib/paths';

export default function Footer() {
  const { t, lang } = useI18n();

  const contacts = [
    { label: PHONE_DISPLAY, href: `tel:${PHONE}`, ltr: true, ext: false },
    { label: EMAIL, href: `mailto:${EMAIL}`, ltr: false, ext: false },
    { label: t.contact.whatsapp, href: waLink(t.contact.whatsappMessage), ltr: false, ext: true },
    { label: INSTAGRAM_HANDLE, href: INSTAGRAM, ltr: true, ext: true },
  ];

  return (
    <footer className="bg-ink text-cream" data-theme="ink">
      <Container className="py-20 md:py-28">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="u-label text-cream/50">{t.hero.role}</div>
            <LangLink
              to=""
              data-cursor
              className="mt-4 block font-display text-[18vw] leading-[0.82] tracking-tight md:text-[11rem]"
            >
              Amit Bar<span className="align-top text-sage" style={{ fontSize: '0.2em' }}>®</span>
            </LangLink>
          </div>

          <div className="md:col-span-3 md:col-start-9">
            <div className="u-label mb-5 text-cream/50">{t.footer.contactHeading}</div>
            <ul className="space-y-3 text-base">
              {contacts.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    dir={c.ltr ? 'ltr' : undefined}
                    {...(c.ext ? { target: '_blank', rel: 'noopener' } : {})}
                    className="inline-block text-cream/80 transition-colors hover:text-cream"
                    data-cursor
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-cream/15 pt-7 text-sm text-cream/50 md:flex-row md:items-center md:justify-between">
          <span>© 2026 Amit Bar. {t.footer.rights}.</span>
          <div className="flex items-center gap-6">
            <NavLink to={localePath(lang, '/privacy')} className="hover:text-cream" data-cursor>
              {t.footer.privacy}
            </NavLink>
            <NavLink to={localePath(lang, '/accessibility')} className="hover:text-cream" data-cursor>
              {t.footer.accessibility}
            </NavLink>
          </div>
        </div>
      </Container>
    </footer>
  );
}
