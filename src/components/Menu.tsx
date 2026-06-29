import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n, type Lang } from '../i18n/context';
import { PHONE_DISPLAY, PHONE, EMAIL, INSTAGRAM, INSTAGRAM_HANDLE, waLink } from '../lib/paths';
import { stopScroll } from '../motion/smooth';
import { useHeaderTheme } from '../motion/useHeaderTheme';
import { LangLink, SlideLabel, EASE_EXPO } from './ui';
import ScrollLogo from './ScrollLogo';
import { projects, title, brief } from '../data/projects';

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
  const dark = useHeaderTheme();

  const featured = projects[0];
  // start the list after the featured project so it is not shown twice
  const list = projects.slice(1, 6);

  useEffect(() => {
    stopScroll(open);
    return () => stopScroll(false);
  }, [open]);

  // close the overlay on route change (e.g. clicking a project)
  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  const other: Lang = lang === 'he' ? 'en' : 'he';
  const switchLang = () => {
    setOpen(false);
    const rest = loc.pathname.replace(/^\/(he|en)/, '');
    nav(`/${other}${rest}`);
  };

  return (
    <>
      {/* header: brand is the fixed <ScrollLogo/>; here only the menu trigger */}
      <header className={`fixed inset-x-0 top-0 z-[70] transition-colors duration-300 ${dark ? 'text-cream' : 'text-ink'}`}>
        <ScrollLogo />
        <div className="mx-auto flex max-w-[1600px] items-center justify-end px-6 py-5 md:px-10">
          <button onClick={() => setOpen(true)} className="u-label" data-cursor aria-label={t.nav.menu}>
            {t.nav.menu}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-ink text-cream"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 py-5 md:px-10">
              <span dir="ltr" className="font-display text-xl tracking-[0.16em]">
                AMIT BAR<span className="align-top text-sage" style={{ fontSize: '0.5em' }}>®</span>
              </span>
              <button onClick={() => setOpen(false)} className="u-label" data-cursor aria-label={t.nav.close}>
                {t.nav.close}
              </button>
            </div>

            <div className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-10 px-6 py-8 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-16 md:px-10">
              {/* start column: primary nav + project list */}
              <div className="flex flex-col justify-center gap-10 md:gap-14">
                <nav aria-label={t.nav.menu} className="flex flex-col gap-1">
                  {navItems.map((item, i) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.07, ease: EASE_EXPO }}
                    >
                      <LangLink
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="group flex items-center gap-4 text-start font-display text-4xl leading-[1.05] text-cream/90 transition-colors hover:text-cream sm:text-5xl md:text-7xl"
                        data-cursor
                      >
                        <span className="accent-dot opacity-0 transition-opacity group-hover:opacity-100" />
                        {t.nav[item.key]}
                      </LangLink>
                    </motion.div>
                  ))}
                </nav>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, ease: EASE_EXPO }}
                >
                  <p className="u-label mb-4 text-cream/65">{t.portfolio.eyebrow}</p>
                  <ul className="border-t border-cream/15">
                    {list.map((p, i) => (
                      <li key={p.slug} className="border-b border-cream/15">
                        <LangLink
                          to={`/portfolio/${p.slug}`}
                          onClick={() => setOpen(false)}
                          className="group flex items-baseline justify-between gap-4 py-3.5"
                          data-cursor
                        >
                          <span className="flex items-baseline gap-4">
                            <span className="u-label text-cream/55">{String(i + 1).padStart(2, '0')}</span>
                            <span className="font-display text-xl text-cream/85 transition-colors group-hover:text-cream sm:text-2xl">
                              <SlideLabel>{title(p, lang)}</SlideLabel>
                            </span>
                          </span>
                          <span className="u-label hidden text-cream/60 sm:block">{brief(p, lang)}</span>
                        </LangLink>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* end column: featured project media */}
              {featured && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, ease: EASE_EXPO }}
                  className="hidden md:block"
                >
                  <LangLink
                    to={`/portfolio/${featured.slug}`}
                    onClick={() => setOpen(false)}
                    className="group relative block overflow-hidden"
                    data-cursor
                  >
                    <img
                      src={featured.cover}
                      alt={title(featured, lang)}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink/70 to-transparent p-6">
                      <span className="font-display text-2xl text-cream">{title(featured, lang)}</span>
                      <span className="u-label text-cream/70">{brief(featured, lang)}</span>
                    </span>
                  </LangLink>
                </motion.div>
              )}
            </div>

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
