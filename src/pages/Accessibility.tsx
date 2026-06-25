import { useI18n } from '../i18n/context';
import { Container, Section, LangLink, btnLine } from '../components/ui';
import { Reveal, RevealText } from '../motion/anim';
import Seo from '../components/Seo';
import { EMAIL, PHONE, PHONE_DISPLAY } from '../lib/paths';

export default function Accessibility() {
  const { t, lang } = useI18n();
  const isHe = lang === 'he';

  const lead = isHe ? 'leading-loose' : 'leading-relaxed';
  const pClass = `text-ink-soft ${lead} text-start`;
  const hClass = 'font-display text-ink text-lg md:text-xl mt-10 mb-3 text-start';
  const linkClass = 'text-sage underline-offset-4 hover:underline';

  const mail = (
    <a href={`mailto:${EMAIL}`} className={linkClass}>
      {EMAIL}
    </a>
  );
  const tel = (
    <a href={`tel:${PHONE}`} className={linkClass} dir="ltr">
      {PHONE_DISPLAY}
    </a>
  );

  return (
    <>
      <Seo title={t.legal.accessibilityHeading} />
      <Section className="pt-28 md:pt-36">
        <Container className="max-w-3xl">
          <RevealText as="h2" text={t.legal.accessibilityHeading} className="font-display text-5xl text-ink md:text-7xl" />

          <Reveal className="mt-10">
            {isHe ? (
              <div>
                <p className={pClass}>
                  הצהרת נגישות זו מתארת את המאמץ המתמשך להנגיש את האתר לכלל המשתמשים, לרבות אנשים עם
                  מוגבלות. האתר נבנה במטרה לעמוד בהמלצות תקן הנגישות WCAG 2.1 ברמה AA.
                </p>

                <h2 className={hClass}>התאמות הנגישות באתר</h2>
                <p className={pClass}>
                  האתר תומך בניווט מלא באמצעות המקלדת ללא צורך בעכבר, ומציג סימון ברור וגלוי של הרכיב
                  הפעיל בעת מעבר בין הרכיבים. לכל התמונות הוטמע טקסט חלופי לטובת קוראי מסך, ונשמרת
                  ניגודיות צבעים מספקת בין הטקסט לרקע.
                </p>

                <h2 className={hClass}>תנועה וגודל טקסט</h2>
                <p className={pClass}>
                  האתר מכבד את העדפת התנועה המופחתת של מערכת ההפעלה ומצמצם אנימציות בהתאם. ניתן
                  להגדיל את גודל הטקסט דרך הגדרות הדפדפן ללא פגיעה בתצוגה או באובדן תוכן.
                </p>

                <h2 className={hClass}>יצירת קשר בנושא נגישות</h2>
                <p className={pClass}>
                  אם נתקלתם בקושי בשימוש באתר או יש לכם הצעה לשיפור הנגישות, אשמח שתפנו אליי בדוא"ל{' '}
                  {mail} או בטלפון {tel}. אעשה כמיטב יכולתי לתת מענה ולתקן את הנדרש בהקדם.
                </p>

                <h2 className={hClass}>עדכון ההצהרה</h2>
                <p className={pClass}>
                  הצהרת נגישות זו נבדקת ומתעדכנת מעת לעת כחלק ממאמץ מתמשך לשיפור חוויית הגלישה לכלל
                  המשתמשים.
                </p>
              </div>
            ) : (
              <div>
                <p className={pClass}>
                  This statement describes the ongoing effort to make the site usable for everyone,
                  including people with disabilities. The site is built to conform to the WCAG 2.1 AA
                  accessibility guidelines.
                </p>

                <h2 className={hClass}>Accessibility features</h2>
                <p className={pClass}>
                  The site supports full keyboard navigation with no mouse required, and shows a
                  clear, visible focus indicator as you move between elements. All images include
                  alternative text for screen readers, and sufficient color contrast is maintained
                  between text and background.
                </p>

                <h2 className={hClass}>Motion and text size</h2>
                <p className={pClass}>
                  The site respects your operating system reduced-motion preference and limits
                  animations accordingly. Text can be enlarged through your browser settings without
                  breaking the layout or losing content.
                </p>

                <h2 className={hClass}>Contact about accessibility</h2>
                <p className={pClass}>
                  If you encounter a barrier while using the site, or have a suggestion to improve
                  accessibility, please reach out to me by email at {mail} or by phone at {tel}. I
                  will do my best to respond and address what is needed.
                </p>

                <h2 className={hClass}>Updates to this statement</h2>
                <p className={pClass}>
                  This accessibility statement is reviewed and updated periodically as part of an
                  ongoing effort to improve the experience for all users.
                </p>
              </div>
            )}

            <div className="mt-12">
              <LangLink to="" className={btnLine} data-cursor>
                {t.legal.back}
              </LangLink>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
