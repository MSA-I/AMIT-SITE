# Mobile Responsive Plan for AMIT-SITE

## Context

**Why this change:** AMIT-SITE currently targets desktop-first with `md:` (768px) as primary breakpoint. Mobile users experience jarring typography scaling, overflow issues, and abrupt layout jumps. This plan makes the site fully responsive while preserving the editorial-kinetic aesthetic exactly.

**Approach:** PRIMARY - make existing site fully responsive. No standalone mobile project needed. The site already has good patterns (HorizontalProjects fallback, cursor disabled on touch, menu overlay) - we're refining typography curves and adding `sm:` intermediate breakpoints.

**Skills activated:** mobile-design, playwright-skill, tailwind-patterns, frontend-design, react-best-practices

---

## Key Issues Found

| Component | Issue | Impact |
|-----------|-------|--------|
| Footer | `text-[18vw]` logo = 67.5px on 375px | Jarring scale |
| Manifesto | `text-[7.5vw]` = 28px on 375px | Too small for serif |
| Hero | `11vw` clamp rate too aggressive | Oversized on mobile |
| Values | `-me-[11vw]` divider overflow | Content clipped |
| All sections | No `sm:` breakpoint usage | Abrupt md: jumps |
| Images | Fixed `vh` heights | Too tall on mobile |

---

## Implementation Plan

### Phase 1: Global Typography (Critical Path)

**File:** `src/index.css`

```css
/* Current */
.t-hero { font-size: clamp(3.25rem, 11vw, 12rem); }
.t-section { font-size: clamp(2.25rem, 6.5vw, 6rem); }
.t-divider { font-size: clamp(4.5rem, 19vw, 19rem); }
.hero-sans { font-size: clamp(2.5rem, 8vw, 7.5rem); }

/* Updated - add +Xrem addend for steeper mobile curves */
.t-hero { font-size: clamp(2.75rem, 8vw + 1rem, 12rem); }
.t-section { font-size: clamp(2rem, 5vw + 0.75rem, 6rem); }
.t-divider { font-size: clamp(3.5rem, 15vw + 1rem, 19rem); }
.hero-sans { font-size: clamp(2.25rem, 6vw + 0.5rem, 7.5rem); }
```

Also update RTL variants:
```css
:root[dir='rtl'] .hero-sans { font-size: clamp(2.5rem, 8vw + 0.5rem, 9rem); }
:root[dir='rtl'] .t-hero { font-size: clamp(3rem, 10vw + 1rem, 13rem); }
```

Add safe-area handling for notched devices:
```css
@layer base {
  :root {
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
  }
}
```

---

### Phase 2: Footer.tsx (Most Visible Issue)

**Line 35:** Replace raw `18vw` with clamped value
```tsx
// Before
className="mt-4 block font-display text-[18vw] leading-[0.82] tracking-tight md:text-[11rem]"

// After
className="mt-4 block font-display text-[clamp(3rem,12vw,11rem)] leading-[0.82] tracking-tight"
```

**Line 80-83:** CornerMark mobile sizing
```tsx
className="absolute bottom-4 end-4 text-2xl text-cream/80 sm:bottom-6 sm:end-6 sm:text-4xl md:end-10 md:text-6xl"
```

**Line 86-89:** SpinningBadge positioning
```tsx
className="absolute bottom-4 start-4 opacity-60 sm:bottom-6 sm:start-6 md:bottom-10 md:start-10"
```

---

### Phase 3: Values.tsx (Overflow Fix)

**Lines 22-28:** Hide divider words on mobile (they overflow and distract)
```tsx
// Add hidden sm:block to both divider words
className="divider-word t-divider absolute end-0 top-[16vh] z-0 -me-[11vw] text-ink hidden sm:block"
className="divider-word t-divider absolute end-0 top-[50vh] z-0 -me-[15vw] text-ink hidden sm:block"
```

**Lines 38-40 & 48-50:** Reduce image vh on mobile
```tsx
// First image
className="h-[48vh] w-full object-cover sm:h-[58vh] md:h-[64vh]"

// Second image  
className="h-[44vh] w-full object-cover sm:h-[52vh] md:h-[58vh]"
```

**Line 42:** Reduce overlap margin on mobile
```tsx
className="relative mt-6 w-full overflow-hidden sm:mt-8 md:order-2 md:-mt-24 md:ms-[-4vw] md:w-[52%]"
```

---

### Phase 4: Hero.tsx

**Line 31:** Adjust padding for small screens
```tsx
className="relative grid min-h-[100dvh] grid-cols-12 content-center gap-x-4 pt-24 pb-20 sm:pt-28 sm:pb-24"
```

**Line 58:** CornerMark sizing
```tsx
className="absolute bottom-8 end-6 text-xl text-ink/70 sm:text-2xl md:text-4xl"
```

**Line 61:** EdgeLabel - hide on mobile
```tsx
className="pointer-events-none absolute end-5 top-1/2 -translate-y-1/2 text-ink/60 hidden sm:block"
```

---

### Phase 5: Manifesto.tsx

