import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useI18n } from '../i18n/context';
import { localePath } from '../lib/paths';

/* ---- Layout ---- */
export const Container: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...p }) => (
  <div className={`mx-auto w-full max-w-[1280px] px-6 md:px-10 ${className}`} {...p} />
);

export const Section: React.FC<React.HTMLAttributes<HTMLElement> & { id?: string }> = ({
  className = '',
  ...p
}) => <section className={`py-20 md:py-28 ${className}`} {...p} />;

/* ---- Copper hairline ---- */
export const Rule: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`block h-px w-12 bg-copper ${className}`} aria-hidden />
);

/* ---- Eyebrow (use sparingly: max 1 per 3 sections) ---- */
export const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-copper ${className}`}
  >
    <Rule className="w-8" />
    {children}
  </span>
);

/* ---- Scroll reveal (reduced-motion aware) ---- */
export const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'li' | 'span';
}> = ({ children, className = '', delay = 0, as = 'div' }) => {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
};

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

/* ---- Section heading ---- */
export const Heading: React.FC<{
  eyebrow?: string;
  title: string;
  sub?: string;
  className?: string;
}> = ({ eyebrow, title, sub, className = '' }) => (
  <div className={`flex flex-col gap-4 ${className}`}>
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-ink text-balance">{title}</h2>
    {sub && <p className="max-w-2xl text-base md:text-lg text-muted">{sub}</p>}
  </div>
);

/* ---- Language-aware Link ---- */
export const LangLink: React.FC<Omit<LinkProps, 'to'> & { to: string }> = ({ to, ...p }) => {
  const { lang } = useI18n();
  return <Link to={localePath(lang, to)} {...p} />;
};

/* ---- Buttons ---- */
const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-all duration-300 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap';

export const btnSolid = `${base} bg-ink text-bg hover:bg-copper`;
export const btnGhost = `${base} border border-line text-ink hover:border-copper hover:text-copper`;
export const btnCopper = `${base} bg-copper text-white hover:bg-copper-deep`;
