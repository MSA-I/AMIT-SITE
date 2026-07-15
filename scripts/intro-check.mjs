// Verifies: preloader replays on EVERY load; hero texts wait for the curtain
// and animate as it lifts. Run from the repo dir.
import { chromium } from 'playwright';

const SHOTS = process.env.SHOT_DIR ?? '.';
const browser = await chromium.launch();
let fail = 0;
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? '[ok]' : '[FAIL]'} ${name}${extra ? ' - ' + extra : ''}`);
  if (!cond) fail++;
};

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

// --- load 1: fresh (no flag) -----------------------------------------------
await page.goto('http://localhost:3000/he', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.preloader', { timeout: 8000 });
ok('load 1: preloader appears', true);

// hero texts must NOT be mounted while the curtain runs
const heroDuring = await page.evaluate(() => !!document.querySelector('#p-hero h1'));
ok('hero h1 absent under the curtain', !heroDuring);

// chars actually animate: sample the LAST glyph (staggered - it moves latest)
const glyphX = () =>
  page.evaluate(() => {
    const gs = document.querySelectorAll('.pl-char > span');
    const g = gs[gs.length - 1];
    if (!g) return null;
    const t = getComputedStyle(g).transform;
    return t === 'none' ? 0 : Math.round(new DOMMatrixReadOnly(t).m41);
  });
await page.waitForTimeout(700);
const x1 = await glyphX();
await page.waitForTimeout(700);
const x2 = await glyphX();
ok('preloader chars animating', x1 !== null && (x1 !== x2 || x1 !== 0), `x ${x1} -> ${x2}`);
await page.screenshot({ path: `${SHOTS}/intro-mid.png` });

// wait for the curtain to finish
await page.waitForFunction(
  () => {
    const p = document.querySelector('.preloader');
    return !p || getComputedStyle(p).visibility === 'hidden' || getComputedStyle(p).opacity === '0';
  },
  { timeout: 20000 },
);
ok('curtain lifted', true);

// hero texts mount + animate now: word spans exist and settle to y=0 visible
await page.waitForSelector('#p-hero h1 [data-w]', { timeout: 5000 });
await page.waitForTimeout(300);
const midRise = await page.evaluate(() => {
  const w = document.querySelector('#p-hero h1 [data-w]');
  const t = getComputedStyle(w).transform;
  return t === 'none' ? 0 : new DOMMatrixReadOnly(t).m42;
});
await page.waitForTimeout(3000);
const detail = await page.evaluate(() => {
  const ws = [...document.querySelectorAll('#p-hero h1 [data-w]')];
  return ws.map((w) => {
    const t = getComputedStyle(w).transform;
    const y = t === 'none' ? 0 : Math.round(new DOMMatrixReadOnly(t).m42);
    return `${w.textContent?.slice(0, 8)}:${y}`;
  });
});
const settled = detail.length > 0 && detail.every((d) => Math.abs(parseInt(d.split(':').pop(), 10)) < 2);
ok('hero words revealed after curtain (settled y=0)', settled, `mid-rise y=${Math.round(midRise)} | ${detail.join(' ')}`);
await page.screenshot({ path: `${SHOTS}/intro-hero-after.png` });

// --- load 2: reload - preloader must REPLAY (no session stamp) --------------
await page.reload({ waitUntil: 'domcontentloaded' });
let replay = true;
try {
  await page.waitForSelector('.preloader', { timeout: 8000 });
} catch {
  replay = false;
}
ok('load 2: preloader replays on reload', replay);

// --- skip overrides still work ----------------------------------------------
const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx2.addInitScript(() => sessionStorage.setItem('ab-intro-shown', '1'));
const p2 = await ctx2.newPage();
await p2.goto('http://localhost:3000/he', { waitUntil: 'networkidle' });
const skipped = await p2.evaluate(() => !document.querySelector('.preloader'));
const heroNow = await p2.evaluate(() => !!document.querySelector('#p-hero h1'));
ok('flag override skips + hero mounts immediately', skipped && heroNow);
await ctx2.close();

ok('no page errors', errors.length === 0, errors.join(' | '));
await ctx.close();
await browser.close();
console.log(fail === 0 ? '\nVERDICT: PASS' : `\nVERDICT: FAIL (${fail})`);
