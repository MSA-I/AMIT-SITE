import { useI18n } from '../../i18n/context';
import { Container, Eyebrow } from '../ui';
import { Reveal, RevealText } from '../../motion/anim';
import ContactForm from '../ContactForm';
import { waLink, PHONE, PHONE_DISPLAY, EMAIL, INSTAGRAM, INSTAGRAM_HANDLE } from '../../lib/paths';

type ContactLink = {
  key: string;
  label: string;
  href: string;
  /** force LTR on latin/numeric values so they read correctly inside an RTL layout */
  ltr?: boolean;
  external?: boolean;
};

export default function ContactSection() {
  const { t } = useI18n();

  const links: ContactLink[] = [
    { key: 'phone', label: PHONE_DISPLAY, href: `tel:${PHONE}`, ltr: true },
    { key: 'email', label: EMAIL, href: `mailto:${EMAIL}`, ltr: true },
    { key: 'whatsapp', label: t.contact.whatsapp, href: waLink(t.contact.whatsappMessage), external: true },
    { key: 'instagram', label: INSTAGRAM_HANDLE, href: INSTAGRAM, ltr: true, external: true },
  ];

  return (
    <section id="contact" data-theme="paper" className="bg-paper py-28 text-ink md:py-40">
      <Container>
        <Reveal>
          <Eyebrow>{t.contact.eyebrow}</Eyebrow>
        </Reveal>

        <RevealText
          text={t.contact.heading}
          as="h2"
          className="t-section mt-7 leading-[0.95]"
        />

        <Reveal delay={0.05}>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft">{t.contact.sub}</p>
        </Reveal>

        <div className="mt-16 grid gap-14 md:mt-20 md:grid-cols-2 md:gap-16">
          {/* start column - direct contact lines */}
          <Reveal>
            <ul className="flex flex-col gap-5">
              {links.map(({ key, label, href, ltr, external }) => (
                <li key={key}>
                  <a
                    href={href}
                    data-cursor
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group inline-flex items-center gap-3.5 text-xl text-ink transition-colors hover:text-sage"
                  >
                    <span className="accent-dot shrink-0" />
                    {ltr ? <span dir="ltr">{label}</span> : <span>{label}</span>}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              {t.contact.consultTypes.map((type) => (
                <span
                  key={type}
                  className="u-label rounded-full border border-line px-4 py-2 text-ink-soft"
                >
                  {type}
                </span>
              ))}
            </div>
          </Reveal>

          {/* end column - lead form */}
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
