import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = process.env.SHOT_DIR || './shots';
mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:4173';

const shots = [
  { name: 'he-home', path: '/he', w: 1440, h: 900, full: true },
  { name: 'he-home-mobile', path: '/he', w: 390, h: 844, full: true },
  { name: 'en-home', path: '/en', w: 1440, h: 900, full: true },
  { name: 'he-about', path: '/he/about', w: 1440, h: 900, full: true },
  { name: 'en-about', path: '/en/about', w: 1440, h: 900, full: true },
  { name: 'he-projects', path: '/he/portfolio', w: 1440, h: 900, full: true },
  { name: 'en-projects', path: '/en/portfolio', w: 1440, h: 900, full: true },
  { name: 'he-project', path: '/he/portfolio/modern-penthouse', w: 1440, h: 900, full: true },
  { name: 'he-contact', path: '/he/contact', w: 1440, h: 900, full: true },
  { name: 'en-home-hero', path: '/en', w: 1440, h: 900, full: false },
];

const browser = await chromium.launch();
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(BASE + s.path, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(900);
  // nudge scroll to settle lazy images, then back to top for full-page capture
  await page.evaluate(async () => {
    await new Promise((r) => {
      let y = 0;
      const id = setInterval(() => {
        window.scrollTo(0, (y += 600));
        if (y > document.body.scrollHeight) { clearInterval(id); r(); }
      }, 60);
    });
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: s.full });
  console.log('shot', s.name);
  await ctx.close();
}
await browser.close();
console.log('done');
