import { createContext, useContext } from 'react';
// NOTE: gsap.core.Tween below resolves via gsap's ambient global namespace
// (declared in gsap's own typings); a type-only import would be unused.

/**
 * Shared state for a pinned horizontal stage (the v3 home / portfolio journey).
 *
 * - inStage: true anywhere inside a <HorizontalStage> tree (either mode).
 * - horizontal: the pinned horizontal mode is currently active (desktop +
 *   motion-OK). When false the stage renders its vertical fallback stack.
 * - tween: the pin tween, shared so child effects register with
 *   containerAnimation. It is React STATE upstream (not a ref) and arrives
 *   AFTER children first run their effects; while `horizontal && tween === null`
 *   scroll-effect helpers must SKIP building (a vertical-semantics trigger
 *   built first would burn `once:true` reveals), then rebuild when it lands.
 * - scrollToPanel: converts an in-track panel id to the page scroll position
 *   that brings it into view (1px vertical = 1px horizontal).
 */
export interface StageState {
  inStage: boolean;
  horizontal: boolean;
  tween: gsap.core.Tween | null;
  scrollToPanel: (panelId: string) => void;
}

export const StageContext = createContext<StageState>({
  inStage: false,
  horizontal: false,
  tween: null,
  scrollToPanel: () => {},
});

export const useStage = () => useContext(StageContext);

/** The pin tween for containerAnimation, or undefined outside a stage. */
export const useContainerAnimation = () => useStage().tween ?? undefined;

export const isRtl = () =>
  typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

/**
 * Map "element has entered pct% of the viewport" to the leading edge for the
 * current travel direction (vertical 'top 85%' analog):
 * - LTR journey travels leftward; elements enter from the right, leading edge
 *   is their LEFT edge -> 'left 85%'.
 * - RTL journey travels rightward; elements enter from the left, leading edge
 *   is their RIGHT edge -> 'right 15%'.
 *
 * STRING fallback only. GSAP's string path measures the element at
 * containerAnimation.seek(0) vs seek(duration) and divides by that signed
 * distance (_caScrollDist); in the mirrored RTL travel elements move
 * rightward, the distance is negative and the computed trigger times go
 * negative -> the trigger never fires. Prefer the NUMERIC path: stageEdge().
 */
export const stageStart = (pct: number) =>
  isRtl() ? `right ${100 - pct}%` : `left ${pct}%`;

/**
 * Layout offset of `el` within the horizontal track (transform-independent):
 * walks the offsetParent chain from `el` up to (and excluding) `track`,
 * summing offsetLeft. The track carries a transform + will-change:transform,
 * so it IS an offsetParent boundary for every panel descendant.
 */
export function offsetInTrack(el: HTMLElement, track: HTMLElement): number {
  let sum = 0;
  let node: HTMLElement | null = el;
  while (node && node !== track) {
    sum += node.offsetLeft;
    node = node.offsetParent as HTMLElement | null;
  }
  return sum;
}

/**
 * NUMERIC containerAnimation edge (the primary path, works in BOTH travel
 * directions): the absolute page scroll-Y at which `el` "has entered pct% of
 * the viewport" (vertical 'top 85%' analog; pct=85 -> entered 15%).
 *
 * GSAP maps a numeric position linearly from the container's page-scroll
 * range to animation time (mapRange in _parsePosition), which bypasses the
 * signed _caScrollDist division that breaks string positions in mirrored RTL
 * travel. Use as a function value so it re-resolves on refresh:
 *   scrollTrigger: { start: () => stageEdge(tween, el, 85), ... }
 */
export function stageEdge(
  tween: gsap.core.Tween,
  el: HTMLElement | null,
  pct: number
): number {
  const track = tween.targets<HTMLElement>()[0];
  const wrapper = track?.parentElement;
  const st = tween.scrollTrigger;
  if (!el || !track || !wrapper || !st) return 0;
  const vw = wrapper.clientWidth;
  const d = track.scrollWidth - vw; // total horizontal travel (px)
  const L = offsetInTrack(el, track);
  const w = el.offsetWidth;
  // Horizontal travelled (px) when the element's leading edge sits at the
  // pct% viewport line: LTR enters from the right (leading = left edge),
  // RTL mirrored travel enters from the left (leading = right edge).
  const s = isRtl()
    ? d - L - w + ((100 - pct) / 100) * vw
    : L - (pct / 100) * vw;
  // No lower clamp: s < 0 means the element is already past its entry line
  // when the pin starts; the negative mapped time marks the trigger
  // "already entered" so onEnter fires at load (the exact vertical analog of
  // an above-the-fold element, and what keeps scrub progress proportional).
  // Upper clamp at d: an entry line beyond the travel would otherwise never
  // fire; instead it fires exactly at the end of the journey.
  return st.start + Math.min(d, s);
}
