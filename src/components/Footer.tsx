import { useLayoutEffect, useRef } from 'react';
import { useI18n } from '../i18n/context';
import { LangLink, SlideLabel } from './ui';
import { gsap, ScrollTrigger, prefersReduced } from '../motion/anim';
import SpinningBadge from './SpinningBadge';
import BarWordmark, { WORDMARK_MORPHS } from './footer/BarWordmark';
import { projects, title, brief } from '../data/projects';
import {
  PHONE,
  PHONE_DISPLAY,
  EMAIL,
  INSTAGRAM,
  INSTAGRAM_HANDLE,
  waLink,
} from '../lib/paths';

/**
 * Footer - THE morphing wordmark moment (cream, renders on every page).
 * The giant "BAR(R)" slab SVG rests in its top band; as the footer scrolls in,
 * a scrubbed MorphSVG timeline pulls the B/R stems down into the empty lower
 * two-thirds (each #*_i path morphs toward its invisible #*_f partner - see
 * src/components/footer/BarWordmark.tsx). A featured-project card overlaps
 * that lower zone via negative block margin, so the stems stretch past it.
 * Reduced-motion: no timeline, the letters stay static in the top band.
 */
export default function Footer() {
  const { t, lang, dir } = useI18n();
  const wrapRef = useRef<HTMLDivElement>(null);
  const featured = projects[0];

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (prefersReduced()) {
      // Static END state: without the scrub the letters would rest in the top
      // band and leave the whole morph runway (2/3 of the SVG) as a dead cream
      // void under a protected preference. Snap each morphing path to its
      // stretched partner so the composition is complete at rest.
      WORDMARK_MORPHS.forEach(([from, to]) => {
        const src = wrap.querySelector<SVGPathElement>(from);
        const dst = wrap.querySelector<SVGPathElement>(to);
        const d = dst?.getAttribute('d');
        if (src && d) src.setAttribute('d', d);
      });
      return;
    }
    let st: ScrollTrigger | undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      WORDMARK_MORPHS.forEach(([from, to]) => {
        tl.to(from, { morphSVG: to, duration: 1, ease: 'none' }, 0);
      });
      st = ScrollTrigger.create({
        animation: tl,
        trigger: wrap,
        start: 'top 55%',
        end: 'bottom bottom',
        scrub: 2,
      });
    }, wrap);
    // The footer is persistent chrome (mounted once in Layout); page height
    // changes under it on navigation (e.g. the home pin-spacer), so re-measure
    // when the freshly mounted page signals it is laid out.
    // sort() is REQUIRED, not just refresh(): the home stage pin is created
    // AFTER this persistent trigger, so the internal refresh order has the
    // footer measuring BEFORE the pin re-applies its spacer - start/end land
    // ~13000px too early (verified live: 2415 -> 15764 once sorted). sort()
    // reorders the trigger array by document position; refresh then measures
    // every post-pin trigger correctly.
    const onReady = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      // Hard-sync the timeline to the freshly measured progress. The scrub
      // tween does NOT restart across the route jump (observed live: after
      // navigating away from a fully-stretched footer, st.progress reads 0
      // while the timeline stays stuck at 1), so snap it here - the footer is
      // offscreen during the transition, no visible jump.
      st?.animation?.progress(st.progress);
    };
    window.addEventListener('amit:pageready', onReady);
    return () => {
      window.removeEventListener('amit:pageready', onReady);
      ctx.revert();
    };
  }, []);

  const contacts = [
    { label: PHONE_DISPLAY, href: `tel:${PHONE}`, ltr: true, ext: false },
    { label: EMAIL, href: `mailto:${EMAIL}`, ltr: false, ext: false },
    { label: t.contact.whatsapp, href: waLink(t.contact.whatsappMessage), ltr: false, ext: true },
    { label: INSTAGRAM_HANDLE, href: INSTAGRAM, ltr: true, ext: true },
  ];

  return (
    <footer data-theme="cream" className="relative overflow-hidden bg-cream text-ink">
      <div className="mx-auto w-full max-w-[1600px] px-5 pt-16 sm:px-6 md:px-10 md:pt-24">
        {/* 1 - contact strip: closing line at the start, rollover links pushed to the end */}
        <div className="flex flex-wrap items-baseline justify-end gap-x-8 gap-y-3 border-b border-line pb-6">
          {/* hero-em: italic is an LTR-only move; Hebrew gets weight contrast
              (Frank Ruhl has no italic - the browser would synthesize a slant) */}
          <span className="me-auto font-display hero-em text-lg md:text-xl">{t.footer.closing}</span>
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              dir={c.ltr ? 'ltr' : undefined}
              {...(c.ext ? { target: '_blank', rel: 'noopener' } : {})}
              className="group u-label"
            >
              <SlideLabel>{c.label}</SlideLabel>
            </a>
          ))}
        </div>

        {/* 2 - the giant morphing wordmark */}
        <div className="mt-12 md:mt-16">
          <span aria-hidden="true" className="u-label mb-3 block">
            AMIT
          </span>
          <span className="sr-only">AMIT BAR</span>
          <div ref={wrapRef} aria-hidden="true" dir="ltr">
            <BarWordmark className="w-full" />
          </div>
        </div>

        {/* 3 - featured project card, overlapping the wordmark's empty lower zone */}
        <LangLink
          to={`/portfolio/${featured.slug}`}
          data-cursor="explore"
          className="relative z-10 block border border-line bg-paper p-4 md:p-6"
          style={{
            width: 'clamp(16rem, 26vw, 30rem)',
            marginBlockStart: 'clamp(-30rem, -18vw, -6rem)',
            marginInlineStart: 'auto',
            // RTL: inline-end is the LEFT edge, where the stretched B lands -
            // push the card further in so the morph payoff (bottom bar + stem
            // feet) stays visible instead of vanishing behind the card.
            marginInlineEnd: dir === 'rtl' ? 'clamp(8rem, 20vw, 22rem)' : 'clamp(1.5rem, 6vw, 6rem)',
          }}
        >
          <span className="u-label block text-ink-soft">{t.footer.featuredLabel}</span>
          <img
            src={featured.cover}
            alt={title(featured, lang)}
            loading="lazy"
            className="mt-4 aspect-[4/3] w-full object-cover"
          />
          <h3 className="mt-4 font-display text-2xl md:text-3xl">{title(featured, lang)}</h3>
          <p className="mt-1 text-sm text-ink-soft">{brief(featured, lang)}</p>
        </LangLink>

        {/* 4 - bottom row. Inline end padding keeps it clear of the FixedFrame
            mark, which owns that bottom corner; the badge lives mid-row. */}
        <div
          className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-6 border-t border-line py-8 md:mt-20"
          style={{ paddingInlineEnd: 'calc(var(--frame-pad) + var(--frame-logo-size) * 3)' }}
        >
          <img
            src="/brand/ab-logo-ink.png"
            alt="Amit Bar Interior Design"
            className="h-16 w-auto"
          />
          <SpinningBadge size={76} className="opacity-70" />
          <div className="ms-auto flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft">
            <span>© 2026 Amit Bar. {t.footer.rights}.</span>
            <LangLink to="/privacy" className="group hover:text-ink">
              <SlideLabel>{t.footer.privacy}</SlideLabel>
            </LangLink>
            <LangLink to="/accessibility" className="group hover:text-ink">
              <SlideLabel>{t.footer.accessibility}</SlideLabel>
            </LangLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
