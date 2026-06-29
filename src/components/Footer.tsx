import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import { Container, LangLink } from './ui';
import { RevealText } from '../motion/anim';
import SpinningBadge from './SpinningBadge';
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
    <footer className="relative bg-ink text-cream" data-theme="ink">
      <Container className="py-20 md:py-28">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="u-label text-cream/50">{t.hero.role}</div>
            <LangLink to="" data-cursor className="mt-4 block">
              <img
                src="/brand/ab-logo.png"
                alt="Amit Bar Interior Design"
                className="h-auto w-[min(72%,26rem)]"
              />
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

        <RevealText
          as="div"
          text={t.footer.closing}
          className="hero-sans mt-12 text-[clamp(1.25rem,4.5vw,3rem)] text-cream/80 text-start md:ms-[6vw]"
        />

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

      {/* Spinning badge positioned at the opposite corner */}
      <SpinningBadge
        size={100}
        className="absolute bottom-4 start-4 opacity-60 sm:bottom-6 sm:start-6 md:bottom-10 md:start-10"
      />
    </footer>
  );
}
