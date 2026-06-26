import React, { useRef, useLayoutEffect, useState } from 'react';
import { gsap, ScrollTrigger, prefersReduced } from '../../motion/anim';

interface AnimatedFrameProps {
  children: React.ReactNode;
  className?: string;
  /** Bracket stroke color - defaults to line color */
  bracketColor?: 'line' | 'ink';
  /** Size of bracket arms in px */
  bracketSize?: number;
  /** Hover expansion distance in px */
  hoverExpand?: number;
}

/**
 * AnimatedFrame - decorative corner brackets that animate in on scroll
 * and expand outward on hover. For wrapping images/figures.
 */
export function AnimatedFrame({
  children,
  className = '',
  bracketColor = 'line',
  bracketSize = 20,
  hoverExpand = 6,
}: AnimatedFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bracketsRef = useRef<HTMLDivElement[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  // Animation on scroll
  useLayoutEffect(() => {
    const container = containerRef.current;
    const brackets = bracketsRef.current.filter(Boolean);
    if (!container || brackets.length === 0) return;

    // If reduced motion, show brackets immediately without animation
    if (prefersReduced()) {
      gsap.set(brackets, { autoAlpha: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Initial state: invisible
      gsap.set(brackets, { autoAlpha: 0 });

      // Animate in with stagger
      gsap.to(brackets, {
        autoAlpha: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          once: true,
        },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  // Hover expansion animation
  useLayoutEffect(() => {
    const brackets = bracketsRef.current.filter(Boolean);
    if (!brackets.length || prefersReduced()) return;

    const ctx = gsap.context(() => {
      if (isHovered) {
        // Expand outward - each bracket moves away from center
        gsap.to(brackets[0], { x: -hoverExpand, y: -hoverExpand, duration: 0.3, ease: 'power2.out' }); // top-start
        gsap.to(brackets[1], { x: hoverExpand, y: -hoverExpand, duration: 0.3, ease: 'power2.out' });  // top-end
        gsap.to(brackets[2], { x: -hoverExpand, y: hoverExpand, duration: 0.3, ease: 'power2.out' });  // bottom-start
        gsap.to(brackets[3], { x: hoverExpand, y: hoverExpand, duration: 0.3, ease: 'power2.out' });   // bottom-end
      } else {
        // Return to original position
        gsap.to(brackets, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
      }
    });

    return () => ctx.revert();
  }, [isHovered, hoverExpand]);

  const colorClass = bracketColor === 'ink' ? 'border-ink' : 'border-line';

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      {/* Corner brackets - decorative, hidden from screen readers */}
      {/* Top-start (top-left in LTR, top-right in RTL) */}
      <div
        ref={(el) => { if (el) bracketsRef.current[0] = el; }}
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 start-0 ${colorClass}`}
        style={{
          width: bracketSize,
          height: bracketSize,
          borderTopWidth: 1,
          borderInlineStartWidth: 1,
        }}
      />

      {/* Top-end (top-right in LTR, top-left in RTL) */}
      <div
        ref={(el) => { if (el) bracketsRef.current[1] = el; }}
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 end-0 ${colorClass}`}
        style={{
          width: bracketSize,
          height: bracketSize,
          borderTopWidth: 1,
          borderInlineEndWidth: 1,
        }}
      />

      {/* Bottom-start (bottom-left in LTR, bottom-right in RTL) */}
      <div
        ref={(el) => { if (el) bracketsRef.current[2] = el; }}
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-0 start-0 ${colorClass}`}
        style={{
          width: bracketSize,
          height: bracketSize,
          borderBottomWidth: 1,
          borderInlineStartWidth: 1,
        }}
      />

      {/* Bottom-end (bottom-right in LTR, bottom-left in RTL) */}
      <div
        ref={(el) => { if (el) bracketsRef.current[3] = el; }}
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-0 end-0 ${colorClass}`}
        style={{
          width: bracketSize,
          height: bracketSize,
          borderBottomWidth: 1,
          borderInlineEndWidth: 1,
        }}
      />
    </div>
  );
}

export default AnimatedFrame;
