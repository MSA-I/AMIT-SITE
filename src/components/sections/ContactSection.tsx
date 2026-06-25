import { MessageCircle, Phone, Mail, Instagram } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { Container, Section, Heading, Reveal } from '../ui';
import ContactForm from '../ContactForm';
import { waLink, PHONE, PHONE_DISPLAY, EMAIL, INSTAGRAM, INSTAGRAM_HANDLE } from '../../lib/paths';

export default function ContactSection() {
  const { t } = useI18n();

  const rows = [
    {
      key: 'whatsapp',
      Icon: MessageCircle,
      label: t.contact.whatsapp,
      href: waLink(t.contact.whatsappMessage),
      external: true,
    },
    {
      key: 'phone',
      Icon: Phone,
      label: PHONE_DISPLAY,
      href: `tel:${PHONE}`,
      ltr: true,
    },
    {
      key: 'email',
      Icon: Mail,
      label: EMAIL,
      href: `mailto:${EMAIL}`,
      ltr: true,
    },
    {
      key: 'instagram',
      Icon: Instagram,
      label: INSTAGRAM_HANDLE,
      href: INSTAGRAM,
      external: true,
    },
  ];

  return (
    <Section id="contact">
      <Container>
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <div>
              <Heading
                eyebrow={t.contact.eyebrow}
                title={t.contact.heading}
                sub={t.contact.sub}
              />

              <ul className="mt-10 flex flex-col gap-4">
                {rows.map(({ key, Icon, label, href, external, ltr }) => (
                  <li key={key}>
                    <a
                      href={href}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="group flex items-center gap-3 text-ink transition-colors hover:text-copper"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-line text-copper transition-colors group-hover:border-copper">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      {ltr ? (
                        <span dir="ltr" className="text-start">
                          {label}
                        </span>
                      ) : (
                        <span>{label}</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-2">
                {t.contact.consultTypes.map((type) => (
                  <span
                    key={type}
                    className="border border-line px-3 py-1 text-xs uppercase tracking-wider text-muted"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
