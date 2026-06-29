import { useI18n } from '../../i18n/context';
import { Container, EdgeLabel } from '../ui';
import SpinningBadge from '../SpinningBadge';
import { Reveal } from '../../motion/anim';
import { scrollToEl } from '../../motion/smooth';

/**
 * Logo-centric hero. The oversized wordmark is the fixed <ScrollLogo/> overlay
 * (it shrinks into the header on scroll); this section is the quiet cream stage
 * beneath it, carrying only the scroll cue, role label and corner mark.
 */
export default function Hero() {
  const { t } = useI18n();
  return (
    <section id="hero" data-theme="cream" className="relative min-h-[100dvh] overflow-hidden bg-cream text-ink">
      <Container className="relative flex min-h-[100dvh] flex-col justify-end pb-10">
        {/* short studio line, bottom-start */}
        <div className="max-w-[34ch]">
          <Reveal>
            <p className="u-label text-ink-soft">{t.hero.role}</p>
          </Reveal>
        </div>

        {/* lone floating accent dot */}
        <span aria-hidden className="accent-dot absolute bottom-[34%] start-[16%]" />

        {/* rotating brand badge (replaces the old corner stamp) */}
        <SpinningBadge size={140} className="absolute bottom-8 end-6 opacity-80 sm:end-8" />

        {/* vertical role micro-label */}
        <EdgeLabel className="pointer-events-none absolute end-5 top-1/2 hidden -translate-y-1/2 text-ink-soft sm:block">
          {t.hero.name}
        </EdgeLabel>

        {/* scroll affordance */}
        <button
          onClick={() => scrollToEl('#intro')}
          className="u-label absolute bottom-7 start-6 text-ink/70 transition-colors hover:text-sage"
          data-cursor
        >
          {t.hero.scrollHint}
        </button>
      </Container>
    </section>
  );
}
