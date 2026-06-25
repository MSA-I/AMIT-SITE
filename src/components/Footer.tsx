import { NavLink } from 'react-router-dom';
import { Instagram, MessageCircle, Phone, Mail } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { Container, Rule } from './ui';
import { localePath, PHONE, PHONE_DISPLAY, EMAIL, INSTAGRAM, INSTAGRAM_HANDLE, waLink } from '../lib/paths';

export default function Footer() {
  const { t, lang } = useI18n();
  const year = 2026;

  const navLinks = [
    { to: '/portfolio', label: t.nav.portfolio },
    { to: '/about', label: t.nav.about },
    { to: '/process', label: t.nav.process },
    { to: '/services', label: t.nav.services },
    { to: '/contact', label: t.nav.contact },
  ];

  return (
    <footer className="border-t border-line bg-surface">
      <Container className="grid grid-cols-1 gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <div className="font-display text-2xl font-semibold tracking-[0.18em] text-ink">AMIT BAR</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.3em] text-copper">
            {lang === 'he' ? 'עיצוב פנים' : 'Interior Design'}
          </div>
          <Rule className="my-6" />
          <p className="max-w-sm text-sm text-muted">{t.footer.tagline}</p>
        </div>

        <nav aria-label={lang === 'he' ? 'ניווט תחתון' : 'Footer'} className="md:col-span-3">
          <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-muted">{t.footer.nav}</h3>
          <ul className="space-y-3">
            {navLinks.map((l) => (
              <li key={l.to}>
                <NavLink to={localePath(lang, l.to)} className="text-sm text-ink transition-colors hover:text-copper">
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-muted">{t.footer.contactHeading}</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 text-ink hover:text-copper" dir="ltr">
                <Phone className="h-4 w-4 text-copper" /> {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-2 text-ink hover:text-copper">
                <Mail className="h-4 w-4 text-copper" /> {EMAIL}
              </a>
            </li>
            <li>
              <a href={waLink(t.contact.whatsappMessage)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-ink hover:text-copper">
                <MessageCircle className="h-4 w-4 text-copper" /> {t.contact.whatsapp}
              </a>
            </li>
            <li>
              <a href={INSTAGRAM} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-ink hover:text-copper">
                <Instagram className="h-4 w-4 text-copper" /> {INSTAGRAM_HANDLE}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted md:flex-row">
          <span>
            © {year} Amit Bar. {t.footer.rights}.
          </span>
          <div className="flex items-center gap-6">
            <NavLink to={localePath(lang, '/privacy')} className="hover:text-copper">
              {t.footer.privacy}
            </NavLink>
            <NavLink to={localePath(lang, '/accessibility')} className="hover:text-copper">
              {t.footer.accessibility}
            </NavLink>
          </div>
        </Container>
      </div>
    </footer>
  );
}
