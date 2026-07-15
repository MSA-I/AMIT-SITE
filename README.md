# Amit Bar - Interior Design

Bilingual (Hebrew / English) portfolio site for **Amit Bar**, a boutique interior-design studio
specialising in luxury apartments, private homes, and commercial spaces.

A full redesign of the original `abdesigner.co.il` - real content and photography migrated, rebuilt
as a fast, modern single-page app. **v3** is an editorial-kinetic, near-monochrome experience:
the home page is one pinned **horizontal journey** (eight chapters driven by vertical scroll,
mirrored travel in RTL), wrapped in cinematic chrome - a letter-cascade preloader that hands off
pixel-exact to a fixed `mix-blend-difference` frame, a pill menu, an "explore" cursor, and a footer
whose giant didone "BAR" letterforms stretch on scroll via MorphSVG.

## Tech

React 19 · TypeScript · Vite 6 · Tailwind CSS v4 · GSAP (ScrollTrigger / SplitText / MorphSVG) ·
Lenis smooth scroll · Framer Motion (overlay leaves only) · React Router v7 · Lucide

## Develop

```bash
npm install
npm run dev          # http://localhost:3000  (defaults to /he)
```

The opening preloader runs on every full load; append `?instant` (or set the
`ab-intro-shown` sessionStorage key) to skip it during development/automation.

## Build

```bash
npm run build
npm run preview      # http://localhost:4173
```

## Verification gates

All Playwright-based, run against the dev server (a11y runs against preview):

```bash
node scripts/home-check.mjs     # horizontal journey engine: pin, RTL travel, accordion, mobile, reduced-motion
node scripts/intro-check.mjs    # preloader: replay on load, letter cascade, hero reveal after the curtain
node scripts/smoke-chrome.mjs   # chrome: preloader->frame landing (<0.1px), pill, menu, cursor
node scripts/verify-footer.mjs  # footer wordmark morph + statics (screenshots go to the OS temp dir)
node scripts/a11y.mjs           # axe scan, target 0 violations on every route in both languages
```

## Project photos

Project imagery lives in `public/projects/<slug>/` (optimized WebP, full + thumb) and is indexed in
`src/data/projects.json`. To refresh from the live site:

```bash
npm run scrape
```

Brand favicons are generated from the real AB monogram: `node scripts/favicon.mjs`.

## Structure

- `src/i18n/` - Hebrew (canonical) + English dictionaries, language context (RTL/LTR).
- `src/motion/` - the motion layer: `HorizontalStage` (pinned journey engine), `stageContext`
  (numeric containerAnimation edges - see the note below), reveal helpers, `FlipMedia`, Lenis wiring.
- `src/components/sections/panels/` - the eight home chapters (hero, images, statement, dark,
  strip, values, projects accordion + manifesto).
- `src/components/` - chrome: `Preloader`, `FixedFrame`, `MenuPill` + `MenuOverlay`, `Cursor`,
  `Footer` + `footer/BarWordmark` (hand-drawn didone SVG with morph pairs).
- `src/pages/` - routed pages (`/:lang`, `portfolio`, `portfolio/:slug`, `about`, `contact`, legal).
- `scripts/` - migration scraper, favicon generator, verification gates.

**RTL note:** GSAP string trigger positions (`'left 80%'`) never fire when the horizontal travel is
mirrored; every in-stage trigger uses numeric page-scroll edges via `stageEdge()` instead.

See `CLAUDE.md` for the design system and contribution rules, and `PROGRESS.md` for the agent
log and current state.

## Languages

Hebrew is the default (RTL - the journey travels right-to-left). English (LTR) is available via the
menu switch and at `/en`. Layout uses CSS logical properties so it mirrors cleanly between
directions.
