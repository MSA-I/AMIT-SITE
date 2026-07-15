/**
 * verify-footer.mjs - evidence run for the morphing-wordmark footer.
 * Usage: node scripts/verify-footer.mjs [outDir]
 * Needs the dev server on :3000 and dev `playwright`.
 *
 * Checks per language (/he, /en):
 *   - #B_i_left `d` at footer entry vs page bottom (morph must progress)
 *   - strip / featured card / brand logo / legal row / badge present
 *   - RTL/LTR strip alignment (closing line at start, links at end)
 *   - console errors
 * Plus: client-side route change to /he/about (menu) -> morph still scrubbed,
 * and a reduced-motion pass -> `d` static at the stretched END state.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = 'http://localhost:3000';
// Screenshots go OUTSIDE the repo (arg > SHOT_DIR env > OS temp) - never
// leave generated artifacts in the working tree.
const OUT = process.argv[2] || process.env.SHOT_DIR || join(tmpdir(), 'amit-footer-shots');
mkdirSync(OUT, { recursive: true });

const results = [];
const ok = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  :: ' + detail : ''}`);
};

const D_REST = 'M 60 40 L 116 40 L 116 380 L 60 380 Z';

async function makePage(browser, reduced) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: reduced ? 'reduce' : 'no-preference',
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript(() => sessionStorage.setItem('ab-intro-shown', '1'));
  return { ctx, page, errors };
}

const dOf = (page) => page.evaluate(() => document.querySelector('#B_i_left')?.getAttribute('d') ?? null);

const atBottom = (page) =>
  page.evaluate(() => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4);

/** wheel-scroll (Lenis-realistic) until cond() is true or page bottom */
async function wheelUntil(page, cond, maxSteps = 160, delta = 1100, pause = 110) {
  for (let i = 0; i < maxSteps; i++) {
    if (await cond()) return true;
    if (await atBottom(page)) return cond();
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(pause);
  }
  return cond();
}

/** wait until Lenis momentum dies (scrollY stable across 300ms) */
async function settleScroll(page, timeout = 4000) {
  const t0 = Date.now();
  let last = -1;
  while (Date.now() - t0 < timeout) {
    const y = await page.evaluate(() => window.scrollY);
    if (y === last) return;
    last = y;
    await page.waitForTimeout(300);
  }
}

const svgTop = (page) =>
  page.evaluate(() => {
    const el = document.querySelector('footer [dir="ltr"] svg');
    return el ? el.getBoundingClientRect().top : Infinity;
  });

/** Phase 1: coarse-wheel until the wordmark is a bit over a viewport away and
 *  settle. The Lenis wheel target usually glides far PAST that point, so
 *  Phase 2 backs off (wheel up) until the wordmark is above the trigger start
 *  again, and Phase 3 creeps down in small steps so we sample "footer entry"
 *  inside the scrub range, not after it. */
async function approachFooterEntry(page) {
  const vh = (f) => page.evaluate((f) => window.innerHeight * f, f);
  const coarse = await wheelUntil(page, async () => (await svgTop(page)) <= (await vh(1.6)));
  await settleScroll(page);
  for (let i = 0; i < 80 && (await svgTop(page)) < (await vh(1.1)); i++) {
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(200);
  }
  await settleScroll(page);
  const fine = await wheelUntil(
    page,
    async () => (await svgTop(page)) <= (await vh(0.5)),
    120,
    200,
    260,
  );
  await settleScroll(page);
  return coarse && fine;
}

async function checkStatics(page, tag) {
  const s = await page.evaluate(() => {
    const f = document.querySelector('footer');
    const q = (sel) => !!f?.querySelector(sel);
    // hero-em = italic in LTR / weight-contrast in RTL (Hebrew has no italic)
    const closing = f?.querySelector('.font-display.hero-em');
    const tel = f?.querySelector('a[href^="tel:"]');
    return {
      tel: q('a[href^="tel:"]'),
      mail: q('a[href^="mailto:"]'),
      wa: q('a[href*="wa.me"]'),
      ig: q('a[href*="instagram.com"]'),
      card: q('a[data-cursor="explore"][href*="/portfolio/"] img'),
      logo: q('img[src*="ab-logo-ink"]'),
      privacy: q('a[href$="/privacy"]'),
      access: q('a[href$="/accessibility"]'),
      badge: q('.spinning-badge'),
      srOnly: (f?.textContent || '').includes('AMIT BAR'),
      closingRight: closing ? closing.getBoundingClientRect().right : null,
      telRight: tel ? tel.getBoundingClientRect().right : null,
      closingLeft: closing ? closing.getBoundingClientRect().left : null,
      telLeft: tel ? tel.getBoundingClientRect().left : null,
      dir: document.documentElement.dir,
    };
  });
  ok(`${tag} strip links (tel/mail/wa/ig)`, s.tel && s.mail && s.wa && s.ig);
  ok(`${tag} featured card link+img`, s.card);
  ok(`${tag} brand ink logo`, s.logo);
  ok(`${tag} legal links`, s.privacy && s.access);
  ok(`${tag} spinning badge`, s.badge);
  if (s.dir === 'rtl') {
    ok(`${tag} RTL strip aligned (closing at start=right, links at end=left)`,
      s.closingRight !== null && s.telRight !== null && s.closingRight > s.telRight,
      `closing.right=${Math.round(s.closingRight)} tel.right=${Math.round(s.telRight)}`);
  } else {
    ok(`${tag} LTR strip aligned (closing at start=left, links at end=right)`,
      s.closingLeft !== null && s.telLeft !== null && s.closingLeft < s.telLeft,
      `closing.left=${Math.round(s.closingLeft)} tel.left=${Math.round(s.telLeft)}`);
  }
}

