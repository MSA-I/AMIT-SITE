import { useI18n } from '../i18n/context';
import { Container, Section, LangLink, btnLine } from '../components/ui';
import Seo from '../components/Seo';
import { Reveal, RevealText } from '../motion/anim';
import { EMAIL, PHONE, PHONE_DISPLAY } from '../lib/paths';

export default function Privacy() {
  const { t, lang } = useI18n();
  const isHe = lang === 'he';

  const lead = isHe ? 'leading-loose' : 'leading-relaxed';
  const pClass = `text-ink-soft text-start ${lead}`;
  const hClass = 'font-display text-ink text-xl md:text-2xl mt-12 mb-3 text-start';
  const linkClass =
    'text-ink underline underline-offset-4 decoration-line transition-colors hover:text-sage hover:decoration-sage';

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
    <div className="bg-cream text-ink" data-theme="cream">
      <Seo title={t.legal.privacyHeading} />
      <Section className="pt-32 md:pt-40">
        <Container className="max-w-3xl">
          <RevealText
            text={t.legal.privacyHeading}
            as="h1"
            className="font-display text-5xl md:text-7xl leading-[0.95] text-ink text-start"
          />

          <Reveal className="mt-10 md:mt-14">
            {isHe ? (
              <div>
                <p className={pClass}>
                  מסמך זה מסביר אילו פרטים נאספים כאשר אתם פונים אליי דרך האתר, כיצד הם נשמרים וכיצד
                  נעשה בהם שימוש. אני מכבד את פרטיותכם ופועל באחריות עם כל מידע שאתם בוחרים לשתף.
                </p>

                <h2 className={hClass}>אילו פרטים נאספים</h2>
                <p className={pClass}>
                  כאשר אתם ממלאים את טופס יצירת הקשר נאספים אך ורק הפרטים שאתם מזינים: שם, מספר טלפון,
                  כתובת דוא"ל ותוכן ההודעה. איני אוסף מידע נוסף מעבר לפרטים שאתם בוחרים למסור.
                </p>

                <h2 className={hClass}>כיצד נעשה שימוש במידע</h2>
                <p className={pClass}>
                  הפרטים משמשים אך ורק כדי לחזור אליכם ולהשיב לפנייתכם בנוגע לפרויקט עיצוב. איני מוכר,
                  משכיר או מעביר את פרטיכם לצדדים שלישיים, ואיני עושה בהם שימוש למטרות שיווק.
                </p>

                <h2 className={hClass}>וואטסאפ ודוא"ל</h2>
                <p className={pClass}>
                  אם תבחרו ליצור קשר דרך וואטסאפ או בדוא"ל, ההתכתבות מתנהלת בפלטפורמות אלו ובכפוף לתנאי
                  השימוש ולמדיניות הפרטיות שלהן. אני שומר את ההתכתבות רק למשך הזמן הדרוש לטיפול בפנייתכם.
                </p>

                <h2 className={hClass}>עוגיות וניתוח נתונים</h2>
                <p className={pClass}>
                  האתר עושה שימוש מצומצם בעוגיות הדרושות לתפקודו התקין ולשמירת העדפת השפה. ככל שנעשה
                  שימוש בכלי לניתוח תנועה, הוא משמש להבנת אופן השימוש באתר בלבד וללא זיהוי אישי. ניתן
                  לחסום עוגיות דרך הגדרות הדפדפן.
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
                  This document explains what information is collected when you contact me through this
                  site, how it is stored, and how it is used. I respect your privacy and handle any
                  information you choose to share responsibly.
                </p>

                <h2 className={hClass}>Information collected</h2>
                <p className={pClass}>
                  When you complete the contact form, only the details you enter are collected: your
                  name, phone number, email address, and the content of your message. No additional
                  information is gathered beyond what you choose to provide.
                </p>

                <h2 className={hClass}>How the information is used</h2>
                <p className={pClass}>
                  Your details are used solely to get back to you and respond to your enquiry about a
                  design project. I do not sell, rent, or pass your details to third parties, and I do
                  not use them for marketing.
                </p>

                <h2 className={hClass}>WhatsApp and email</h2>
                <p className={pClass}>
                  If you choose to reach out via WhatsApp or email, the conversation takes place on
                  those platforms and is subject to their own terms and privacy policies. I keep
                  correspondence only for as long as needed to handle your enquiry.
                </p>

                <h2 className={hClass}>Cookies and analytics</h2>
                <p className={pClass}>
                  The site makes minimal use of cookies required for it to function correctly and to
                  remember your language preference. Where an analytics tool is used, it serves only to
                  understand how the site is used, without personal identification. You can block
                  cookies through your browser settings.
                </p>

                <h2 className={hClass}>Your rights and contact</h2>
                <p className={pClass}>
                  You may request to review, correct, or delete the details held about you. For any
                  privacy related request, contact me by email at {mail} or by phone at {tel}.
                </p>
              </div>
            )}

            <div className="mt-14">
              <LangLink to="" className={btnLine}>
                {t.legal.back}
              </LangLink>
            </div>
          </Reveal>
        </Container>
      </Section>
    </div>
  );
}
