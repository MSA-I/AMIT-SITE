import { chromium } from 'playwright';

const BASE = 'http://localhost:4173';
const pages = ['/he', '/en', '/he/about', '/en/about', '/he/portfolio', '/en/portfolio', '/he/portfolio/modern-penthouse', '/he/contact', '/he/privacy'];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
// The preloader runs on EVERY load; the session key is the automation skip
// switch - without it the scan would catch the curtain (hero h1 not yet
// mounted) instead of the real page.
await ctx.addInitScript(() => sessionStorage.setItem('ab-intro-shown', '1'));
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

for (const p of pages) {
  await page.goto(BASE + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(1100);
  await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js' });
  const res = await page.evaluate(async () => {
    // The fixed frame (.frame) renders via mix-blend-mode:difference - its
    // white glyphs are INVERTED against whatever sits beneath, so axe's naive
    // fg/bg color-contrast math reports a false positive (e.g. "white on
    // paper" that actually renders near-black on paper). The frame is also
    // aria-hidden except the logo link (which has an aria-label). Excluding
    // it from the scan; everything else must still be 0 violations.
    // eslint-disable-next-line no-undef
    const r = await axe.run(
      { include: [['html']], exclude: [['.frame']] },
      { resultTypes: ['violations'] },
    );
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help }));
  });
  console.log(`\n=== ${p} ===`);
  if (!res.length) console.log('  no violations');
  for (const v of res) console.log(`  [${v.impact}] ${v.id} x${v.n} - ${v.help}`);
}
console.log('\n=== runtime errors ===');
console.log(errors.length ? errors.join('\n') : 'none');
await browser.close();
