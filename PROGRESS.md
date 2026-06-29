# PROGRESS.md — Agent log & working rules

> **Read this first, before any work.** Then read `CLAUDE.md` (the project constitution — it wins on any
> conflict). When you finish a unit of work, **append an entry to the Progress Log** at the bottom.
> קובץ זה נקרא בתחילת כל עבודה; בסיום מוסיפים רשומה ל-Progress Log.

---

## How to use this file
1. **At start:** read the Rules below + the latest Progress Log entries so you know the current state and what not to break.
2. **At end:** add a dated entry to the Progress Log (newest on top) using the template. Keep entries short and factual.
3. This file is documentation only — never put secrets or generated artifacts here.

---

## Rules

### Forbidden (do NOT)
- **Do not edit the reference clone** at `D:\משה פרוייקטים\פיתוח אתרים\Normal-is-Boring-clone`. It is a read-only 1:1 mirror of normalisboring.es — study patterns there, never modify it, never copy its content/images/colours/fonts.
- **No em-dash (—) or en-dash (–)** in visible text. Hyphen only.
- **No physical-direction Tailwind props** in layout (`pl/pr/ml/mr/left/right`, `text-left/right`). Use logical (`ps/pe/ms/me/start/end/text-start/text-end`). *Exception:* an element positioned by raw `clientX/clientY` (e.g. a cursor follower) must anchor with physical `left-0/top-0`.
- **Never mix Framer Motion and GSAP ScrollTrigger in one component tree.** Framer Motion = overlay/menu/cursor leaf components only; everything scroll-driven goes through `src/motion`.
- **No raw `window` scroll listeners.** Use the `src/motion` helpers (they already guard `prefers-reduced-motion`). (A `mousemove` listener for a pointer follower is fine.)
- **No two adjacent `data-theme="ink"` sections** (they merge into one dark slab and the header colour stops toggling).
- **One marquee max per page.**
- **No large sage areas** — the single sage accent is tiny only (`.accent-dot`, `®`, hover/active).
- **Real photos only** (`/projects/...`), **every `<img>` has alt**, no fake stats.
- **Do not commit/push unless the user explicitly asks.** Do not commit build artifacts (`dist/`, `tsconfig.tsbuildinfo` are gitignored) or stray empty files. Work on `main` (repo convention).

### Allowed / expected (DO)
- **Inspiration** comes from the reference clone above — reproduce the *technique/structure/motion*, adapted to Amit's brand (monochrome cream/ink/paper, Bodoni / Frank Ruhl Libre, Hebrew/English RTL, Amit's real photos).
- **Reuse, don't reinvent:**
  - Motion: `src/motion/anim.tsx` (`Reveal`, `RevealText`, `RevealLines` [RTL-safe], `useParallax`, `gsap`, `ScrollTrigger`, `prefersReduced`); `src/motion/smooth.ts` (Lenis); `src/motion/FlipMedia.tsx` (`variant`: upDown/downUp/leftRight/rightLeft); `src/motion/useHeaderTheme.ts` (header colour vs section under it).
  - UI primitives in `src/components/ui.tsx`: `Container`, `Section`, `Eyebrow`, `EdgeLabel`, `Marquee`, `LangLink`, `SlideLabel`, `CornerMark`, `FillButton`, `EASE_EXPO`, `btn*` classes.
- **All copy lives in `src/i18n/`** — `he.ts` is canonical, `en.ts` mirrors it (typed to `Dict`). Never hard-code visible strings in components.
- **Logo wordmarks must use `dir="ltr"`** (the Latin "AMIT BAR" reverses under RTL otherwise).
- **Persistent header** (`Menu` + `ScrollLogo`) re-binds on the `amit:pageready` window event that `Layout` fires after a route mounts — keep that contract if you touch navigation/transitions.

### Verify before you call it done (gates)
- `npx tsc -b` clean · `npm run build` clean.
- `node scripts/a11y.mjs` → **axe = 0 violations** on home/about/portfolio/project/contact in **both** languages (needs the preview server on `:4173`).
- Reduced-motion path renders static + fully visible (test `reducedMotion: 'reduce'`).
- Check both `he` (RTL) and `en` (LTR).

---

