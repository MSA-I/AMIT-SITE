# Mobile Experimental - תוכנית

## Context

פרויקט AMIT-SITE צריך **גרסת מובייל נסיונית** שתשכפל את חווית המובייל של normalisboring.es.
הסיבה: האתר הנוכחי הוא desktop-first עם GSAP/ScrollTrigger כבדים שלא מותאמים למובייל.
המטרה: לבנות פרויקט Vite נפרד ב-`/mobile-experimental/` שמממש mobile-first design.

---

## Playwright Research Findings

### Desktop vs Mobile - ההבדלים ב-normalisboring.es

| Aspect | Desktop | Mobile (390x844) |
|--------|---------|------------------|
| **Logo** | "NORMAL" top-left, "is BORING®" rotated bottom-right | Same positioning, smaller scale |
| **Hero text** | "ESPACIOS DE VIDA" with scramble animation, large | Same text, stacked vertically, ~60% smaller |
| **Navigation** | Hidden initially | "Menú" pill button appears on scroll (sticky) |
| **Typography** | Juana-Regular serif, 20px base | 16.6px base (~83% scale) |
| **Touch targets** | N/A | 44px minimum height (cookie buttons) |
| **Animations** | Complex scramble/reveal | Simpler opacity transitions |
| **Cookie banner** | Bottom-left overlay | Full-width bottom sheet |

### Mobile-Specific Patterns Observed

1. **Sticky Menu Button** - Black pill "Menú" appears after scrolling ~400px
2. **Text stacking** - Multi-line headings stack vertically instead of horizontal spread
3. **Simplified animations** - No complex scramble, just fade/slide
4. **Full-width sections** - No side margins, edge-to-edge content
5. **Larger touch zones** - All interactive elements min 44px

---

## Proposed Structure

```
/mobile-experimental/
├── index.html              # Entry point (HE default, RTL)
├── package.json            # Standalone Vite project
├── vite.config.ts          # Minimal Vite + React + Tailwind
├── tsconfig.json
├── public/
│   ├── favicon.svg         # Symlink → ../public/favicon.svg
│   └── projects/           # Symlink → ../public/projects/
├── src/
│   ├── main.tsx
│   ├── index.css           # Mobile-first Tailwind theme
│   ├── App.tsx             # Single-page app (no router needed initially)
│   │
│   ├── components/
│   │   ├── MobileLayout.tsx    # Touch-safe shell
│   │   ├── MobileHeader.tsx    # Sticky "Menu" pill on scroll
│   │   ├── MobileMenu.tsx      # Full-screen overlay menu
│   │   ├── MobileHero.tsx      # Simplified hero (no ScrollTrigger)
│   │   ├── MobileSection.tsx   # Generic section wrapper
│   │   └── TouchButton.tsx     # Min 44px touch target
│   │
│   ├── sections/
│   │   ├── Hero.tsx            # "AMIT BAR" + tagline
│   │   ├── Manifesto.tsx       # "ESPACIOS DE VIDA" equivalent
│   │   ├── Projects.tsx        # Horizontal swipe gallery
│   │   └── Contact.tsx         # Full-width CTA
│   │
│   ├── motion/
│   │   ├── mobile-anim.ts      # CSS-only animations (no GSAP)
│   │   └── use-touch.ts        # Touch gesture hooks
│   │
│   ├── i18n/                   # Symlink → ../src/i18n/
│   │
│   └── data/                   # Symlink → ../src/data/
│
└── README.md               # Development notes
```

---

## Asset Sharing Strategy

### Symlinks (reuse existing)
- `public/projects/` → `../public/projects/` (images)
- `src/i18n/` → `../src/i18n/` (dictionaries)
- `src/data/` → `../src/data/` (projects.json)
- `public/favicon.svg` → `../public/favicon.svg`

### Copied & Modified
- `src/index.css` - Mobile-specific Tailwind theme (same tokens, different scale)
- Components - Rewritten for touch-first UX

### Why Symlinks
- Single source of truth for content/translations
- Updates to main site auto-reflect in mobile
- No duplication of 7MB project images

---

## Typography Scale (Mobile)

Based on normalisboring.es mobile analysis:

| Element | Desktop (AMIT) | Mobile Experimental |
|---------|---------------|---------------------|
| **Hero heading** | clamp(3.25rem, 11vw, 12rem) | clamp(2rem, 8vw, 3.5rem) |
| **Section heading** | clamp(2.25rem, 6.5vw, 6rem) | clamp(1.5rem, 5vw, 2.5rem) |
| **Body** | 1rem (16px) | 1rem (16px) - same |
| **Labels** | 0.7rem | 0.75rem (slightly larger for touch) |

### RTL Considerations
- Same as main site: zero letter-spacing for Hebrew headings
- Higher line-height (1.85) for Hebrew body text

---

## Animation Strategy (Mobile)

### Remove
- GSAP ScrollTrigger (heavy, battery drain)
- Lenis smooth scroll (native scroll is better on touch)
- Custom cursor (native touch is correct)
- Complex reveal animations (distracting on small screen)

