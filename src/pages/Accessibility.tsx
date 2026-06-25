import { useI18n } from '../i18n/context';
import { Container, Section, Heading, Reveal, btnGhost, LangLink } from '../components/ui';
import Seo from '../components/Seo';
import { PHONE, PHONE_DISPLAY, EMAIL } from '../lib/paths';

export default function Accessibility() {
  const { t, lang } = useI18n();
  const he = lang === 'he';

  const intro = he
    ? 'אנו רואים בנגישות האתר ערך מרכזי, ופועלים כדי שכל אדם יוכל לגלוש בו בקלות ובנוחות. האתר נבנה במטרה לעמוד בהמלצות תקן הנגישות WCAG 2.1 ברמה AA.'
    : 'We see accessibility as a core value and work to let every visitor browse the site with ease. The site is built to meet the WCAG 2.1 AA accessibility guidelines at level AA.';

  const points: string[] = he
    ? [
        'ניווט מלא באמצעות מקלדת, ללא צורך בעכבר.',
        'סימון ברור וגלוי של הרכיב הפעיל בעת מעבר במקלדת.',
        'טקסט חלופי לתמונות לקוראי מסך.',
        'ניגודיות צבעים מספקת בין הטקסט לרקע.',
        'תמיכה בהעדפת תנועה מופחתת לצמצום אנימציות.',
        'אפשרות להגדלת גודל הטקסט ללא פגיעה בתצוגה.',
      ]
    : [
        'Full keyboard navigation, with no mouse required.',
        'A clear, visible focus indicator while moving with the keyboard.',
        'Alternative text on images for screen readers.',
        'Sufficient color contrast between text and background.',
        'Support for reduced-motion preferences to limit animations.',
        'Resizable text that scales without breaking the layout.',
      ];

  const contactLead = he
    ? 'נתקלתם בקושי בשימוש באתר או יש לכם הצעה לשיפור הנגישות? נשמח שתפנו אלינו:'
    : 'Found a barrier while using the site, or have a suggestion to improve accessibility? Please reach out:';

  const review = he
    ? 'הצהרת נגישות זו נבדקת ומתעדכנת מעת לעת כחלק ממאמץ מתמשך לשיפור חוויית הגלישה לכלל המשתמשים.'
    : 'This accessibility statement is reviewed and updated periodically as part of an ongoing effort to improve the experience for all users.';

  return (
    <div className="pt-16 md:pt-20">
      <Seo title={`${t.legal.accessibilityHeading} - ${he ? 'עמית בר' : 'Amit Bar'}`} />
      <Section>
        <Container className="max-w-3xl">
          <Reveal>
            <Heading title={t.legal.accessibilityHeading} />
          </Reveal>

          <Reveal delay={0.05} className="mt-10 flex flex-col gap-6 text-base md:text-lg leading-relaxed text-muted">
            <p>{intro}</p>

            <ul className="flex flex-col gap-3 border-s border-line ps-6">
              {points.map((point) => (
                <li key={point} className="text-ink">
                  {point}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-2 border-t border-line pt-6">
              <p>{contactLead}</p>
              <a href={`mailto:${EMAIL}`} className="text-ink underline-offset-4 hover:text-copper hover:underline">
                {EMAIL}
              </a>
              <a href={`tel:${PHONE}`} className="text-ink underline-offset-4 hover:text-copper hover:underline" dir="ltr">
                {PHONE_DISPLAY}
              </a>
            </div>

            <p>{review}</p>
          </Reveal>

          <Reveal delay={0.1} className="mt-12">
            <LangLink to="/" className={btnGhost}>
              {t.legal.back}
            </LangLink>
          </Reveal>
        </Container>
      </Section>
    </div>
  );
}
