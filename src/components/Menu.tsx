import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { stopScroll } from '../motion/smooth';
import MenuPill from './MenuPill';
import MenuOverlay from './MenuOverlay';

/**
 * Menu - thin coordinator. Owns the single `open` state and wires the two
 * halves that must never share a motion tree:
 *   <MenuPill/>    - GSAP/ScrollTrigger only (fixed pill trigger, z 60)
 *   <MenuOverlay/> - Framer Motion only (full-height wipe, z 30)
 * The brand wordmark lives in the fixed frame (z 40), not here.
 * Also: locks Lenis while open, auto-closes on route change, closes on Escape.
 */
export default function Menu() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  // Shared so the overlay can trap Tab through the pill and return focus to it.
  const pillRef = useRef<HTMLButtonElement>(null);

  // freeze smooth scroll while the overlay is open
  useEffect(() => {
    stopScroll(open);
    return () => stopScroll(false);
  }, [open]);

  // close the overlay on route change (e.g. clicking a project)
  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <MenuPill open={open} onToggle={() => setOpen((v) => !v)} buttonRef={pillRef} />
      <MenuOverlay open={open} onClose={() => setOpen(false)} pillRef={pillRef} />
    </>
  );
}
