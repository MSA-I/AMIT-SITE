import { useEffect } from 'react';
import { useI18n } from '../i18n/context';
import Seo from '../components/Seo';
import { introDone } from '../motion/intro';
import { projects } from '../data/projects';
import HorizontalStage from '../motion/HorizontalStage';
import PanelHero from '../components/sections/panels/PanelHero';
import PanelImages from '../components/sections/panels/PanelImages';
import PanelStatement from '../components/sections/panels/PanelStatement';
import PanelDark from '../components/sections/panels/PanelDark';
import PanelStrip from '../components/sections/panels/PanelStrip';
import PanelImagesB from '../components/sections/panels/PanelImagesB';
import PanelValues from '../components/sections/panels/PanelValues';
import PanelProjects from '../components/sections/panels/PanelProjects';
import CTASection from '../components/sections/CTASection';
import ContactSection from '../components/sections/ContactSection';

/**
 * v3 home: one pinned horizontal journey of 8 chapters (vertical fallback
 * stack on tablets/mobile/reduced-motion), followed by the vertical tail
 * (CTA + contact). PanelHero owns the page's visible <h1> (RouteH1 in Layout
 * skips home).
 */
export default function Home() {
  const { t, lang } = useI18n();

  // After the intro curtain, warm the stage media the journey will reach
  // (covers + the secondary shots the flips/bubble/accordion use) one image
  // at a time in idle slices, so mid-journey panels never pop in blank.
  // PanelImages' first-screen media loads eagerly on its own.
  useEffect(() => {
    let cancelled = false;
    const idle = (cb: () => void) => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(() => cb());
      else window.setTimeout(cb, 250);
    };
    introDone().then(() => {
      if (cancelled) return;
      const urls = [
        ...projects.map((p) => p.cover),
        ...projects.map((p) => p.images[1]?.full),
        ...projects.map((p) => p.images[2]?.full),
        ...projects.slice(0, 3).map((p) => p.images[1]?.thumb),
      ].filter((u): u is string => !!u);
      const queue = [...new Set(urls)];
      const next = () => {
        if (cancelled) return;
        const url = queue.shift();
        if (!url) return;
        const img = new Image();
        img.onload = () => idle(next);
        img.onerror = () => idle(next);
        img.src = url;
      };
      idle(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Seo
        title={lang === 'he' ? 'עמית בר - עיצוב פנים' : 'Amit Bar - Interior Design'}
        description={t.hero.intro}
      />

      <HorizontalStage id="hero">
        <PanelHero />
        <PanelImages />
        <PanelStatement />
        <PanelDark />
        <PanelStrip />
        <PanelImagesB />
        <PanelValues />
        <PanelProjects />
      </HorizontalStage>

      {/* vertical tail below the stage */}
      <CTASection />
      <ContactSection />
    </>
  );
}
