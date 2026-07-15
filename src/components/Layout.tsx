import { useEffect, useState } from 'react';
import { Outlet, useParams, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageProvider, isLang, useI18n } from '../i18n/context';
import Menu from './Menu';
import Footer from './Footer';
import Cursor from './Cursor';
import FixedFrame from './FixedFrame';
import Preloader from './Preloader';
import PageTransition from './PageTransition';
import { useSmoothScroll, resetScroll } from '../motion/smooth';
import { ScrollTrigger } from '../motion/anim';
import { PHONE, EMAIL, INSTAGRAM } from '../lib/paths';

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
  description: 'Boutique interior design studio - luxury apartments, private homes and commercial spaces.',
};

// Visually-hidden per-page <h1> (home supplies its own visible h1 in the hero).
function RouteH1() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const seg = pathname.replace(/^\/(he|en)\/?/, '').split('/')[0];
  if (!seg) return null;
  const map: Record<string, string> = {
    about: t.about.heading,
    // portfolio index + detail pages render their own visible <h1>, so no sr-only one here
    contact: t.contact.heading,
    privacy: t.legal.privacyHeading,
    accessibility: t.legal.accessibilityHeading,
  };
  return <h1 className="sr-only">{map[seg] ?? t.hero.name}</h1>;
}

export default function Layout() {
  const { lang } = useParams();
  const { pathname } = useLocation();
  useSmoothScroll();
  // Read synchronously so the first paint picks the correct branch (no remount flip).
  const [reduce] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const id = 'ld-json';
    if (document.getElementById(id)) return;
    const s = document.createElement('script');
    s.id = id;
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(JSONLD);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    resetScroll();
  }, [pathname]);

  // Refresh ScrollTrigger once the freshly mounted page is laid out, so its
  // scroll-driven sections measure against the new DOM (not the old route).
  useEffect(() => {
    if (!reduce) return;
    const id = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      // signal the persistent chrome (MenuPill theme observer) that the new page is mounted
      window.dispatchEvent(new Event('amit:pageready'));
    });
    return () => window.cancelAnimationFrame(id);
  }, [pathname, reduce]);

  if (!isLang(lang)) return <Navigate to="/he" replace />;

  return (
    <LanguageProvider lang={lang}>
      {/* Fixed chrome. IRON RULE: <FixedFrame/> and <Cursor/> mount here as
          direct siblings of <main>, OUTSIDE the Framer AnimatePresence tree -
          no ancestor may carry transform / filter / opacity<1 / will-change
          (that would break position:fixed + mix-blend-difference). */}
      <Preloader />
      <PageTransition />
      <Cursor />
      <Menu />
      <FixedFrame />
      <main id="main">
        <RouteH1 />
        {reduce ? (
          // Reduced motion: no enter/leave sequencing, content static + visible.
          <Outlet />
        ) : (
          // Swup-like enter/leave: outgoing page exits before the incoming
          // mounts, masked by the <PageTransition/> ink curtain.
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
              onAnimationComplete={() => {
                ScrollTrigger.refresh();
                window.dispatchEvent(new Event('amit:pageready'));
              }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        )}
      </main>
      <Footer />
    </LanguageProvider>
  );
}
