import { useEffect } from 'react';
import { Outlet, useParams, useLocation, Navigate } from 'react-router-dom';
import { LanguageProvider, isLang, useI18n } from '../i18n/context';
import Navbar from './Navbar';
import Footer from './Footer';
import StickyContact from './StickyContact';
import { PHONE, EMAIL, INSTAGRAM } from '../lib/paths';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

// One visually-hidden <h1> per sub-page (home has its own visible h1 in the hero).
function RouteH1() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const seg = pathname.replace(/^\/(he|en)\/?/, '').split('/')[0];
  if (!seg) return null;
  const map: Record<string, string> = {
    portfolio: t.portfolio.heading,
    about: t.about.heading,
    services: t.services.heading,
    process: t.process.heading,
    contact: t.contact.heading,
    privacy: t.legal.privacyHeading,
    accessibility: t.legal.accessibilityHeading,
  };
  return <h1 className="sr-only">{map[seg] ?? t.hero.name}</h1>;
}

const JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'InteriorDesignBusiness',
  name: 'Amit Bar Interior Design',
  alternateName: 'עמית בר עיצוב פנים',
  url: 'https://abdesigner.co.il',
  telephone: PHONE,
  email: EMAIL,
  image: 'https://abdesigner.co.il/projects/modern-penthouse/01.webp',
  areaServed: 'IL',
  sameAs: [INSTAGRAM],
  description:
    'Boutique interior design studio - luxury apartments, private homes and commercial spaces.',
};

export default function Layout() {
  const { lang } = useParams();

  useEffect(() => {
    const id = 'ld-json';
    if (document.getElementById(id)) return;
    const s = document.createElement('script');
    s.id = id;
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(JSONLD);
    document.head.appendChild(s);
  }, []);

  if (!isLang(lang)) return <Navigate to="/he" replace />;

  return (
    <LanguageProvider lang={lang}>
      <ScrollToTop />
      <Navbar />
      <main id="main">
        <RouteH1 />
        <Outlet />
      </main>
      <Footer />
      <StickyContact />
    </LanguageProvider>
  );
}
