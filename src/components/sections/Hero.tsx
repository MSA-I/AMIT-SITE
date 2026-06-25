import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useReducedMotion,
} from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { Container, Rule, btnSolid, btnGhost, LangLink } from '../ui';

const HERO_IMG = '/projects/modern-penthouse/01.webp';

export default function Hero() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 20, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 90, damping: 20, mass: 0.4 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [5, -5]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [-5, 5]);

  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 700], [0, -50]);

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden bg-bg pt-24 pb-16 md:pt-28">
      {/* faint architectural grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
        style={{
          backgroundImage:
            'linear-gradient(#e4e1dc 1px, transparent 1px), linear-gradient(90deg, #e4e1dc 1px, transparent 1px)',
          backgroundSize: '88px 88px',
        }}
        aria-hidden
      />

      <Container className="relative grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-6">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.28em] text-copper">
              <Rule className="w-10" />
              {t.hero.role}
            </span>

            <h1 className="mt-6 font-display text-6xl font-medium leading-[0.95] tracking-tight text-ink md:text-8xl">
              {t.hero.name}
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">{t.hero.intro}</p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <LangLink to="/contact" className={btnSolid}>
                {t.hero.ctaPrimary}
                <ArrowUpRight className="h-4 w-4" />
              </LangLink>
              <LangLink to="/portfolio" className={btnGhost}>
                {t.hero.ctaSecondary}
              </LangLink>
            </div>
          </motion.div>
        </div>

        <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="md:col-span-6">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: 1000 }}
          >
            <motion.div
              style={reduce ? undefined : { rotateX, rotateY, y: imgY, transformStyle: 'preserve-3d' }}
              className="relative"
            >
              <div className="absolute inset-0 translate-x-4 translate-y-4 border border-copper/40 rtl:-translate-x-4" aria-hidden />
              <img
                src={HERO_IMG}
                alt={t.hero.name + ' - ' + t.hero.role}
                width={1200}
                height={1500}
                loading="eager"
                fetchPriority="high"
                className="relative aspect-[4/5] w-full object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
