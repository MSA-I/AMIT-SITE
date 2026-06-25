import { chromium } from 'playwright';

const BASE = 'http://localhost:4173';
const pages = ['/he', '/en', '/he/portfolio', '/he/portfolio/modern-penthouse', '/he/contact'];
const browser = await chromium.launch();
const page = await browser.newContext({ viewport: { width: 1280, height: 900 } }).then((c) => c.newPage());

for (const p of pages) {
  await page.goto(BASE + p, { waitUntil: 'networkidle' });
  await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js' });
  const res = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document, { resultTypes: ['violations'] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help }));
  });
  console.log(`\n=== ${p} ===`);
  if (!res.length) console.log('  no violations');
  for (const v of res) console.log(`  [${v.impact}] ${v.id} x${v.n} — ${v.help}`);
}
await browser.close();
