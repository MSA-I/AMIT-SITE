import { useEffect, useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n, type Lang } from '../i18n/context';
import { localePath, PHONE_DISPLAY, PHONE, EMAIL, INSTAGRAM, INSTAGRAM_HANDLE, waLink } from '../lib/paths';
import { stopScroll } from '../motion/smooth';
import { LangLink } from './ui';

// Primary navigation: three page destinations mirroring the reference.
const navItems = [
  { key: 'about', to: '/about' },
  { key: 'portfolio', to: '/portfolio' },
  { key: 'contact', to: '/contact' },
] as const;

export default function Menu() {
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    stopScroll(open);
    return () => stopScroll(false);
  }, [open]);

  // Header text adapts to the theme of the section currently under it.
  useEffect(() => {
    const secs = Array.from(document.querySelectorAll('[data-theme]'));
    if (!secs.length) {
      setDark(false);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setDark(e.target.getAttribute('data-theme') === 'ink');
      },
      { rootMargin: '0px 0px -100% 0px' }
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [loc.pathname]);

  const other: Lang = lang === 'he' ? 'en' : 'he';
  const switchLang = () => {
    setOpen(false);
    const rest = loc.pathname.replace(/^\/(he|en)/, '');
    nav(`/${other}${rest}`);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[70] transition-colors duration-300 ${dark ? 'text-cream' : 'text-ink'}`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-10">
          <NavLink to={localePath(lang)} className="font-display text-xl tracking-[0.16em]" data-cursor>
            AMIT BAR
          </NavLink>
          <button onClick={() => setOpen(true)} className="u-label" data-cursor aria-label={t.nav.menu}>
            {t.nav.menu}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex flex-col bg-ink text-cream"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 py-5 md:px-10">
              <span className="font-display text-xl tracking-[0.16em]">AMIT BAR</span>
              <button onClick={() => setOpen(false)} className="u-label" data-cursor aria-label={t.nav.close}>
                {t.nav.close}
              </button>
            </div>

            <nav aria-label={t.nav.menu} className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-center gap-1 px-6 md:px-10">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  <LangLink
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-4 text-start font-display text-5xl leading-[1.05] text-cream/90 transition-colors hover:text-cream md:text-8xl"
                    data-cursor
                  >
                    <span className="accent-dot opacity-0 transition-opacity group-hover:opacity-100" />
                    {t.nav[item.key]}
                  </LangLink>
                </motion.div>
              ))}
            </nav>

            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-6 py-8 text-sm text-cream/70 md:flex-row md:items-center md:justify-between md:px-10">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <a href={`tel:${PHONE}`} dir="ltr" className="hover:text-cream" data-cursor>{PHONE_DISPLAY}</a>
                <a href={`mailto:${EMAIL}`} className="hover:text-cream" data-cursor>{EMAIL}</a>
                <a href={waLink(t.contact.whatsappMessage)} target="_blank" rel="noopener" className="hover:text-cream" data-cursor>{t.contact.whatsapp}</a>
                <a href={INSTAGRAM} target="_blank" rel="noopener" className="hover:text-cream" data-cursor>{INSTAGRAM_HANDLE}</a>
              </div>
              <button onClick={switchLang} className="u-label text-cream" data-cursor>
                {t.switchTo}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
