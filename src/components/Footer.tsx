import { useI18n } from '../i18n/context';
import { LangLink, SlideLabel } from './ui';
import SpinningBadge from './SpinningBadge';
import {
  PHONE,
  PHONE_DISPLAY,
  EMAIL,
  INSTAGRAM,
  INSTAGRAM_HANDLE,
  waLink,
} from '../lib/paths';

/**
 * Footer - cream, renders on every page. A contact strip (closing line + rollover
 * links) and the bottom brand/legal row.
 */
export default function Footer() {
  const { t } = useI18n();

  const contacts = [
    { label: PHONE_DISPLAY, href: `tel:${PHONE}`, ltr: true, ext: false },
    { label: EMAIL, href: `mailto:${EMAIL}`, ltr: false, ext: false },
    { label: t.contact.whatsapp, href: waLink(t.contact.whatsappMessage), ltr: false, ext: true },
    { label: INSTAGRAM_HANDLE, href: INSTAGRAM, ltr: true, ext: true },
  ];

  return (
    <footer data-theme="cream" className="relative overflow-hidden bg-cream text-ink">
      <div className="mx-auto w-full max-w-[1600px] px-5 pt-16 sm:px-6 md:px-10 md:pt-24">
        {/* 1 - contact strip: closing line at the start, rollover links pushed to the end */}
        <div className="flex flex-wrap items-baseline justify-end gap-x-8 gap-y-3 border-b border-line pb-6">
          {/* hero-em: italic is an LTR-only move; Hebrew gets weight contrast
              (Frank Ruhl has no italic - the browser would synthesize a slant) */}
          <span className="me-auto font-display hero-em text-lg md:text-xl">{t.footer.closing}</span>
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              dir={c.ltr ? 'ltr' : undefined}
              {...(c.ext ? { target: '_blank', rel: 'noopener' } : {})}
              className="group u-label"
            >
              <SlideLabel>{c.label}</SlideLabel>
            </a>
          ))}
        </div>

        {/* 2 - brand label */}
        <div className="mt-12 md:mt-16">
          <span className="u-label block">AMIT BAR</span>
        </div>

        {/* 3 - bottom row. Inline end padding keeps it clear of the FixedFrame
            mark, which owns that bottom corner; the badge lives mid-row. */}
        <div
          className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-6 border-t border-line py-8 md:mt-20"
          style={{ paddingInlineEnd: 'calc(var(--frame-pad) + var(--frame-logo-size) * 3)' }}
        >
          <img
            src="/brand/ab-logo-ink.png"
            alt="Amit Bar Interior Design"
            className="h-16 w-auto"
          />
          <SpinningBadge size={76} className="opacity-70" />
          <div className="ms-auto flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft">
            <span>© 2026 Amit Bar. {t.footer.rights}.</span>
            <LangLink to="/privacy" className="group hover:text-ink">
              <SlideLabel>{t.footer.privacy}</SlideLabel>
            </LangLink>
            <LangLink to="/accessibility" className="group hover:text-ink">
              <SlideLabel>{t.footer.accessibility}</SlideLabel>
            </LangLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