### Keep (CSS-only)
- Simple fade-in on scroll (IntersectionObserver + CSS)
- Page transitions (CSS transforms)
- Button hover/active states (touch feedback)

### New (Touch-specific)
- Swipe gestures for project gallery
- Pull-to-refresh feel (optional)
- Haptic feedback hints via CSS

```css
/* Mobile animation utilities */
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}
.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}
```

---

## Navigation (Mobile)

### Pattern: Sticky Pill Menu (like normalisboring.es)

1. **Initial state**: Logo only, no nav
2. **On scroll (>100px)**: Black pill "תפריט" / "Menu" appears top-right
3. **On tap**: Full-screen overlay with large touch links
4. **In overlay**: Language switch, all nav links, close X

```tsx
// MobileHeader.tsx concept
const [scrolled, setScrolled] = useState(false);
const [menuOpen, setMenuOpen] = useState(false);

useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 100);
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}, []);

return (
  <header className="fixed top-0 inset-x-0 z-50">
    <Logo />
    {scrolled && (
      <button 
        onClick={() => setMenuOpen(true)}
        className="fixed top-4 end-4 bg-ink text-cream px-4 py-2 rounded-full"
      >
        {t.nav.menu}
      </button>
    )}
    {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
  </header>
);
```

---

## Touch Interactions

### Minimum Touch Targets
All interactive elements: **min 44x44px** (Apple HIG) / **48x48dp** (Material)

### Gesture Support
| Gesture | Action |
|---------|--------|
| Swipe left/right | Navigate project gallery |
| Tap | Select/activate |
| Long press | (none - avoid complexity) |
| Pull down | (native refresh only) |

### Touch Feedback
```css
.touch-btn {
  min-height: 44px;
  min-width: 44px;
  -webkit-tap-highlight-color: transparent;
}
.touch-btn:active {
  transform: scale(0.97);
  opacity: 0.9;
}
```

---

## Color System (Unchanged)

Same tokens as main site - symlink or copy:

```css
--color-cream: #EDEDEA
--color-ink: #141414
--color-ink-soft: #565654
--color-paper: #FBFBFA
--color-line: #D2D2CE
--color-sage: #9A7B4F
```

---

## Implementation Steps

### Phase 1: Scaffold
1. Create `/mobile-experimental/` folder
2. Init Vite project with React + TypeScript + Tailwind v4
3. Setup symlinks to shared assets
4. Create mobile Tailwind theme (index.css)

### Phase 2: Core Components
1. MobileLayout (viewport meta, safe areas)
2. MobileHeader (sticky pill menu)
3. MobileMenu (full-screen overlay)
4. TouchButton (min 44px)

### Phase 3: Sections
1. Hero - simplified, stacked text
2. Manifesto - fade-in on scroll (IntersectionObserver)
3. Projects - horizontal swipe carousel
4. Contact - full-width CTA

### Phase 4: Polish
1. RTL support (test Hebrew)
2. Touch gesture refinement
3. Performance audit (Lighthouse mobile)
4. Comparison screenshots vs normalisboring.es

---

## Verification

After implementation, run:

```bash
# Start mobile dev server
cd mobile-experimental && npm run dev

# Playwright verification
node scripts/mobile-verify.mjs  # Compare to normalisboring.es mobile
```

Manual checks:
- [ ] Logo positioning matches reference
- [ ] Menu pill appears on scroll
- [ ] Typography scale feels native
- [ ] Touch targets are comfortable
- [ ] Swipe gestures work smoothly
- [ ] RTL Hebrew layout correct
- [ ] No GSAP/Lenis loaded (check network)

---

## Files to Create

| File | Purpose |
|------|---------|
| `mobile-experimental/package.json` | Vite + React deps |
| `mobile-experimental/vite.config.ts` | Dev server port 3100 |
| `mobile-experimental/index.html` | Entry, viewport meta |
| `mobile-experimental/src/index.css` | Mobile Tailwind theme |
| `mobile-experimental/src/main.tsx` | React entry |
| `mobile-experimental/src/App.tsx` | Main app |
| `mobile-experimental/src/components/*.tsx` | Mobile components |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Symlinks fail on Windows | Use `junction` or copy script |
| Font loading slow | Subset fonts for mobile |
| Touch detection false positives | Use proper touch media queries |
| i18n context mismatch | Import directly from shared path |

---

## Summary

Build a **standalone Vite project** in `/mobile-experimental/` that:
1. Reuses assets via symlinks (images, i18n, data)
2. Implements mobile-first components (no GSAP, native scroll)
3. Matches normalisboring.es mobile patterns (sticky menu, stacked text, touch-safe)
4. Supports RTL Hebrew natively
5. Runs on port 3100 alongside main dev server

---

## Screenshots Reference

Saved to `C:/Users/art1/AppData/Local/Temp/`:
- `nib-desktop-hero.png` - Desktop hero layout
- `nib-mobile-hero.png` - Mobile hero (390x844)
- `nib-mobile-scroll-*.png` - Mobile scroll sequence
- `nib-mobile-full.png` - Full mobile page
