import { useEffect, useRef, type RefObject } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useI18n, type Lang } from '../i18n/context';
import { PHONE_DISPLAY, PHONE, EMAIL, INSTAGRAM, INSTAGRAM_HANDLE, waLink } from '../lib/paths';
import { LangLink, SlideLabel } from './ui';
import { projects, title, brief } from '../data/projects';

// Primary navigation: three page destinations mirroring the reference.
const navItems = [
  { key: 'about', to: '/about' },
  { key: 'portfolio', to: '/portfolio' },
  { key: 'contact', to: '/contact' },
] as const;

// reference eases: power2.out for the wipe/media, power3.out for the rows
const EASE_P2: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const EASE_P3: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

/**
 * MenuOverlay - the full-height ink wipe (z 30, under the fixed frame and the
 * pill). Framer tree only (NO ScrollTrigger). The panel is anchored to the
 * logical end edge and animates width 0 -> 100vw (reference initMenu beats);
 * the inner content wrapper is a fixed-100vw layer pinned to the same edge so
 * nothing reflows during the wipe. Close plays the wipe at 2x. The brand
 * wordmark is NOT duplicated here - the fixed frame provides it above.
 * Reduced motion: everything renders instantly (no wipe, no staggers).
 */
export default function MenuOverlay({
  open,
  onClose,
  pillRef,
}: {
  open: boolean;
  onClose: () => void;
  pillRef: RefObject<HTMLButtonElement | null>;
}) {
  const { t, lang, dir } = useI18n();
  const nav = useNavigate();
  const loc = useLocation();
  const reduce = useReducedMotion() ?? false;
  const overlayRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  const featured = projects[0];
  // start the list after the featured project so it is not shown twice
  const list = projects.slice(1, 6);

  const other: Lang = lang === 'he' ? 'en' : 'he';
  const switchLang = () => {
    onClose();
    const rest = loc.pathname.replace(/^\/(he|en)/, '');
    nav(`/${other}${rest}`);
  };

  // focus first link on open; return focus to the pill on close
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const id = requestAnimationFrame(() => {
        overlayRef.current?.querySelector<HTMLElement>('a[href]')?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      pillRef.current?.focus();
    }
  }, [open, pillRef]);

  // manual Tab trap cycling pill -> overlay focusables -> pill
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = [
        ...(pillRef.current ? [pillRef.current] : []),
        ...Array.from(
          overlayRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
        ),
      ];
      if (!items.length) return;
      const idx = items.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey) {
        if (idx <= 0) {
          e.preventDefault();
          items[items.length - 1].focus();
        }
      } else if (idx === -1 || idx === items.length - 1) {
        e.preventDefault();
        items[0].focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, pillRef]);

  // per-element enter beats (reference initMenu timeline); reduce -> instant
  const tr = (delay: number, duration: number, ease: [number, number, number, number]) =>
    reduce ? { duration: 0 } : { delay, duration, ease };
  const row = (delay: number, from = '120%') =>
    ({
      initial: reduce ? false : { y: from, opacity: 0 },
      animate: { y: '0%', opacity: 1 },
      transition: tr(delay, 0.65, EASE_P3),
    }) as const;

  // media reveal mirrors with the wipe: from the logical-end edge
  const rtl = dir === 'rtl';
  const clipFrom = rtl ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)';
  const imgFrom = rtl ? '-35%' : '35%';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          id="menu-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t.nav.menu}
          className="fixed top-0 end-0 z-30 h-dvh overflow-hidden bg-ink text-cream"
          initial={{ width: '0vw' }}
          animate={{ width: '100vw' }}
          exit={{
            width: '0vw',
            transition: reduce ? { duration: 0 } : { duration: 0.375, ease: EASE_P2 },
          }}
          transition={reduce ? { duration: 0 } : { duration: 0.75, ease: EASE_P2 }}
        >
          {/* fixed-width layer pinned to the wipe-origin edge: content never reflows */}
          <div className="absolute top-0 end-0 h-full w-screen overflow-y-auto">
            {/* bottom padding reserves the FixedFrame mark's corner (z 40 above
                the overlay) so the featured caption / contact row never sit
                under the difference-blended BAR(R) */}
            <div className="mx-auto flex min-h-full w-full max-w-[1600px] flex-col gap-10 px-6 pb-[calc(var(--frame-pad)_+_var(--frame-logo-size)*1.3)] pt-24 md:px-10 md:pt-28">
              <div className="grid flex-1 grid-cols-1 gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-16">
                {/* start column: primary nav + project list */}
                <div className="flex flex-col justify-center gap-10 md:gap-14">
                  <nav aria-label={t.nav.menu} className="flex flex-col gap-1">
                    {navItems.map((item, i) => (
                      <motion.div key={item.key} {...row(0.3 + i * 0.1)}>
                        <LangLink
                          to={item.to}
                          onClick={onClose}
                          className="group flex items-center gap-4 text-start font-display text-4xl leading-[1.05] text-cream/90 transition-colors hover:text-cream sm:text-5xl md:text-7xl"
                        >
                          <span className="accent-dot opacity-0 transition-opacity group-hover:opacity-100" />
                          {t.nav[item.key]}
                        </LangLink>
                      </motion.div>
                    ))}
                  </nav>

                  <div>
                    <motion.p className="u-label mb-4 text-cream/65" {...row(0.9)}>
                      {t.portfolio.eyebrow}
                    </motion.p>
                    <ul className="border-t border-cream/15">
                      {list.map((p, i) => (
                        <motion.li
                          key={p.slug}
                          className="border-b border-cream/15"
                          {...row(0.95 + i * 0.15)}
                        >
                          <LangLink
                            to={`/portfolio/${p.slug}`}
                            onClick={onClose}
                            className="group flex items-baseline justify-between gap-4 py-3.5"
                          >
                            <span className="flex items-baseline gap-4">
                              <span className="u-label text-cream/55">{String(i + 1).padStart(2, '0')}</span>
                              <span className="font-display text-xl text-cream/85 transition-colors group-hover:text-cream sm:text-2xl">
                                <SlideLabel>{title(p, lang)}</SlideLabel>
                              </span>
                            </span>
                            <span className="u-label hidden text-cream/60 sm:block">{brief(p, lang)}</span>
                          </LangLink>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* end column: featured project media, unclipped from the wipe edge */}
                {featured && (
                  <motion.div
                    className="hidden md:block"
                    initial={reduce ? false : { clipPath: clipFrom }}
                    animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                    transition={tr(0.2, 0.75, EASE_P2)}
                  >
                    <LangLink
                      to={`/portfolio/${featured.slug}`}
                      onClick={onClose}
                      className="group relative block overflow-hidden"
                      data-cursor="explore"
                    >
                      {/* hover zoom lives on this span so Framer's inline x transform on the img never fights it */}
                      <span className="block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]">
                        <motion.img
                          src={featured.cover}
                          alt={title(featured, lang)}
                          loading="lazy"
                          // height cap: at laptop heights the 4/5 image pushed
                          // the brand/contact row below the fold AND its caption
                          // under the FixedFrame corner mark (QA findings)
                          className="aspect-[4/5] max-h-[56vh] w-full object-cover"
                          initial={reduce ? false : { x: imgFrom }}
                          animate={{ x: '0%' }}
                          transition={tr(0.2, 1.1, EASE_P2)}
                        />
                      </span>
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink/70 to-transparent p-6">
                        <span className="font-display text-2xl text-cream">{title(featured, lang)}</span>
                        <span className="u-label text-cream/70">{brief(featured, lang)}</span>
                      </span>
                    </LangLink>
                  </motion.div>
                )}
              </div>

              {/* contact row + language switcher, last beat */}
              <motion.div
                className="flex flex-col gap-4 text-sm text-cream/70 md:flex-row md:items-center md:justify-between"
                {...row(1.4, '105%')}
              >
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  {/* the real brand lockup (white on the ink overlay) */}
                  <img
                    src="/brand/ab-logo.png"
                    alt=""
                    aria-hidden
                    className="h-12 w-auto opacity-90 me-2"
                  />
                  <a href={`tel:${PHONE}`} dir="ltr" className="hover:text-cream">{PHONE_DISPLAY}</a>
                  <a href={`mailto:${EMAIL}`} className="hover:text-cream">{EMAIL}</a>
                  <a href={waLink(t.contact.whatsappMessage)} target="_blank" rel="noopener" className="hover:text-cream">{t.contact.whatsapp}</a>
                  <a href={INSTAGRAM} target="_blank" rel="noopener" dir="ltr" className="hover:text-cream">{INSTAGRAM_HANDLE}</a>
                </div>
                <button onClick={switchLang} className="u-label cursor-pointer text-cream">
                  {t.switchTo}
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
