# CLAUDE.md — Amit Bar Interior Design (v2)

Project constitution. Keep it short; update it when these rules change.

> **Before starting any work, read [`PROGRESS.md`](./PROGRESS.md)** — the agent log + working rules and the
> current state of the site. When you finish a unit of work, append an entry to its Progress Log.

## What this is
Bilingual (Hebrew RTL default / English LTR) marketing + portfolio site for **Amit Bar**, a boutique
interior-design studio. Single React SPA. **v2** is an editorial-kinetic, near-monochrome experience
(reference level: normalisboring.es): one long cinematic scroll home + separate project & contact pages.
Content and ~70 real project photos were migrated from the original WordPress site (`abdesigner.co.il`).

## Inspiration source
All design inspiration for this project is taken from the reference clone at
`D:\משה פרוייקטים\פיתוח אתרים\Normal-is-Boring-clone` (a read-only 1:1 static mirror of normalisboring.es).
Study its structure, motion, and section rhythm there and reproduce the *technique* adapted to Amit's brand
(monochrome palette, Bodoni / Frank Ruhl, Hebrew/English RTL, Amit's real photos). Never copy its content,
images, colours, or fonts, and never edit that folder.

## Stack
- React 19 + TypeScript (strict) + Vite 6
- Tailwind CSS v4 (`@tailwindcss/vite`, tokens in `src/index.css` `@theme`)
- **GSAP + ScrollTrigger** (scroll-driven motion) + **Lenis** (smooth scroll)
- Framer Motion (overlay/menu/cursor leaf components only — never mixed with ScrollTrigger in one tree)
- React Router v7, Lucide icons. No backend (contact → WhatsApp + mailto).

## Commands
- `npm run dev` / `npm run build` / `npm run preview`
- `npm run scrape` — re-download + optimize project photos → `public/projects/` + `src/data/projects.json`
- `node scripts/shots.mjs` / `node scripts/a11y.mjs` — screenshots / axe scan (need dev `playwright`)

## Structure
- `src/i18n/` — `he.ts` (canonical) + `en.ts` (mirror, typed to `Dict`) + `context.tsx`. All copy lives here.
- `src/data/projects.ts` (+ generated `projects.json`) — 6 real photo collections (grouped by upload batch; see history). Use `title()`, `brief()`, `getProject()`.
- `src/motion/` — `anim.tsx` (`Reveal`, `RevealText`, `useParallax`, `gsap`/`ScrollTrigger`, `prefersReduced`); `smooth.ts` (Lenis: `useSmoothScroll`, `resetScroll`, `scrollToEl`, `stopScroll`).
- `src/components/` — `Layout` (wires smooth-scroll + cursor + intro + page-transition + menu), `Menu` (header + overlay), `Footer`, `Cursor`, `IntroLoader`, `PageTransition`, `Seo`, `ContactForm`, `Lightbox`, `ui.tsx` (primitives).
- `src/components/sections/` — the home scroll sections (Hero, Manifesto, About, Values, SelectedWork, Services, Materials, Process, Testimonials, ContactSection).
- `src/pages/` — `Home` (composes sections), `Project`, `Contact`, `Privacy`, `Accessibility`, `NotFound`.
- `src/router.tsx` — `/:lang` (index Home, `portfolio/:slug`, `contact`, legal, `*`); `/` → `/he`.

## Design system (LOCKED — editorial-kinetic, near-monochrome)
- **Palette:** cream `#F2EEE6`, ink `#0E0E0E`, paper `#FFFFFF`, line `#D9D4C8`, muted `ink-soft #4A4742`. ONE accent **sage `#6E8B7B`** used ONLY tiny: the `.accent-dot`, the `®`, hover/active. Never large sage text/areas.
- **Type:** display = serif (Marcellus LTR / Frank Ruhl Libre RTL, via `font-display`, auto by `dir`; Marcellus is single-weight, no italic - never faux-oblique it); ui/labels = Manrope (LTR) / Assistant (RTL) via `font-sans` + the `.u-label` class. Big headings: `font-display`, sized by the `.t-*` clamp tokens in `src/index.css`, tight leading.
- **Mixed-type move (LTR only):** uppercase `font-sans` + an *italic* `font-display` emphasis word. Hebrew has no italic → use weight/size contrast.
- **Color-block rhythm:** sections are self-contained and alternate light/dark via `data-theme="cream|ink|paper"` (dark = `bg-ink text-cream`). Never place two `ink` sections adjacent. The fixed header adapts its color to the section under it (shared `useHeaderTheme` hook used by `Menu` + `ScrollLogo`).
- **Shape:** no rounded corners except pill buttons. Hairlines over shadows. Low density, big whitespace.

## Motion rules
- All scroll motion goes through `src/motion` helpers (which already guard `prefers-reduced-motion`). Use `Reveal` / `RevealText` for reveals, `useParallax` for images. Never add raw `window` scroll listeners.
- Reduced-motion: Lenis/cursor/intro/transitions all disabled; content renders static and fully visible. Verify this path.
- One marquee max per page (e.g. testimonials names, or the home word strip). Custom cursor + intro loader are additive and fully degradable (off on touch/reduced-motion); native cursor stays for a11y.

## RTL / i18n
- Logical Tailwind props only (`ps/pe/ms/me/start/end/text-start/text-end`); never `pl/pr/ml/mr/left/right`. Alternate layouts with `md:order-*`, not direction hacks.
- Links via `LangLink` / `localePath(lang, path)`. `LanguageProvider` sets `document.dir`/`lang`.

## Anti-slop (enforced)
- **Zero em-dash (—) / en-dash (–)** in visible text. Hyphen only.
- Real photos only (`/projects/...`). No fake stats. One sage accent, tiny. Every `<img>` has alt.
- Target: `npm run build` clean, **axe = 0 violations** (`scripts/a11y.mjs`) on home/project/contact both languages.

## Content / brand facts
Phone `+972-50-293-6373` · Email `Amit@abdesigner.co.il` · Instagram `@ab_designer._` · materials: brass, wood, concrete, vegetation.
