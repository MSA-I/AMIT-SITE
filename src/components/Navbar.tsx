import { useState } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useI18n, type Lang } from '../i18n/context';
import { localePath } from '../lib/paths';
import { Container, btnSolid } from './ui';

function LanguageSwitcher({ onSwitch }: { onSwitch?: () => void }) {
  const { lang, t } = useI18n();
  const loc = useLocation();
  const navigate = useNavigate();
  const other: Lang = lang === 'he' ? 'en' : 'he';
  const go = () => {
    const rest = loc.pathname.replace(/^\/(he|en)/, '');
    navigate(`/${other}${rest}${loc.hash || ''}`);
    onSwitch?.();
  };
  return (
    <button
      onClick={go}
      className="text-sm font-medium text-muted transition-colors hover:text-copper"
      aria-label={`Switch to ${t.switchTo}`}
    >
      {t.switchTo}
    </button>
  );
}

export default function Navbar() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 40));

  const links = [
    { to: '/portfolio', label: t.nav.portfolio },
    { to: '/about', label: t.nav.about },
    { to: '/process', label: t.nav.process },
    { to: '/services', label: t.nav.services },
    { to: '/contact', label: t.nav.contact },
  ];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-line bg-bg/85 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <Container className="flex h-16 items-center justify-between md:h-20">
          <NavLink to={localePath(lang)} className="group flex flex-col leading-none" aria-label="Amit Bar - home">
            <span className="font-display text-lg font-semibold tracking-[0.18em] text-ink">AMIT BAR</span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.3em] text-copper">
              {lang === 'he' ? 'עיצוב פנים' : 'Interior Design'}
            </span>
          </NavLink>

          <nav aria-label={lang === 'he' ? 'ניווט ראשי' : 'Primary'} className="hidden items-center gap-9 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={localePath(lang, l.to)}
                className={({ isActive }) =>
                  `group relative text-sm font-medium transition-colors ${
                    isActive ? 'text-copper' : 'text-muted hover:text-ink'
                  }`
                }
              >
                {l.label}
                <span className="absolute -bottom-1.5 start-0 h-px w-0 bg-copper transition-all duration-300 group-hover:w-full" />
              </NavLink>
            ))}
            <LanguageSwitcher />
            <NavLink to={localePath(lang, '/contact')} className={btnSolid + ' !px-5 !py-2.5'}>
              {t.nav.book}
            </NavLink>
          </nav>

          <button
            onClick={() => setOpen(true)}
            className="p-2 text-ink md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </Container>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] bg-bg md:hidden"
          >
            <Container className="flex h-16 items-center justify-between">
              <span className="font-display text-lg font-semibold tracking-[0.18em] text-ink">AMIT BAR</span>
              <button onClick={() => setOpen(false)} className="p-2 text-ink" aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </Container>
            <nav aria-label={lang === 'he' ? 'תפריט' : 'Menu'} className="flex flex-col gap-2 px-6 pt-8">
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.06 }}
                >
                  <NavLink
                    to={localePath(lang, l.to)}
                    onClick={() => setOpen(false)}
                    className="block border-b border-line py-4 text-2xl font-medium text-ink"
                  >
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
              <div className="mt-6 flex items-center justify-between">
                <LanguageSwitcher onSwitch={() => setOpen(false)} />
                <NavLink
                  to={localePath(lang, '/contact')}
                  onClick={() => setOpen(false)}
                  className={btnSolid}
                >
                  {t.nav.book}
                </NavLink>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