const browser = await chromium.launch();

// ---------- motion pass: /he then /en ----------
for (const lang of ['he', 'en']) {
  const { ctx, page, errors } = await makePage(browser, false);
  await page.goto(`${BASE}/${lang}?instant`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(1200);

  const d0 = await dOf(page);
  ok(`${lang} wordmark present at load`, d0 !== null, `d0=${d0?.slice(0, 40)}`);

  const entered = await approachFooterEntry(page);
  ok(`${lang} reached footer`, entered);
  await page.waitForTimeout(1200); // let scrub(2) partially settle
  await page.screenshot({ path: `${OUT}/${lang}-footer-entry.png` });
  const d1 = await dOf(page);

  await wheelUntil(page, () => atBottom(page));
  await page.waitForTimeout(2600); // scrub settle at progress ~1
  await page.screenshot({ path: `${OUT}/${lang}-footer-bottom.png` });
  const d2 = await dOf(page);

  ok(`${lang} morph progresses (entry d != bottom d)`, d1 !== d2, `d1=${d1?.slice(0, 46)} | d2=${d2?.slice(0, 46)}`);
  ok(`${lang} morph moved from rest by bottom`, d2 !== D_REST, `d2=${d2?.slice(0, 46)}`);

  await checkStatics(page, lang);

  // ---------- route-change rebind check (he only) ----------
  // NOTE: stay scrolled down - the menu pill only turns clickable (is-visible)
  // past 0.8 * viewport height.
  if (lang === 'he') {
    await page.click('.menu-pill');
    await page.waitForTimeout(1200);
    await page.click(`#menu-overlay a[href="/${lang}/about"]`);
    await page.waitForTimeout(2600); // page transition + pageready + refresh
    const onAbout = await page.evaluate(() => location.pathname);
    ok('route change to /he/about', onAbout === `/${lang}/about`, onAbout);

    const dTop = await dOf(page);
    await wheelUntil(page, () => atBottom(page));
    await page.waitForTimeout(2600);
    await page.screenshot({ path: `${OUT}/he-about-footer-bottom.png` });
    const dAboutBottom = await dOf(page);
    ok('morph still works after route change', dTop !== dAboutBottom,
      `top=${dTop?.slice(0, 46)} | bottom=${dAboutBottom?.slice(0, 46)}`);
  }

  ok(`${lang} no console errors`, errors.length === 0, errors.slice(0, 4).join(' | '));
  await ctx.close();
}

// ---------- reduced-motion pass ----------
{
  const { ctx, page, errors } = await makePage(browser, true);
  await page.goto(`${BASE}/he?instant`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(900);
  const dBefore = await dOf(page);
  await page.evaluate(async () => {
    await new Promise((r) => {
      let y = 0;
      const id = setInterval(() => {
        window.scrollTo(0, (y += 700));
        if (y > document.documentElement.scrollHeight) { clearInterval(id); r(); }
      }, 50);
    });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/he-footer-reduced.png` });
  const dAfter = await dOf(page);
  // Reduced-motion renders the STRETCHED end state statically (Footer snaps
  // each _i path to its _f partner so the morph runway is never a dead void).
  const dFinal = await page.evaluate(
    () => document.querySelector('#B_f_left')?.getAttribute('d')?.trim() ?? null,
  );
  ok(
    'reduced-motion: d static at the stretched END state',
    dBefore === dAfter && !!dFinal && dAfter?.trim() === dFinal,
    `d=${dAfter?.slice(0, 46)}`,
  );
  ok('reduced-motion: no console errors', errors.length === 0, errors.slice(0, 4).join(' | '));
  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
