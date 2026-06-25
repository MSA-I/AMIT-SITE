# Amit Bar — Interior Design

Bilingual (Hebrew / English) portfolio site for **Amit Bar**, a boutique interior-design studio
specialising in luxury apartments, private homes, and commercial spaces.

A full redesign of the original `abdesigner.co.il` — real content and photography migrated, rebuilt
as a fast, modern single-page app with an architectural "mono + copper" aesthetic.

## Tech

React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · React Router · Lucide

## Develop

```bash
npm install
npm run dev          # http://localhost:3000  (defaults to /he)
```

## Build

```bash
npm run build
npm run preview
```

## Project photos

Project imagery lives in `public/projects/<slug>/` (optimized WebP, full + thumb) and is indexed in
`src/data/projects.json`. To refresh from the live site:

```bash
npm run scrape
```

## Structure

- `src/i18n/` — Hebrew (canonical) + English dictionaries, language context (RTL/LTR).
- `src/pages/` — routed pages (`/he`, `/en`, `/:lang/portfolio`, `/:lang/portfolio/:slug`, about, services, process, contact, legal).
- `src/components/` — layout, navbar, footer, shared UI primitives, sections.
- `scripts/scrape-assets.mjs` — migration scraper + image optimizer.

See `CLAUDE.md` for the design system and contribution rules.

## Languages

Hebrew is the default (RTL). English (LTR) is available via the navbar switch and at `/en`.
Layout uses CSS logical properties so it mirrors cleanly between directions.