**Line 15:** Fix typography scaling
```tsx
// Before
className="mt-10 max-w-5xl font-display text-[7.5vw] leading-[1.18] text-ink md:text-5xl md:leading-[1.22]"

// After
className="mt-10 max-w-5xl font-display text-[clamp(1.75rem,5vw+0.5rem,3rem)] leading-[1.18] text-ink sm:text-[clamp(2rem,6vw,3.5rem)] md:text-5xl md:leading-[1.22]"
```

---

### Phase 6: ui.tsx Components

**Container (line 8):**
```tsx
<div className={`mx-auto w-full max-w-[1600px] px-5 sm:px-6 md:px-10 ${className}`} {...p} />
```

**Section (line 12):**
```tsx
<section className={`py-20 sm:py-24 md:py-36 ${className}`} {...p} />
```

**Marquee (line 43):**
```tsx
className="mx-6 inline-flex items-center gap-6 font-display text-xl sm:text-2xl md:text-4xl"
```

---

### Phase 7: Remaining Sections

**Services.tsx line 27:**
```tsx
className="mt-6 font-display text-5xl leading-[0.92] tracking-tight sm:text-6xl md:text-8xl"
```

**Process.tsx line 54:**
```tsx
className="font-display text-6xl leading-[0.9] tabular-nums text-ink sm:text-7xl md:text-9xl"
```

**SelectedWork.tsx line 36:**
```tsx
className="mt-3 font-display text-4xl leading-[0.95] text-ink sm:text-5xl md:text-7xl"
```

**Menu.tsx line 94:**
```tsx
className="group flex items-center gap-4 text-start font-display text-4xl leading-[1.05] text-cream/90 sm:text-5xl md:text-8xl"
```

**CTASection.tsx line 21:**
```tsx
className="t-divider divider-word mt-6 text-center text-[clamp(3rem,18vw+1rem,28rem)] leading-[0.82]"
```

---

### Phase 8: Project Page

**Project.tsx line 37:**
```tsx
className="relative flex min-h-[480px] w-full flex-col justify-end overflow-hidden bg-ink text-cream h-[75vh] sm:h-[80vh] md:h-[88vh] pt-24 sm:pt-28"
```

**Line 58:**
```tsx
className="mt-6 font-display leading-[0.92] text-5xl sm:text-6xl md:text-8xl"
```

---

## Breakpoint Strategy

| Breakpoint | Width | Purpose |
|------------|-------|---------|
| Base | 0-639px | Mobile phones, smallest floors, single column |
| `sm:` | 640-767px | Large phones/tablets, intermediate sizing |
| `md:` | 768px+ | Desktop, full layouts, horizontal scroll |

---

## Critical Files (Implementation Order)

1. `src/index.css` - Global typography fixes cascade everywhere
2. `src/components/Footer.tsx` - Most jarring issue
3. `src/components/sections/Values.tsx` - Overflow fix
4. `src/components/sections/Hero.tsx` - First impression
5. `src/components/sections/Manifesto.tsx` - Serif sizing
6. `src/components/ui.tsx` - Container/Section spacing
7. All remaining section components

---

## Verification Plan

### Playwright Mobile Screenshots

Update `scripts/shots.mjs` to capture more mobile viewports:
```javascript
const shots = [
  // Add iPhone SE (375x667), iPhone 14 (390x844), iPad Mini (768x1024)
  { name: 'he-home-375', path: '/he', w: 375, h: 667, full: true },
  { name: 'he-home-390', path: '/he', w: 390, h: 844, full: true },
  { name: 'he-home-768', path: '/he', w: 768, h: 1024, full: true },
  // ... existing shots
];
```

### Manual Testing Checklist

- [ ] iPhone SE (375px) - smallest common viewport
- [ ] iPhone 14 (390px) - target mobile viewport
- [ ] iPad Mini (768px) - exactly at md: breakpoint
- [ ] Test Hebrew RTL + English LTR
- [ ] Verify menu overlay works on touch
- [ ] Confirm HorizontalProjects falls back to vertical
- [ ] Check footer logo doesn't overflow
- [ ] Verify Values divider words don't clip
- [ ] Test reduced-motion: all animations disabled
- [ ] Lighthouse mobile score (target 90+)
- [ ] axe accessibility scan passes

### Compare with Reference

Run Playwright on normalisboring.es at 390x844 to compare mobile patterns.

---

## What We're NOT Changing

1. **HorizontalProjects fallback** - Already works perfectly
2. **Cursor/CursorBlob** - Already disabled on touch
3. **Menu overlay architecture** - Just sizing refinements
4. **Animation system** - Already respects prefers-reduced-motion
5. **RTL/i18n** - Already uses logical properties

---

## Estimated Effort

- Phase 1-2: ~30 mins (global CSS + Footer)
- Phase 3-5: ~45 mins (Values, Hero, Manifesto)
- Phase 6-8: ~45 mins (ui.tsx + remaining sections)
- Verification: ~30 mins (Playwright + manual)

**Total: ~2.5 hours**

---

## GAMOS Fallback Status

GAMOS project was not found. **FALLBACK APPROACH IS NOT NEEDED** - the primary responsive approach is fully viable. All desktop components adapt cleanly to mobile with the typography and spacing fixes above.
