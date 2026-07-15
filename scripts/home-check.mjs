// Home verification: the v3 pinned horizontal journey on / (he RTL + en LTR),
// the reduced-motion vertical fallback, and the 390x844 mobile stack.
// Run from the AMIT-SITE project dir so 'playwright' resolves. Dev server on :3000.
import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const SHOT_DIR = process.env.SHOT_DIR ?? '.';
const FRACTIONS = [0, 0.2, 0.4, 0.6, 0.8, 1]; // 6 travel steps
let allOk = true;
const check = (tag, ok, detail) => {
  console.log(`  [${ok ? 'ok' : 'FAIL'}] ${tag}: ${detail}`);
  if (!ok) allOk = false;
};

const browser = await chromium.launch();

async function newPage(opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...opts,
  });
  await ctx.addInitScript(() => sessionStorage.setItem('ab-intro-shown', '1'));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console: ' + m.text());
  });
  return { ctx, page, errors };
}

async function checkLang(lang) {
  console.log(`\n== ${lang.toUpperCase()} @1440x900 (horizontal journey) ==`);
  const { ctx, page, errors } = await newPage();

  await page.goto(`${BASE}/${lang}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500); // fonts.ready + page transition + rAF refresh
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  const info = await page.evaluate(() => {
    const track = document.querySelector('#hero .will-change-transform');
    const wrap = track ? track.parentElement : null;
    return {
      dir: document.documentElement.dir,
      trackW: track ? track.scrollWidth : null,
      wrapW: wrap ? wrap.clientWidth : null,
      pinSpacer: !!document.querySelector('.pin-spacer'),
      panels: document.querySelectorAll('#hero [data-hpanel]').length,
      slides: document.querySelectorAll('#hero [data-slide]').length,
      hlWords: document.querySelectorAll('#p-dark [data-hl]').length,
    };
  });
  const d = (info.trackW ?? 0) - (info.wrapW ?? 0);
  console.log(
    `  dir=${info.dir} trackW=${info.trackW} wrapW=${info.wrapW} distance=${d} panels=${info.panels} slides=${info.slides} hlWords=${info.hlWords}`
  );

  check('pin', info.pinSpacer, `pin-spacer present=${info.pinSpacer}`);
  check('panels', info.panels === 10, `10 HPanel sections expected (8 chapters, ch.08 = 3), got ${info.panels}`);

  // one probe per step: track x, first accordion slide width (vw), min dark
  // word opacity, and WHICH panel is actually on screen (transform-dependent:
  // catches "journey renders off-screen" bugs that pure trigger math misses)
  const probe = () =>
    page.evaluate(() => {
      const track = document.querySelector('#hero .will-change-transform');
      const m = track ? new DOMMatrixReadOnly(getComputedStyle(track).transform) : null;
      const slide = document.querySelector('#hero [data-slide]');
      const vw = window.innerWidth / 100;
      let minOp = null;
      document.querySelectorAll('#p-dark [data-hl]').forEach((w) => {
        const o = parseFloat(getComputedStyle(w).opacity);
        if (minOp === null || o < minOp) minOp = o;
      });
      // panel covering the viewport's center (screen coordinates, post-transform)
      let onScreen = null;
      document.querySelectorAll('#hero [data-hpanel]').forEach((p) => {
        const r = p.getBoundingClientRect();
        if (r.left <= window.innerWidth / 2 && r.right >= window.innerWidth / 2) {
          onScreen = p.id || '(anon)';
        }
      });
      return {
        x: m ? Math.round(m.m41) : null,
        slideVw: slide ? Math.round((slide.getBoundingClientRect().width / vw) * 10) / 10 : null,
        darkMinOp: minOp,
        onScreen,
      };
    });

  const steps = [];
  for (const f of FRACTIONS) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(d * f) + (f > 0 ? 5 : 0));
    await page.waitForTimeout(750); // lenis + scrub settle
    steps.push({ f, ...(await probe()) });
  }
  console.log(
    '  travel: ' +
      steps
        .map((s) => `f=${s.f} x=${s.x} on=${s.onScreen} acc=${s.slideVw}vw dark=${s.darkMinOp?.toFixed(2)}`)
        .join(' | ')
  );

  // rendered position: a panel must actually cover the viewport center at
  // every step; the journey starts on the hero and ends on the manifesto
  check(
    'onScreen',
    steps.every((s) => s.onScreen !== null),
    `panels at viewport center: ${steps.map((s) => s.onScreen).join(' -> ')}`
  );
  check('startsOnHero', steps[0].onScreen === 'p-hero', `panel@0=${steps[0].onScreen}`);
  check(
    'endsOnManifesto',
    steps[steps.length - 1].onScreen === 'p-manifesto',
    `panel@end=${steps[steps.length - 1].onScreen}`
  );

  const rtl = info.dir === 'rtl';
  const x0 = steps[0].x;
  check('x@0', Math.abs(x0 - (rtl ? -d : 0)) < 6, `x@0=${x0} expected ${rtl ? -d : 0}`);

  const dirSign = rtl ? 1 : -1; // rtl: -d -> 0 (increasing); ltr: 0 -> -d (decreasing)
  const monotonic = steps.every((s, i) => i === 0 || (s.x - steps[i - 1].x) * dirSign >= -2);
  const endX = steps[steps.length - 1].x;
  const reachedEnd = Math.abs(endX - (rtl ? 0 : -d)) < 20;
  check('monotonic', monotonic, `x path ${steps.map((s) => s.x).join(' -> ')}`);
  check('reachedEnd', reachedEnd, `end x=${endX} target=${rtl ? 0 : -d}`);

  // PanelDark statement: words fully opaque once its zone is passed (>= f 0.4)
  const darkBy = steps.find((s) => s.f >= 0.4);
  check(
    'darkOpaque',
    info.hlWords > 0 && darkBy.darkMinOp !== null && darkBy.darkMinOp >= 0.9,
    `min word opacity @f=${darkBy.f}: ${darkBy.darkMinOp} (words=${info.hlWords})`
  );

  // Accordion: first slide sits at ~15vw through the first half of travel and
  // has grown toward 57vw by the end (its zone lives in the final part of travel).
  const early = steps.filter((s) => s.f <= 0.4);
  const earlyNarrow = early.every((s) => s.slideVw !== null && s.slideVw < 20);
  const endWide = steps[steps.length - 1].slideVw;
  check(
    'accordion',
    info.slides === 6 && earlyNarrow && endWide !== null && endWide > 45,
    `first slide ${steps.map((s) => s.slideVw).join(' -> ')}vw (6 slides=${info.slides === 6})`
  );

  // vertical tail (CTA section) reachable below the stage
  const tail = await page.evaluate(async () => {
    const el = document.querySelector('#hero ~ section');
    if (!el) return { found: false };
    el.scrollIntoView({ block: 'start' });
    await new Promise((r) => setTimeout(r, 700));
    const rect = el.getBoundingClientRect();
    return {
      found: true,
      top: Math.round(rect.top),
      h: Math.round(rect.height),
      visible: rect.top > -rect.height / 2 && rect.top < window.innerHeight * 0.5 && rect.height > 100,
    };
  });
  check('tail', tail.found && tail.visible, `CTA section found=${tail.found} top=${tail.top} h=${tail.h}`);

  await page.screenshot({ path: `${SHOT_DIR}/home-${lang}-end.png` });
  check('errors', errors.length === 0, errors.length ? errors.join(' | ') : 'none');
  await ctx.close();
}

async function checkReduced() {
  console.log('\n== HE @1440x900 (prefers-reduced-motion) ==');
  const { ctx, page, errors } = await newPage({ reducedMotion: 'reduce' });
  await page.goto(`${BASE}/he`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const r = await page.evaluate(() => {
    const panels = [...document.querySelectorAll('#hero [data-hpanel]')];
    const imgs = [...document.querySelectorAll('#hero img')];
    const bad = imgs.filter((img) => {
      const rect = img.getBoundingClientRect();
      const cs = getComputedStyle(img);
      return rect.width < 2 || rect.height < 2 || parseFloat(cs.opacity) < 0.5 || cs.visibility === 'hidden';
    });
    return {
      pinSpacer: !!document.querySelector('.pin-spacer'),
      widths: panels.map((p) => Math.round(p.getBoundingClientRect().width)),
      vw: window.innerWidth,
      imgs: imgs.length,
      badImgs: bad.length,
      flipTops: document.querySelectorAll('#hero [data-flip-top]').length,
    };
  });
  check('noPin', !r.pinSpacer, `pin-spacer=${r.pinSpacer}`);
  check(
    'stacked',
    r.widths.length === 10 && r.widths.every((w) => Math.abs(w - r.vw) <= 2),
    `panel widths=${r.widths.join(',')} (vw=${r.vw})`
  );
  check('imgsVisible', r.imgs > 0 && r.badImgs === 0, `${r.imgs} imgs, ${r.badImgs} hidden/zero-size`);
  check('noFlipTops', r.flipTops === 0, `decorative flip top layers=${r.flipTops}`);
  check('errors', errors.length === 0, errors.length ? errors.join(' | ') : 'none');
  await page.screenshot({ path: `${SHOT_DIR}/home-reduced.png` });
  await ctx.close();
}

async function checkMobile() {
  console.log('\n== HE @390x844 (mobile stack) ==');
  const { ctx, page, errors } = await newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${BASE}/he`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const r = await page.evaluate(() => ({
    pinSpacer: !!document.querySelector('.pin-spacer'),
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    panels: [...document.querySelectorAll('#hero [data-hpanel]')].map((p) =>
      Math.round(p.getBoundingClientRect().width)
    ),
  }));
  check('stackedMobile', !r.pinSpacer && r.panels.length === 10, `pin=${r.pinSpacer} panels=${r.panels.length}`);
  check(
    'noXOverflow',
    r.scrollW <= r.innerW + 1,
    `documentElement.scrollWidth=${r.scrollW} innerWidth=${r.innerW}`
  );
  check('errors', errors.length === 0, errors.length ? errors.join(' | ') : 'none');
  await page.screenshot({ path: `${SHOT_DIR}/home-mobile.png` });
  await ctx.close();
}

await checkLang('he');
await checkLang('en');
await checkReduced();
await checkMobile();

await browser.close();
console.log('\nVERDICT:', allOk ? 'PASS' : 'FAIL');
process.exit(allOk ? 0 : 1);