## Current state (snapshot)
- **Stack:** React 19 + TS (strict) + Vite 6 + Tailwind v4 + GSAP/ScrollTrigger + Lenis + Framer Motion + React Router v7. No backend.
- **Home flow:** Hero (logo stage) → IntroTitles → FlipShowcase → Values (interactive cursor image-swap) → one marquee → HorizontalProjects → ProjectsManifesto → CTASection → ContactSection.
- **Signature moves:** logo shrinks into the header on scroll (`ScrollLogo`), interactive 3-values, rich full-screen menu (featured project + project list), flip-reveal variety, direction-aware `FillButton`.
- **Inner pages:** About (Manifesto → About → Process → Values → Services → Materials → Testimonials → CTA) and Project detail (cover + flip-variety gallery + Lightbox + related).
- **Latest commits:** `965d2fe` (port), `714f204` (code-review fixes). Branch `main`, working tree clean.

---

## Key decisions (this session, 2026-06-29)
- **The reference clone is the inspiration source and is READ-ONLY.** A separate, exact 1:1 static mirror of
  normalisboring.es was created at `D:\משה פרוייקטים\פיתוח אתרים\Normal-is-Boring-clone` (decision: a static
  mirror of the whole site, not a rebuild). It is not part of this repo. Never edit it; study patterns only.
- **Bring the reference's kinetic experience into the Amit site, but not as a copy** — reproduce technique +
  structure, keep Amit's brand. Confirmed: scope = **full experience + inner pages**; palette = **strict Amit
  monochrome** (cream/ink/paper + Bodoni / Frank Ruhl, tiny sage); signature moves = **all four** (interactive
  3-values, rich full-screen menu, logo-shrink hero, flip + marquee + direction-aware button fills).
- **Keep the React 19 / Vite stack** — the project constitution wins over the reference's vanilla/WordPress code.
- **Header timing contract:** the persistent header (`Menu` + `ScrollLogo`) re-binds on the `amit:pageready`
  window event fired by `Layout` after a route mounts (shared `useHeaderTheme` hook).
- **Locked conventions reaffirmed:** logo wordmarks use `dir="ltr"`; no two adjacent `data-theme="ink"` sections;
  one marquee per page; verify (tsc/build/axe=0/reduced-motion) before declaring done; commit only when asked.

---

## Progress Log (newest first)

### 2026-06-29 — Added PROGRESS.md + CLAUDE.md pointer (uncommitted)
- What: created this agent log/rules file; `CLAUDE.md` now instructs agents to read it first.
- Why: user wants one place agents read at the start of work and append progress to.
- Verified: docs only.
- Follow-ups: commit when the user asks.

### 2026-06-29 — Created the read-only reference clone (context; separate folder, not this repo)
- What: an exact 1:1 static mirror of normalisboring.es at `D:\משה פרוייקטים\פיתוח אתרים\Normal-is-Boring-clone`
  (real HTML/CSS/JS/fonts/images, links localised; served via a local static server).
- Why: serves as the read-only inspiration reference for this project.
- Verified: served locally, visual + asset parity checked, axe baseline. **Do not edit it.**
- Follow-ups: none — reference only.

### 2026-06-29 — Code-review fixes (commit `714f204`)
- **What:** fixed 10 verified review findings — RTL Values follower (`left-0`); shared `useHeaderTheme` hook + `amit:pageready` event so the logo shrink-scrub & header colour re-bind after client-side navigation; scrub guarded to fine-pointer; menu `slice(1,6)` (no duplicate featured); added in-body `/about` link; `FillButton` reduced-motion fix + wired into the CTA; FlipShowcase→cream and moved About's Values so no two `ink` sections are adjacent; shared `EASE_EXPO`. Added the inspiration-source guideline to `CLAUDE.md`.
- **Verified:** tsc + build clean; axe = 0 both languages; focused Playwright checks pass; reduced-motion readable.

### 2026-06-29 — normalisboring kinetic port (commit `965d2fe`)
- **What:** brought the reference site's kinetic experience into the Amit site, monochrome + bilingual. New: `ScrollLogo`, `IntroTitles`, `FlipShowcase`, interactive `Values`, rich `Menu`, `FlipMedia` variants, RTL `RevealLines`, `FillButton`; `home` i18n namespace.
- **Verified:** build clean; axe = 0 on home/about/portfolio/project/contact in both languages; reduced-motion static.

---

## Entry template (copy when adding)
```
### YYYY-MM-DD — <short title> (<commit hash or "wip">)
- What: <what changed, files/areas>
- Why: <reason / which request or finding>
- Verified: <tsc/build/axe/playwright/reduced-motion results>
- Follow-ups: <anything left, or "none">
```
