// Mobile verification: the sub-1024 experience across the whole site.
// Matrix: 390x844 + 360x800 + 768x1024, he + en, all main routes, plus a
// reduced-motion 390 pass (layout truth: dead-space audit runs there).
// Checks: no x-overflow, frame-mark hidden below lg (visible on desktop),
// nothing RESTS under the fixed AB logo at section tops, the CTA divider
// word fits the viewport, and no giant dead vertical gaps in the stack.
// Run from the AMIT-SITE project dir. Dev server on :3000 (or BASE=...).
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const SHOT_DIR = process.env.SHOT_DIR ?? '.';
const SLUG = 'modern-penthouse';
const ROUTES = ['', '/portfolio', `/portfolio/${SLUG}`, '/about', '/contact'];
const VIEWPORTS = [
  { w: 390, h: 844, shots: true },
  { w: 360, h: 800, shots: false },
  { w: 768, h: 1024, shots: false },
];

let allOk = true;
const check = (tag, ok, detail) => {
  console.log(`  [${ok ? 'ok' : 'FAIL'}] ${tag}: ${detail}`);
  if (!ok) allOk = false;
};

// The pinned playwright build may lack its own chromium on this machine -
// fall back to the installed Chrome channel.
async function launch() {
  try {
    return await chromium.launch();
  } catch {
    return await chromium.launch({ channel: 'chrome' });
  }
}
const browser = await launch();

async function newPage(opts = {}) {
  const ctx = await browser.newContext(opts);
  await ctx.addInitScript(() => sessionStorage.setItem('ab-intro-shown', '1'));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console: ' + m.text());
  });
  return { ctx, page, errors };
}

// Nothing may REST under the fixed AB logo: scroll each section to its top
// resting position and probe what sits at the logo's center. Transient
// crossings mid-scroll are the accepted difference-blend aesthetic; a
// heading/paragraph/image parked under the logo is a bug.
async function collisionSample(page) {
  return page.evaluate(async () => {
    const logo = document.querySelector('.frame-logo');
    if (!logo) return { checked: 0, hits: [] };
    const lr = logo.getBoundingClientRect();
    const cx = lr.left + lr.width / 2;
    const cy = lr.top + lr.height / 2;
    const hits = [];
    const sections = [...document.querySelectorAll('section[data-theme]')];
    for (const s of sections) {
      s.scrollIntoView({ block: 'start', behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 450));
      // elementsFromPoint (plural): skip the frame itself (its logo link has
      // pointer-events:auto and would otherwise swallow every probe)
      const el = document.elementsFromPoint(cx, cy).find((e) => !e.closest('.frame'));
      const off = el?.closest('h1,h2,h3,h4,h5,h6,p,a,button,label,li,img,figure');
      if (off) {
        const id = s.id || s.dataset.theme + '#' + sections.indexOf(s);
        hits.push(`${id}: <${off.tagName.toLowerCase()}> "${(off.textContent || off.alt || '').trim().slice(0, 30)}"`);
      }
    }
    window.scrollTo(0, 0);
    return { checked: sections.length, hits };
  });
}

// Layout dead space (run under reduced motion so reveals do not skew rects):
// the largest vertical gap between consecutive visible content blocks.
async function deadSpace(page) {
  return page.evaluate(() => {
    const els = [
      ...document.querySelectorAll(
        'main h1, main h2, main h3, main p, main img, main a, main button, main li'
      ),
    ];
    const rects = els
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + scrollY, bottom: r.bottom + scrollY, w: r.width, h: r.height };
      })
      .filter((r) => r.h > 8 && r.w > 8)
      .sort((a, b) => a.top - b.top);
    let maxGap = 0;
    let at = 0;
    let cover = rects.length ? rects[0].bottom : 0;
    for (let i = 1; i < rects.length; i++) {
      const gap = rects[i].top - cover;
      if (gap > maxGap) {
        maxGap = gap;
        at = Math.round(cover);
      }
      cover = Math.max(cover, rects[i].bottom);
    }
    return { maxGap: Math.round(maxGap), at, blocks: rects.length };
  });
}

async function checkRoute(lang, route, vp) {
  const tag = `${lang}${route || '/'} @${vp.w}`;
  console.log(`\n== ${tag} ==`);
  const { ctx, page, errors } = await newPage({ viewport: { width: vp.w, height: vp.h } });
  await page.goto(`${BASE}/${lang}${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const base = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    markDisplay: (() => {
      const m = document.querySelector('.frame-mark');
      return m ? getComputedStyle(m).display : 'missing';
    })(),
    ctaWordW: (() => {
      const w = document.querySelector('.divider-word');
      return w ? Math.round(w.getBoundingClientRect().width) : null;
    })(),
  }));

  check('noXOverflow', base.scrollW <= base.innerW + 1, `scrollWidth=${base.scrollW} innerWidth=${base.innerW}`);
  check('markHidden', base.markDisplay === 'none', `.frame-mark display=${base.markDisplay} (expected none < 1024)`);
  if (base.ctaWordW !== null) {
    check('ctaWordFits', base.ctaWordW <= vp.w - 16, `divider word ${base.ctaWordW}px in ${vp.w}px viewport`);
  }

  const col = await collisionSample(page);
  check(
    'noRestingUnderLogo',
    col.hits.length === 0,
    col.hits.length ? col.hits.join(' | ') : `${col.checked} section tops clean`
  );

  if (vp.shots) {
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let i = 0; i < 5; i++) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(((total - vp.h) * i) / 4));
      await page.waitForTimeout(600);
      await page.screenshot({
        path: `${SHOT_DIR}/mobile-${lang}${route.replaceAll('/', '-') || '-home'}-${i}.png`,
      });
    }
  }

  check('errors', errors.length === 0, errors.length ? errors.join(' | ') : 'none');
  await ctx.close();
}

async function checkReducedMobile() {
  console.log('\n== HE / @390x844 (reduced motion: layout truth) ==');
  const { ctx, page, errors } = await newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  for (const route of ['', '/about']) {
    await page.goto(`${BASE}/he${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const gap = await deadSpace(page);
    check(
      `deadSpace${route || '/home'}`,
      gap.maxGap <= 844 * 0.6,
      `max gap ${gap.maxGap}px at y=${gap.at} (${gap.blocks} blocks, limit ${Math.round(844 * 0.6)}px)`
    );
  }
  check('errors', errors.length === 0, errors.length ? errors.join(' | ') : 'none');
  await ctx.close();
}

async function checkDesktopMarkVisible() {
  console.log('\n== HE / @1280x900 (frame-mark regression tripwire) ==');
  const { ctx, page } = await newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${BASE}/he`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const d = await page.evaluate(() => {
    const m = document.querySelector('.frame-mark');
    return m ? getComputedStyle(m).display : 'missing';
  });
  check('markVisibleDesktop', d !== 'none' && d !== 'missing', `.frame-mark display=${d} at 1280`);
  await ctx.close();
}

for (const vp of VIEWPORTS) {
  for (const lang of ['he', 'en']) {
    for (const route of ROUTES) {
      // full route sweep on phones; tablet gets the home + portfolio spot-check
      if (vp.w === 768 && route !== '' && route !== '/portfolio') continue;
      if (vp.w === 360 && !(lang === 'he' && (route === '' || route === '/contact'))) continue;
      await checkRoute(lang, route, vp);
    }
  }
}
await checkReducedMobile();
await checkDesktopMarkVisible();

await browser.close();
console.log('\nVERDICT:', allOk ? 'PASS' : 'FAIL');
process.exit(allOk ? 0 : 1);
