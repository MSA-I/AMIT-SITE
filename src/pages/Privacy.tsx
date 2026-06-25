import { useI18n } from '../i18n/context';
import { Container, Section, Heading, Reveal, LangLink, btnGhost } from '../components/ui';
import Seo from '../components/Seo';
import { EMAIL, PHONE, PHONE_DISPLAY } from '../lib/paths';

export default function Privacy() {
  const { t, lang } = useI18n();
  const isHe = lang === 'he';

  const lead = isHe ? 'leading-loose' : 'leading-relaxed';
  const pClass = `text-muted ${lead} text-start`;
  const hClass = 'font-display text-ink text-lg md:text-xl mt-10 mb-3 text-start';
  const linkClass = 'text-copper underline-offset-4 hover:text-copper-deep hover:underline';

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
      <Seo title={t.legal.privacyHeading} />
      <Section className="pt-28 md:pt-36">
        <Container className="max-w-3xl">
          <Heading title={t.legal.privacyHeading} />

          <Reveal className="mt-10">
            {isHe ? (
              <div>
                <p className={pClass}>
                  במדיניות זו מוסבר אילו פרטים נאספים כאשר אתם פונים אליי דרך האתר, כיצד הם נשמרים
                  וכיצד נעשה בהם שימוש. אני מכבד את פרטיותכם ופועל באחריות עם כל מידע שאתם בוחרים
                  לשתף.
                </p>

                <h2 className={hClass}>אילו פרטים נאספים</h2>
                <p className={pClass}>
                  כאשר אתם ממלאים את טופס יצירת הקשר, נאספים הפרטים שאתם מזינים בלבד: שם, מספר טלפון,
                  כתובת דוא"ל ותוכן ההודעה. איני אוסף מידע נוסף מעבר לפרטים שאתם בוחרים למסור.
                </p>

                <h2 className={hClass}>כיצד נעשה שימוש במידע</h2>
                <p className={pClass}>
                  הפרטים משמשים אך ורק כדי לחזור אליכם ולהשיב לפנייתכם בנוגע לפרויקט עיצוב. איני מוכר,
                  משכיר או מעביר את הפרטים שלכם לצדדים שלישיים למטרות שיווק.
                </p>

                <h2 className={hClass}>וואטסאפ ודוא"ל</h2>
                <p className={pClass}>
                  אם תבחרו ליצור קשר דרך וואטסאפ או בדוא"ל, ההתכתבות מתנהלת בפלטפורמות אלו ובכפוף
                  לתנאי השימוש ולמדיניות הפרטיות שלהן. אני שומר את ההתכתבות רק למשך הזמן הדרוש לטיפול
                  בפנייתכם.
                </p>

                <h2 className={hClass}>עוגיות וניתוח נתונים</h2>
                <p className={pClass}>
                  האתר עשוי לעשות שימוש בעוגיות בסיסיות הדרושות לתפקודו התקין. ככל שנעשה שימוש בכלי
                  לניתוח תנועה, הוא משמש להבנת אופן השימוש באתר בלבד, ללא זיהוי אישי. ניתן לחסום
                  עוגיות דרך הגדרות הדפדפן.
                </p>

                <h2 className={hClass}>הזכויות שלכם ויצירת קשר</h2>
                <p className={pClass}>
                  באפשרותכם לבקש לעיין בפרטים השמורים אצלי, לתקנם או למחקם. לכל בקשה בנושא פרטיות ניתן
                  לפנות בדוא"ל {mail} או בטלפון {tel}.
                </p>
              </div>
            ) : (
              <div>
                <p className={pClass}>
                  This policy explains what information is collected when you contact me through this
                  site, how it is stored, and how it is used. I respect your privacy and handle any
                  information you choose to share responsibly.
                </p>

                <h2 className={hClass}>Information collected</h2>
                <p className={pClass}>
                  When you complete the contact form, I collect only the details you enter: your
                  name, phone number, email address, and the content of your message. No additional
                  information is gathered beyond what you choose to provide.
                </p>

                <h2 className={hClass}>How the information is used</h2>
                <p className={pClass}>
                  Your details are used solely to get back to you and respond to your enquiry about a
                  design project. I do not sell, rent, or pass your details to third parties for
                  marketing purposes.
                </p>

                <h2 className={hClass}>WhatsApp and email</h2>
                <p className={pClass}>
                  If you choose to reach out via WhatsApp or email, the conversation takes place on
                  those platforms and is subject to their own terms and privacy policies. I keep
                  correspondence only for as long as needed to handle your enquiry.
                </p>

                <h2 className={hClass}>Cookies and analytics</h2>
                <p className={pClass}>
                  The site may use basic cookies required for it to function correctly. Where an
                  analytics tool is used, it serves only to understand how the site is used, without
                  personal identification. You can block cookies through your browser settings.
                </p>

                <h2 className={hClass}>Your rights and contact</h2>
                <p className={pClass}>
                  You may request to review, correct, or delete the details held about you. For any
                  privacy related request, contact me by email at {mail} or by phone at {tel}.
                </p>
              </div>
            )}

            <div className="mt-12">
              <LangLink to="/" className={btnGhost}>
                {t.legal.back}
              </LangLink>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
